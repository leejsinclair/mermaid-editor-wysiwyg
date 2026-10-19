import { useEffect, type Dispatch } from "react";
import { en } from "../text/en";
import type { EditorAction } from "./reducer";

/** True where the key belongs to the browser's own text editing, which has its own undo. */
function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/** True where the key was pressed on an item of the diagram canvas. */
function onCanvas(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest(`[aria-label="${en.editor.canvas}"]`) !== null;
}

/** Moves focus into the Properties label field, which is how the selected item is edited from the keyboard. */
function editLabel(): void {
  document.querySelector<HTMLElement>(`[aria-label="${en.properties.region}"] textarea:not([aria-hidden="true"])`)?.focus();
}

/** What a key press asks for: an editor action, or to start editing the selected label, or nothing. */
interface Shortcut {
  readonly action?: EditorAction;
  readonly editLabel?: true;
}

const NO_SHORTCUT: Shortcut = {};

/** The shortcut for a key press, or none. Typing in a text field is left alone. */
function shortcutFor(event: KeyboardEvent, selection: number | null): Shortcut {
  if (isTextEntry(event.target)) return NO_SHORTCUT;
  if (event.ctrlKey || event.metaKey) {
    const key = event.key.toLowerCase();
    if (key === "z") return { action: { type: event.shiftKey ? "redo" : "undo" } };
    return key === "y" && event.ctrlKey ? { action: { type: "redo" } } : NO_SHORTCUT;
  }
  if (selection === null) return NO_SHORTCUT;
  if (event.key === "Escape") return { action: { type: "select", itemId: null } };
  if (!onCanvas(event.target)) return NO_SHORTCUT;
  if (event.key === "Delete" || event.key === "Backspace") return { action: { type: "commit", operation: { op: "deleteItem", itemId: selection } } };
  return event.key === "F2" ? { editLabel: true } : NO_SHORTCUT;
}

/**
 * Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl+Y redo; Escape clears the selection. On a canvas item, Delete or Backspace
 * deletes the selected item and F2 edits its label. Shortcuts are left alone while text is being typed.
 */
export function useEditorKeyboard(dispatch: Dispatch<EditorAction>, selection: number | null): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcutFor(event, selection);
      if (shortcut.action) dispatch(shortcut.action);
      else if (shortcut.editLabel) editLabel();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, selection]);
}
