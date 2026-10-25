import { useEffect, type Dispatch } from "react";
import { en } from "../text/en";
import { escapeTarget, type EscapeTarget } from "./escape";
import type { EditorAction } from "./reducer";

/** True where the key belongs to the browser's own text editing, which has its own undo. */
function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/** True where the key was pressed on an HTML item of the diagram canvas. */
function onCanvas(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && inCanvas(target);
}

/** True where the key was pressed on any part of the diagram canvas, drawn in HTML or in SVG. */
function inCanvas(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(`[aria-label="${en.editor.canvas}"]`) !== null;
}

/** The id of the canvas item or line a key was pressed on, if it was pressed on one. */
function itemIdOf(target: EventTarget | null): number | null {
  const id = Number((target instanceof Element ? target.closest("[data-id]") : null)?.getAttribute("data-id"));
  return Number.isInteger(id) ? id : null;
}

/** What the editor holds right now, as far as the keyboard is concerned. */
export interface KeyboardContext {
  readonly selection: number | null;
  /** A label is being edited in place. */
  readonly labelEditing: boolean;
  /** A connection is armed and waiting for its second shape. */
  readonly connecting: boolean;
}

/** What a key press asks for: editor actions, or nothing. */
interface Shortcut {
  readonly actions?: readonly EditorAction[];
}

const NO_SHORTCUT: Shortcut = {};

/** Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z and Ctrl+Y redo. */
function historyShortcut(event: KeyboardEvent): Shortcut {
  const key = event.key.toLowerCase();
  if (key === "z") return { actions: [{ type: event.shiftKey ? "redo" : "undo" }] };
  return key === "y" && event.ctrlKey ? { actions: [{ type: "redo" }] } : NO_SHORTCUT;
}

/** F2 renames the item or line it was pressed on, selecting it first where focus is on one that is not selected. */
function renameShortcut(event: KeyboardEvent, selection: number | null): Shortcut {
  const itemId = itemIdOf(event.target) ?? selection;
  return itemId === null ? NO_SHORTCUT : { actions: [{ type: "select", itemId }, { type: "startInlineEdit" }] };
}

const CANCELS = new Map<EscapeTarget, EditorAction>([
  ["label", { type: "cancelDraft" }],
  ["connection", { type: "cancelConnection" }],
  ["selection", { type: "select", itemId: null }],
]);

/**
 * Escape cancels only the innermost active operation, as `escape.ts` decides; a focused text field keeps its own Escape.
 * A drag or a line being drawn is cancelled first, by the gesture itself, which marks the press handled.
 */
function escapeShortcut(event: KeyboardEvent, context: KeyboardContext): Shortcut {
  if (event.defaultPrevented) return NO_SHORTCUT;
  const target = escapeTarget({ ...context, typing: isTextEntry(event.target) });
  const action = target && CANCELS.get(target);
  return action ? { actions: [action] } : NO_SHORTCUT;
}

/** The shortcut for a key press, or none. Typing in a text field is left alone. */
function shortcutFor(event: KeyboardEvent, context: KeyboardContext): Shortcut {
  const { selection } = context;
  if (event.key === "Escape") return escapeShortcut(event, context);
  if (isTextEntry(event.target)) return NO_SHORTCUT;
  if (event.ctrlKey || event.metaKey) return historyShortcut(event);
  if (event.key === "F2" && inCanvas(event.target)) return renameShortcut(event, selection);
  if (selection === null) return NO_SHORTCUT;
  const deletes = event.key === "Delete" || event.key === "Backspace";
  return deletes && onCanvas(event.target) ? { actions: [{ type: "commit", operation: { op: "deleteItem", itemId: selection } }] } : NO_SHORTCUT;
}

/**
 * Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl+Y redo; Escape cancels the innermost active operation. On a canvas item, Delete or Backspace
 * deletes the selected item and F2 opens its label for editing where it sits. Shortcuts are left alone while text is being typed.
 */
export function useEditorKeyboard(dispatch: Dispatch<EditorAction>, context: KeyboardContext): void {
  const { selection, labelEditing, connecting } = context;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcutFor(event, { selection, labelEditing, connecting });
      if (!shortcut.actions) return;
      for (const action of shortcut.actions) dispatch(action);
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, selection, labelEditing, connecting]);
}
