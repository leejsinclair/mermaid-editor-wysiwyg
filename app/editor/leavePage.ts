import { useEffect } from "react";
import type { EditorState } from "./reducer";
import { describeSelection } from "./selection";
import { hasUnsavedChange, type SaveStatus } from "./saveStatus";

export { hasUnsavedChange };

/** True where a label has been typed over and not confirmed; a label editor opened and left as it was holds nothing to lose. */
function halfTyped(state: EditorState): boolean {
  const { draft } = state;
  return draft !== null && draft.text !== describeSelection(state.history.present, draft.itemId).label;
}

/** True where leaving the page would lose work: saving has failed or is under way, or a label is half typed (FR-044). */
export function unsafeToLeave(state: EditorState, saveStatus: SaveStatus): boolean {
  return hasUnsavedChange(state, saveStatus) || halfTyped(state) || state.nameDraft !== null;
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
