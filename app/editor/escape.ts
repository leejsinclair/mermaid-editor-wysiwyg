/** What the editor holds right now, as far as Escape is concerned. */
export interface EscapeInput {
  /** A label is being edited in place. */
  readonly labelEditing: boolean;
  /** A connection is in progress and waiting for its second shape. */
  readonly connecting: boolean;
  /** The selected item, or null when nothing is selected. */
  readonly selection: number | null;
  /** A text field has focus and keeps its own Escape. */
  readonly typing: boolean;
}

/** The operation one Escape press cancels, or null when Escape has nothing to do. */
export type EscapeTarget = "label" | "connection" | "selection";

/**
 * Decides what one Escape press does. Only the innermost active operation is cancelled: a label edit first, then a
 * connection in progress, and only when neither is active does the selection clear. A focused text field keeps its own Escape.
 */
export function escapeTarget(input: EscapeInput): EscapeTarget | null {
  if (input.typing) return null;
  if (input.labelEditing) return "label";
  if (input.connecting) return "connection";
  if (input.selection !== null) return "selection";
  return null;
}
