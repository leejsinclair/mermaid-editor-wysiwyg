import { commit, redo, seal, undo, type History } from "../history/history";
import { liftNotice } from "../model/c4/apply";
import type { LabelField, Operation } from "../model/operations";
import type { Ending, LineStyle } from "../model/types";
import { rejectionMessage } from "../validation/messages";
import { describeSelection, labelFieldOf } from "./selection";
import type { CommitOutcome } from "../validation/reasons";
import type { FeedbackMessage } from "../rendering/shared/Feedback";

export interface EditorState {
  readonly history: History;
  /** The selected item id, or none. */
  readonly selection: number | null;
  /** Counts Undo and Redo steps; the canvas cancels any drag in progress when it changes (EC-08). */
  readonly gesture: number;
  /** The diagram name being typed in the header, or none. */
  readonly nameDraft: string | null;
  /** The label being typed for the selected item, kept until it is confirmed or cancelled. */
  readonly draft: { readonly itemId: number; readonly text: string; readonly field?: LabelField; readonly origin: "panel" | "canvas" } | null;
  /** The connection type armed in the toolbox, drawn by the next handle-to-handle drag, or none. */
  readonly armed: { readonly line: LineStyle; readonly ending: Ending } | null;
  /** The latest message for the live region, or none. */
  readonly feedback: FeedbackMessage | null;
}

export type EditorAction =
  | { readonly type: "commit"; readonly operation: Operation; readonly mergeKey?: string }
  | { readonly type: "seal" }
  | { readonly type: "select"; readonly itemId: number | null }
  | { readonly type: "draft"; readonly itemId: number; readonly text: string; readonly field?: LabelField; readonly origin: "panel" | "canvas" }
  | { readonly type: "startInlineEdit" }
  | { readonly type: "blurInlineEdit"; readonly discard: boolean }
  | { readonly type: "confirmLabel" }
  | { readonly type: "nameDraft"; readonly text: string | null }
  | { readonly type: "confirmName" }
  | { readonly type: "cancelDraft" }
  | { readonly type: "release" }
  | { readonly type: "undo" }
  | { readonly type: "redo" }
  | { readonly type: "arm"; readonly connection: EditorState["armed"] }
  | { readonly type: "feedback"; readonly feedback: FeedbackMessage | null };

function rejectionFeedback(outcome: CommitOutcome): FeedbackMessage | null {
  return !outcome.committed && outcome.rejection ? { tone: "error", message: rejectionMessage(outcome.rejection) } : null;
}

function stepHistory(state: EditorState, action: { readonly type: "undo" | "redo" }): EditorState {
  const history = action.type === "undo" ? undo(state.history) : redo(state.history);
  if (history === state.history) return state;
  // The restored diagram may not hold the selected item any more.
  return { ...state, history, selection: null, draft: null, nameDraft: null, feedback: null, gesture: state.gesture + 1 };
}

/** Commits what is being typed, if anything. A rejection keeps the previous text and says why. */
function confirmDraft(state: EditorState, kind: "label" | "name"): EditorState {
  if (kind === "name") {
    if (state.nameDraft === null) return state;
    const { history, outcome } = commit(state.history, { op: "renameDiagram", name: state.nameDraft });
    return { ...state, history, nameDraft: null, feedback: rejectionFeedback(outcome) };
  }
  if (!state.draft) return state;
  const { itemId, text } = state.draft;
  const field = state.draft.field ?? labelFieldOf(state.history.present, itemId);
  const { history, outcome } = commit(state.history, { op: "setLabel", itemId, field, text });
  return { ...state, history, draft: null, feedback: rejectionFeedback(outcome) };
}

/** A change that moved things the person did not ask to move says so: deleting a boundary or node that held items. */
function successNotice(state: EditorState, operation: Operation, committed: boolean): FeedbackMessage | null {
  const diagram = state.history.present;
  if (!committed || operation.op !== "deleteItem" || diagram.type !== "c4") return null;
  const message = liftNotice(diagram, operation.itemId);
  return message === undefined ? null : { tone: "success", message };
}

function commitOperation(state: EditorState, operation: Operation, mergeKey?: string): EditorState {
  const { history, outcome } = commit(state.history, operation, mergeKey);
  const deleted = outcome.committed && operation.op === "deleteItem";
  return { ...state, history, selection: deleted ? null : state.selection, draft: null, feedback: rejectionFeedback(outcome) ?? successNotice(state, operation, outcome.committed) };
}

export function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "undo":
    case "redo":
      return stepHistory(state, action);
    case "nameDraft":
      return { ...state, nameDraft: action.text };
    case "confirmName":
      return confirmDraft(state, "name");
    case "select":
      // Selecting something else ends a run of merged moves (FR-019).
      return { ...state, history: action.itemId === state.selection ? state.history : seal(state.history), selection: action.itemId, draft: null };
    case "seal":
      return { ...state, history: seal(state.history) };
    case "draft":
      return { ...state, draft: { itemId: action.itemId, text: action.text, origin: action.origin, ...(action.field && { field: action.field }) } };
    case "startInlineEdit": {
      if (state.selection === null) return state;
      const diagram = state.history.present;
      const text = describeSelection(diagram, state.selection).label;
      if (text === undefined) return state;
      return { ...state, draft: { itemId: state.selection, text, field: labelFieldOf(diagram, state.selection), origin: "canvas" } };
    }
    case "blurInlineEdit":
      if (state.draft?.origin !== "canvas") return state;
      return action.discard ? { ...state, draft: null } : confirmDraft(state, "label");
    case "release":
      // Editing has been handed to another tab: whatever was half done is dropped (FR-050).
      return { ...state, draft: null, nameDraft: null, armed: null, gesture: state.gesture + 1 };
    case "cancelDraft":
      return { ...state, draft: null };
    case "confirmLabel":
      return confirmDraft(state, "label");
    case "arm":
      return { ...state, armed: action.connection };
    case "feedback":
      return { ...state, feedback: action.feedback };
    case "commit":
      return commitOperation(state, action.operation, action.mergeKey);
  }
}
