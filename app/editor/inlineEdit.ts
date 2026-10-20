import type { Dispatch } from "react";
import type { InlineEdit } from "../rendering/shared/InlineLabelEditor";
import type { EditorAction, EditorState } from "./reducer";

/** The label being typed on the canvas, when the selected item or line is open for editing in place; otherwise null. */
export function inlineEditOf(state: EditorState, dispatch: Dispatch<EditorAction>): InlineEdit | null {
  const { draft } = state;
  if (draft?.origin !== "canvas" || draft.itemId !== state.selection) return null;
  const { itemId, field } = draft;
  return {
    itemId,
    text: draft.text,
    onChange: (text) => {
      dispatch({ type: "draft", itemId, text, origin: "canvas", ...(field && { field }) });
    },
    onCommit: () => {
      dispatch({ type: "confirmLabel" });
    },
    onCancel: () => {
      dispatch({ type: "cancelDraft" });
    },
    onBlur: (discard) => {
      dispatch({ type: "blurInlineEdit", discard });
    },
  };
}
