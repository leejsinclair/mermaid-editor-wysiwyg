import { useLayoutEffect, useRef, type CSSProperties, type SyntheticEvent } from "react";
import { en } from "../../text/en";
import { fill } from "../../text/fill";

/** The label being edited in place: the draft text and what the editor can ask of the editor state. */
export interface InlineEdit {
  readonly itemId: number;
  readonly text: string;
  readonly onChange: (text: string) => void;
  readonly onCommit: () => void;
  readonly onCancel: () => void;
  /** Focus left the editor; `discard` is set when it moved to a control that throws the typed text away (Undo, Redo). */
  readonly onBlur: (discard: boolean) => void;
}

interface InlineLabelEditorProps {
  /** The name of the item or line, as the canvas announces it. */
  readonly name: string;
  readonly edit: InlineEdit;
  readonly style?: CSSProperties;
}

/** Keeps a pointer or key event inside the editor, so the item or canvas under it does not act on it. */
const keep = (event: SyntheticEvent): void => {
  event.stopPropagation();
};

/** The one editor for a label in place: a plain text field with the whole label selected, drawn at the label. */
export function InlineLabelEditor({ name, edit, style }: Readonly<InlineLabelEditorProps>) {
  const field = useRef<HTMLTextAreaElement>(null);
  // Where the caret goes once pasted text has been set as the draft, or none.
  const caret = useRef<number | null>(null);
  const { itemId } = edit;
  // How the editor is being closed: by a key (focus goes back to the item), by a press on the canvas itself (it goes back too),
  // or by a press on anything else, which takes the focus where it was pressed.
  const closing = useRef<"key" | "canvas" | null>(null);
  const pressed = useRef<EventTarget | null>(null);
  useLayoutEffect(() => {
    const element = field.current;
    element?.focus();
    element?.select();
    const note = (event: Event) => {
      pressed.current = event.target;
    };
    document.addEventListener("pointerdown", note, true);
    return () => {
      document.removeEventListener("pointerdown", note, true);
      // The editor is closed once it has left the page; React runs this cleanup too while it is only checking that effects clean up
      // after themselves, when the field is still there and nothing is to be given back.
      const reason = closing.current;
      queueMicrotask(() => {
        if (element?.isConnected === true || reason === null) return;
        document.querySelector<HTMLElement>(`[data-id="${String(itemId)}"]`)?.focus();
      });
    };
  }, [itemId]);
  // The editor is as tall as its text, so a long or multi-line label is shown whole.
  useLayoutEffect(() => {
    const element = field.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${String(element.scrollHeight + element.offsetHeight - element.clientHeight)}px`;
    if (caret.current !== null) {
      element.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [edit.text]);
  return (
    <textarea
      ref={field}
      data-testid="inline-label-editor"
      className="nodrag nopan nowheel"
      aria-label={fill(en.editor.inlineLabel, { name })}
      rows={1}
      value={edit.text}
      style={{ width: "100%", boxSizing: "border-box", resize: "none", overflow: "hidden", font: "inherit", textAlign: "center", ...style }}
      onChange={(event) => {
        edit.onChange(event.target.value);
      }}
      onBlur={(event) => {
        // A press on the drawing's own background (nothing that takes focus) closes the editor and hands focus back to the item.
        const away = pressed.current instanceof Element && pressed.current.closest("[tabindex], button, input, textarea, a") === null && pressed.current.closest('[aria-label="Diagram canvas"]') !== null;
        if (event.relatedTarget === null && away) closing.current = "canvas";
        edit.onBlur(event.relatedTarget instanceof Element && event.relatedTarget.closest("[data-discards-draft]") !== null);
      }}
      onPaste={(event) => {
        // Only the characters and line breaks of what is pasted are kept; the editor never takes formatting.
        event.preventDefault();
        event.stopPropagation();
        const pasted = event.clipboardData.getData("text/plain");
        const { value, selectionStart, selectionEnd } = event.currentTarget;
        caret.current = selectionStart + pasted.length;
        edit.onChange(value.slice(0, selectionStart) + pasted + value.slice(selectionEnd));
      }}
      onClick={keep}
      onDoubleClick={keep}
      onPointerDown={keep}
      onKeyDown={(event) => {
        // Keys typed here belong to the text: they never reach the item or the canvas shortcuts under the editor.
        event.stopPropagation();
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          closing.current = "key";
          edit.onCommit();
        } else if (event.key === "Escape") {
          event.preventDefault();
          closing.current = "key";
          edit.onCancel();
        }
      }}
    />
  );
}
