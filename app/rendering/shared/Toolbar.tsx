import { Box, Button, Typography } from "@mui/material";
import { en } from "../../text/en";

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
}

export function Toolbar({ showLayoutNote, previewOpen, onTogglePreview, canUndo, canRedo, onUndo, onRedo, onCopySource, onCopyMarkdown, onSaveFile }: ToolbarProps) {
  return (
    <Box role="toolbar" aria-label={en.toolbar.region} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderBottom: 1, borderColor: "divider" }}>
      <Button variant="outlined" size="small" disabled={!canUndo} onClick={onUndo}>
        {en.toolbar.undo}
      </Button>
      <Button variant="outlined" size="small" disabled={!canRedo} onClick={onRedo}>
        {en.toolbar.redo}
      </Button>
      <Button variant="outlined" size="small" onClick={onCopySource}>
        {en.toolbar.copySource}
      </Button>
      <Button variant="outlined" size="small" onClick={onCopyMarkdown}>
        {en.toolbar.copyMarkdown}
      </Button>
      <Button variant="outlined" size="small" onClick={onSaveFile}>
        {en.toolbar.saveFile}
      </Button>
      {showLayoutNote && (
        <Button variant="outlined" size="small" aria-pressed={previewOpen} onClick={onTogglePreview}>
          {en.toolbar.preview}
        </Button>
      )}
      {showLayoutNote && (
        <Typography variant="body2" color="text.secondary">
          {en.toolbar.layoutNote}
        </Typography>
      )}
    </Box>
  );
}
