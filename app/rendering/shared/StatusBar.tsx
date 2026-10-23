import { Box, Typography } from "@mui/material";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { toneColour, type StatusTone } from "./sourceStatus";
import { useZoom, type ZoomStore } from "./zoomStore";

interface StatusBarProps {
  /** Where the zoom of the drawing is kept, 1 being its own size. */
  readonly zoomStore: ZoomStore;
  /** The save status text; it is announced when it changes. */
  readonly saveText: string;
  /** Where the generated source stands with Mermaid, and the tone it is drawn in. */
  readonly sourceText: string;
  readonly sourceTone: StatusTone;
}

/** The editor's short status line: the zoom, whether the diagram is saved and whether Mermaid accepts the source (spec 007, FR-008). */
export function StatusBar({ zoomStore, saveText, sourceText, sourceTone }: StatusBarProps) {
  const zoom = useZoom(zoomStore);
  return (
    <Box
      component="section"
      aria-label={en.statusBar.region}
      sx={{ display: "flex", flexWrap: "wrap", gap: 3, px: 2, py: 0.5, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Typography component="span" variant="body2" sx={{ fontFamily: "var(--font-mono)" }}>
        {fill(en.statusBar.zoom, { percent: String(Math.round(zoom * 100)) })}
      </Typography>
      <Typography component="span" variant="body2" role="status" aria-label={en.saveStatus.region} color="text.secondary">
        {saveText}
      </Typography>
      <Typography component="span" variant="body2" sx={{ color: toneColour(sourceTone) }}>
        {sourceText}
      </Typography>
    </Box>
  );
}
