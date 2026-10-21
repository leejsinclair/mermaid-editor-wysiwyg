import { Box, Typography } from "@mui/material";
import { compareLines, type CompareKind, type CompareLine } from "../../importing/compare";
import { en } from "../../text/en";

// The text marker for each kind of line: a visible mark, with the kind also spoken as a word (not colour alone, FR-010).
const MARKER: Readonly<Record<CompareKind, string>> = { same: "", changed: "~", removed: "−", added: "+" };
const HIDDEN: React.CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };

/**
 * A dropped construct's original lines are removed, never paired with the line that replaces them (US4-AS3): a changed row
 * whose original line the report dropped is shown as a removed line and an added line.
 */
function separateDropped(rows: readonly CompareLine[], dropped: ReadonlySet<number>): CompareLine[] {
  return rows.flatMap((row): CompareLine[] =>
    row.kind === "changed" && row.originalLine !== undefined && dropped.has(row.originalLine)
      ? [
          { kind: "removed", original: row.original, originalLine: row.originalLine },
          { kind: "added", generated: row.generated, generatedLine: row.generatedLine },
        ]
      : [row],
  );
}

/** The original and generated texts side by side, line by line; each differing line carries a marker and a style. */
export function CompareView({ original, generated, dropped }: { readonly original: string; readonly generated: string; readonly dropped: ReadonlySet<number> }) {
  const rows: readonly CompareLine[] = separateDropped(compareLines(original, generated), dropped);
  const identical = rows.every((row) => row.kind === "same");
  return (
    <Box component="section" aria-label={en.importMermaid.compareRegion} sx={{ mt: 2, maxHeight: 360, overflow: "auto", fontFamily: "monospace", whiteSpace: "pre" }}>
      {identical && (
        <Typography sx={{ fontFamily: "inherit", whiteSpace: "normal", mb: 1 }}>{en.importMermaid.compareIdentical}</Typography>
      )}
      {rows.map((row, index) => (
        <Box
          key={index}
          data-change={row.kind}
          sx={{
            display: "grid",
            gridTemplateColumns: "3em minmax(0, 1fr) 1.5em 3em minmax(0, 1fr)",
            columnGap: 1,
            pl: 1,
            borderLeft: 4,
            borderColor: row.kind === "same" ? "transparent" : "warning.main",
            bgcolor: row.kind === "same" ? undefined : "action.hover",
          }}
        >
          <span>{row.originalLine ?? ""}</span>
          <span>{row.original ?? ""}</span>
          <span aria-hidden="true">{MARKER[row.kind]}</span>
          <span>{row.generatedLine ?? ""}</span>
          <span>{row.generated ?? ""}</span>
          {row.kind !== "same" && <span style={HIDDEN}>{en.importMermaid.compareWords[row.kind]}</span>}
        </Box>
      ))}
    </Box>
  );
}
