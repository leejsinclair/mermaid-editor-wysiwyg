import { TextField } from "@mui/material";
import { useEffect, type Ref } from "react";
import { en } from "../../text/en";

/** The start offset of a 1-based line in the text, and the end of that line. */
function lineRange(text: string, line: number): { readonly start: number; readonly end: number } {
  const lines = text.split("\n");
  const before = lines.slice(0, Math.max(0, line - 1)).reduce((sum, value) => sum + value.length + 1, 0);
  const current = lines.at(line - 1) ?? "";
  return { start: before, end: before + current.length };
}

/** The text area the developer pastes Mermaid text into (contracts/import-dialog.md, "Layout"). */
export function PasteArea({
  value,
  onChange,
  inputRef,
  selectLine,
}: {
  readonly value: string;
  readonly onChange: (text: string) => void;
  readonly inputRef?: Ref<HTMLTextAreaElement>;
  /** The line a report entry names; it is selected in the text when it changes. */
  readonly selectLine?: { readonly line: number; readonly at: number } | undefined;
}) {
  useEffect(() => {
    if (selectLine === undefined) return;
    const area = typeof inputRef === "object" && inputRef !== null ? inputRef.current : null;
    if (!area) return;
    const { start, end } = lineRange(value, selectLine.line);
    area.setSelectionRange(start, end);
    area.focus();
  }, [selectLine, inputRef, value]);
  return (
    <TextField
      multiline
      fullWidth
      minRows={10}
      inputRef={inputRef}
      label={en.importMermaid.text}
      placeholder={en.importMermaid.hint}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      slotProps={{ htmlInput: { spellCheck: false } }}
    />
  );
}
