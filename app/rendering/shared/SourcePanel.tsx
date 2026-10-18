import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import type { Notice } from "../../generation/generate";
import { en } from "../../text/en";
import { fill } from "../../text/fill";

function ExpandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 10l5 5 5-5z" fill="currentColor" />
    </svg>
  );
}

/** Where the source stands: being checked, accepted by Mermaid, rejected, or accepted but for a notice. */
export type SourcePanelStatus =
  | { readonly kind: "checking" }
  | { readonly kind: "valid" }
  | { readonly kind: "invalid"; readonly reason: string }
  | { readonly kind: "notice"; readonly notices: readonly Notice[] };

function statusText(status: SourcePanelStatus): string {
  switch (status.kind) {
    case "checking":
      return en.sourceCheck.checking;
    case "valid":
      return en.sourceCheck.valid;
    case "invalid":
      return fill(en.sourceCheck.invalid, { reason: status.reason });
    case "notice":
      return en.sourceCheck.notice;
  }
}

interface SourcePanelProps {
  readonly source: string;
  readonly status: SourcePanelStatus;
  readonly notices: readonly Notice[];
}

/** The generated source in a collapsed disclosure, read-only (FR-004, FR-015). */
export function SourcePanel({ source, status, notices }: SourcePanelProps) {
  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandIcon />} aria-controls="mermaid-source-content" id="mermaid-source-header">
        <Typography component="span">{en.editor.source}</Typography>
        <Typography component="span" color="text.secondary" sx={{ ml: 2 }}>
          {statusText(status)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails id="mermaid-source-content">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{source}</pre>
        {notices.map((notice) => (
          <Typography key={notice.code + notice.text} variant="body2" role="note">
            {notice.text}
          </Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
