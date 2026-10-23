import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import type { Notice } from "../../generation/generate";
import { en } from "../../text/en";
import { HighlightedSource } from "./HighlightedSource";
import { statusText, statusTone, toneColour, type SourcePanelStatus } from "./sourceStatus";

function ExpandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 10l5 5 5-5z" fill="currentColor" />
    </svg>
  );
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
        <Typography component="span" sx={{ ml: 2, color: toneColour(statusTone(status)) }}>
          {statusText(status)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails id="mermaid-source-content">
        <HighlightedSource source={source} />
        {notices.map((notice) => (
          <Typography key={notice.code + notice.text} variant="body2" role="note">
            {notice.text}
          </Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
