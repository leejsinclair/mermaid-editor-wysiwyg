import { Box, Button, Typography } from "@mui/material";
import type { ReportCategory, ReportEntry } from "../../importing/report";
import { en } from "../../text/en";
import { fill } from "../../text/fill";

const GROUPS: readonly ReportCategory[] = ["dropped", "approximated", "ignored"];

/** The Import report: entries grouped as Dropped, Approximated and Ignored; activating one selects its line (FR-007). */
function countOf(entries: readonly ReportEntry[], category: ReportCategory): number {
  return entries.filter((entry) => entry.category === category).length;
}

export function ImportReport({ entries, onSelect }: { readonly entries: readonly ReportEntry[]; readonly onSelect: (line: number) => void }) {
  return (
    <Box component="section" aria-label={en.importMermaid.reportRegion} sx={{ mt: 2 }}>
      {entries.length > 0 && (
        <Typography variant="subtitle1" component="h2">
          {fill(en.importMermaid.counts, {
            dropped: String(countOf(entries, "dropped")),
            approximated: String(countOf(entries, "approximated")),
            ignored: String(countOf(entries, "ignored")),
          })}
        </Typography>
      )}
      {entries.length === 0 ? (
        <Typography variant="body2">{en.importMermaid.nothingDropped}</Typography>
      ) : (
        GROUPS.map((category) => {
          const group = entries.filter((entry) => entry.category === category);
          if (group.length === 0) return null;
          return (
            <Box key={category} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" component="h3">
                {en.importMermaid.groups[category]}
              </Typography>
              {group.map((entry) => (
                <Button
                  key={`${String(entry.line)}-${entry.construct}`}
                  size="small"
                  data-testid="report-entry"
                  data-category={category}
                  onClick={() => {
                    onSelect(entry.line);
                  }}
                  sx={{ display: "block", textAlign: "left", textTransform: "none" }}
                >
                  {/* An approximated entry also says what the construct became (feature 006, FR-008). */}
                  {fill(entry.becomes === undefined ? en.importMermaid.entry : en.importMermaid.entryKept, {
                    line: String(entry.line),
                    construct: entry.construct,
                    category,
                    reason: entry.reason,
                    becomes: entry.becomes ?? "",
                  })}
                </Button>
              ))}
            </Box>
          );
        })
      )}
    </Box>
  );
}
