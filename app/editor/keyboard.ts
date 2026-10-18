import { useEffect, type Dispatch } from "react";
import type { EditorAction } from "./reducer";

/** True where the key belongs to the browser's own text editing, which has its own undo. */
function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/** Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl+Y redo. Shortcuts are left alone while text is being typed. */
export function useEditorKeyboard(dispatch: Dispatch<EditorAction>): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || isTextEntry(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "z") dispatch({ type: event.shiftKey ? "redo" : "undo" });
      else if (key === "y" && event.ctrlKey) dispatch({ type: "redo" });
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch]);
}
