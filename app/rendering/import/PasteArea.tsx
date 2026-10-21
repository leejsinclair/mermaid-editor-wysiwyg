import { TextField } from "@mui/material";
import { useEffect, type Ref } from "react";
import { en } from "../../text/en";

/** The start offset of a 1-based line in the text, and the end of that line; none when the text has no such line (EC-07). */
function lineRange(text: string, line: number): { readonly start: number; readonly end: number } | undefined {
  const lines = text.split("\n");
  if (line < 1 || line > lines.length) return undefined;
  const before = lines.slice(0, line - 1).reduce((sum, value) => sum + value.length + 1, 0);
  return { start: before, end: before + (lines[line - 1] ?? "").length };
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
  // Runs only when an entry is selected, never on typing: the text is read from the area itself (feature 006, FR-005).
  useEffect(() => {
    if (selectLine === undefined) return;
    const area = typeof inputRef === "object" && inputRef !== null ? inputRef.current : null;
    if (!area) return;
    const range = lineRange(area.value, selectLine.line);
    if (range === undefined) return;
    area.setSelectionRange(range.start, range.end);
    area.focus();
  }, [selectLine, inputRef]);
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
