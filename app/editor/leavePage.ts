import { useEffect } from "react";
import type { EditorState } from "./reducer";
import { describeSelection, extraFieldsOf } from "./selection";
import { hasUnsavedChange, type SaveStatus } from "./saveStatus";

export { hasUnsavedChange };

/** True where a label, description or technology has been typed over and not confirmed; an editor left as it was holds nothing to lose. */
function halfTyped(state: EditorState): boolean {
  const { draft } = state;
  if (draft === null) return false;
  const diagram = state.history.present;
  const original = draft.field === "description" || draft.field === "technology" ? extraFieldsOf(diagram, draft.itemId).find(({ field }) => field === draft.field)?.value : describeSelection(diagram, draft.itemId).label;
  return draft.text !== original;
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
