import { useEffect, type Dispatch } from "react";
import { en } from "../text/en";
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

/** The shortcut for a key press, or none. Typing in a text field is left alone. */
function shortcutFor(event: KeyboardEvent, selection: number | null): Shortcut {
  if (isTextEntry(event.target)) return NO_SHORTCUT;
  if (event.ctrlKey || event.metaKey) return historyShortcut(event);
  if (event.key === "F2" && inCanvas(event.target)) return renameShortcut(event, selection);
  if (selection === null) return NO_SHORTCUT;
  if (event.key === "Escape") return { actions: [{ type: "select", itemId: null }] };
  const deletes = event.key === "Delete" || event.key === "Backspace";
  return deletes && onCanvas(event.target) ? { actions: [{ type: "commit", operation: { op: "deleteItem", itemId: selection } }] } : NO_SHORTCUT;
}

/**
 * Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl+Y redo; Escape clears the selection. On a canvas item, Delete or Backspace
 * deletes the selected item and F2 opens its label for editing where it sits. Shortcuts are left alone while text is being typed.
 */
export function useEditorKeyboard(dispatch: Dispatch<EditorAction>, selection: number | null): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcutFor(event, selection);
      if (!shortcut.actions) return;
      for (const action of shortcut.actions) dispatch(action);
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch, selection]);
}
