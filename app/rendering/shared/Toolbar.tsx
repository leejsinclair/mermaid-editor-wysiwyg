import { Box, Button, Typography } from "@mui/material";
import { en } from "../../text/en";
import { MoreActions, type MoreAction } from "./MoreActions";
import { useLayout } from "./useLayout";

interface ToolbarProps {
  /** Only a flowchart keeps positions the generated source does not carry (FR-003). */
  readonly showLayoutNote: boolean;
  readonly previewOpen: boolean;
  readonly onTogglePreview: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onCopySource: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onSaveFile: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onFit: () => void;
}

/** Pressing a view control must not take focus from a label being typed on the canvas: zooming and panning keep the edit open. */
const keepFocus = (event: { preventDefault: () => void }): void => {
  event.preventDefault();
};

export function Toolbar({ showLayoutNote, previewOpen, onTogglePreview, canUndo, canRedo, onUndo, onRedo, onCopySource, onCopyMarkdown, onSaveFile, onZoomIn, onZoomOut, onFit }: ToolbarProps) {
  // Below 600 px the document actions and the preview toggle are under "More actions" (spec 007, FR-010); each keeps its name and effect.
  const compact = useLayout() === "compact";
  const rest: readonly MoreAction[] = [
    { name: en.toolbar.copySource, run: onCopySource },
    { name: en.toolbar.copyMarkdown, run: onCopyMarkdown },
    { name: en.toolbar.saveFile, run: onSaveFile },
    ...(showLayoutNote ? [{ name: en.toolbar.preview, run: onTogglePreview, on: previewOpen }] : []),
  ];
  return (
    <Box role="toolbar" aria-label={en.toolbar.region} sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, px: 2, py: 1, "& .MuiButton-root": { whiteSpace: "nowrap" } }}>
      <Button variant="outlined" size="small" disabled={!canUndo} onClick={onUndo} data-discards-draft>
        {en.toolbar.undo}
      </Button>
      <Button variant="outlined" size="small" disabled={!canRedo} onClick={onRedo} data-discards-draft>
        {en.toolbar.redo}
      </Button>
      {!compact && (
        <>
          <Button variant="outlined" size="small" onClick={onCopySource}>
            {en.toolbar.copySource}
          </Button>
          <Button variant="outlined" size="small" onClick={onCopyMarkdown}>
            {en.toolbar.copyMarkdown}
          </Button>
          <Button variant="outlined" size="small" onClick={onSaveFile}>
            {en.toolbar.saveFile}
          </Button>
        </>
      )}
      <Button variant="outlined" size="small" onClick={onZoomIn} onMouseDown={keepFocus}>
        {en.toolbar.zoomIn}
      </Button>
      <Button variant="outlined" size="small" onClick={onZoomOut} onMouseDown={keepFocus}>
        {en.toolbar.zoomOut}
      </Button>
      <Button variant="outlined" size="small" onClick={onFit} onMouseDown={keepFocus}>
        {en.toolbar.fit}
      </Button>
      {compact && <MoreActions actions={rest} />}
      {showLayoutNote && !compact && (
        <Button variant="outlined" size="small" aria-pressed={previewOpen} onClick={onTogglePreview}>
          {en.toolbar.preview}
        </Button>
      )}
      {showLayoutNote && (
        <Typography variant={compact ? "caption" : "body2"} color="text.secondary" sx={compact ? { flexBasis: "100%" } : undefined}>
          {en.toolbar.layoutNote}
        </Typography>
      )}
    </Box>
  );
}
