import { canUndo } from "../history/history";
import type { Diagram } from "../model/types";
import { StorageUnavailableError } from "../persistence/store";
import type { EditorState } from "./reducer";

/** `new` has had no committed change yet; `not-saved` and `unavailable` mean a write failed (data-model.md, Session state). */
export type SaveStatus = "new" | "saving" | "saved" | "not-saved" | "unavailable";

/**
 * True where a committed change has no completed write behind it: saving is under way or has failed, or the status is
 * still `new` although a change exists (as after a reload). Derived on each render, never stored (data-model.md).
 */
export function hasUnsavedChange(state: EditorState, saveStatus: SaveStatus): boolean {
  return saveStatus !== "saved" && (saveStatus !== "new" || canUndo(state.history));
}

interface SaverDependencies {
  readonly write: (diagram: Diagram) => Promise<void>;
  readonly onStatus: (status: SaveStatus) => void;
}

export interface Saver {
  /** Queues the diagram as the newest revision; the status stays `saving` until the newest one has been written. */
  enqueue(diagram: Diagram): void;
  /** Resolves once no write is in flight or waiting. */
  settled(): Promise<void>;
}

/**
 * Writes one diagram's revisions one at a time, the last one winning: while a write is in flight only the newest
 * waiting revision is kept. `saved` is reported only when the write of the latest enqueued revision has completed.
 */
export function createSaver({ write, onStatus }: SaverDependencies): Saver {
  let latest = 0;
  let waiting: { readonly diagram: Diagram; readonly revision: number } | undefined;
  let writing = false;
  let idle: Promise<void> = Promise.resolve();
  let release: () => void = () => undefined;

  const drain = async () => {
    writing = true;
    idle = new Promise<void>((resolve) => {
      release = resolve;
    });
    while (waiting) {
      const { diagram, revision } = waiting;
      waiting = undefined;
      try {
        await write(diagram);
        if (revision === latest) onStatus("saved");
      } catch (error) {
        onStatus(error instanceof StorageUnavailableError ? "unavailable" : "not-saved");
      }
    }
    writing = false;
    release();
  };

  return {
    enqueue(diagram) {
      latest += 1;
      waiting = { diagram, revision: latest };
      onStatus("saving");
      if (!writing) void drain();
    },
    settled: () => idle,
  };
}
