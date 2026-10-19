import { useEffect } from "react";
import { canUndo } from "../history/history";
import type { EditorState } from "./reducer";
import type { SaveStatus } from "./saveStatus";

/** True where leaving the page would lose work: saving has failed or is under way, or a label is half typed (FR-044). */
export function unsafeToLeave(state: EditorState, saveStatus: SaveStatus): boolean {
  const unsaved = saveStatus !== "saved" && (saveStatus !== "new" || canUndo(state.history));
  return unsaved || state.draft !== null || state.nameDraft !== null;
}

/** Asks the browser to confirm before the page is closed, reloaded or left, for as long as `unsafe` holds. */
export function useLeaveWarning(unsafe: boolean): void {
  useEffect(() => {
    if (!unsafe) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [unsafe]);
}
