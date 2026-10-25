import { describe, expect, it } from "vitest";
import { createHistory } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import { StorageUnavailableError } from "../persistence/store";
import { reducer, type EditorState } from "./reducer";
import { createSaver, hasUnsavedChange, type SaveStatus } from "./saveStatus";

// VO-016, VO-034, VO-049 (FR-028, FR-030, EC-09): unsaved is derived from a committed change with no completed write;
// "saved" is reported only after the newest revision is written, never for a change that was not persisted.
const fresh: EditorState = { history: createHistory(newDiagram("d1", "flowchart")), selection: null, draft: null, nameDraft: null, gesture: 0, armed: null, feedback: null };
const edited = reducer(fresh, { type: "commit", operation: { op: "addNode", shape: "rectangle", position: { x: 0, y: 0 } } });
const diagram = edited.history.present;

describe("hasUnsavedChange", () => {
  it("is false for a diagram with no committed change", () => {
    expect(hasUnsavedChange(fresh, "new")).toBe(false);
  });

  it("is true for a committed change while the write is under way or has failed", () => {
    for (const status of ["saving", "not-saved", "unavailable"] as const) expect(hasUnsavedChange(edited, status)).toBe(true);
  });

  it("is true for a committed change whose status is still new, as after a reload that has not persisted it", () => {
    expect(hasUnsavedChange(edited, "new")).toBe(true);
  });

  it("is false once the write has completed", () => {
    expect(hasUnsavedChange(edited, "saved")).toBe(false);
  });
});

describe("createSaver", () => {
  it("reports saved only after the newest revision is written", async () => {
    const statuses: SaveStatus[] = [];
    const releases: (() => void)[] = [];
    const saver = createSaver({
      write: () => new Promise<void>((resolve) => releases.push(resolve)),
      onStatus: (status) => statuses.push(status),
    });
    saver.enqueue(diagram);
    saver.enqueue(diagram);
    expect(statuses).toEqual(["saving", "saving"]);
    releases[0]?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(statuses).not.toContain("saved");
    releases[1]?.();
    await saver.settled();
    expect(statuses.at(-1)).toBe("saved");
    expect(statuses.filter((status) => status === "saved")).toHaveLength(1);
  });

  it("never reports saved when the write fails", async () => {
    const statuses: SaveStatus[] = [];
    const saver = createSaver({ write: () => Promise.reject(new Error("full")), onStatus: (status) => statuses.push(status) });
    saver.enqueue(diagram);
    await saver.settled();
    expect(statuses).toEqual(["saving", "not-saved"]);
  });

  it("reports unavailable when storage cannot be opened", async () => {
    const statuses: SaveStatus[] = [];
    const saver = createSaver({ write: () => Promise.reject(new StorageUnavailableError()), onStatus: (status) => statuses.push(status) });
    saver.enqueue(diagram);
    await saver.settled();
    expect(statuses).toEqual(["saving", "unavailable"]);
  });
});
