import { Box, Button } from "@mui/material";
import { useState, type ReactNode } from "react";
import { en } from "../../text/en";
import { useLayout } from "./useLayout";

interface WorkspaceProps {
  /** The toolbox of the diagram's type. */
  readonly toolbox: ReactNode;
  /** The properties of the selected item. */
  readonly properties: ReactNode;
  /** Something is selected: the narrow panel then opens on its properties, above the toolbox (spec 008, FR-034, EC-10). */
  readonly selected: boolean;
  /** The canvas. */
  readonly children: ReactNode;
}

/**
 * The editing area (spec 007, FR-006, FR-007, FR-010): where the window is wide, the toolbox, canvas and properties sit side by side;
 * where it is not, the canvas keeps the window and the toolbox and properties are a panel that a labelled "Tools" button opens
 * above it and closes again. The panel's state is its own, so opening it redraws nothing else, and what the author has selected or
 * is typing is held by the editor, not the panel.
 */
export function Workspace({ toolbox, properties, selected, children }: WorkspaceProps) {
  const layout = useLayout();
  const [open, setOpen] = useState(false);
  if (layout === "wide") {
    return (
      <Box sx={{ display: "flex", flex: 1, minHeight: 480 }}>
        {toolbox}
        {children}
        {properties}
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box sx={{ px: 2, py: 0.5, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Button
          size="small"
          variant="outlined"
          aria-expanded={open}
          aria-controls="tools-panel"
          onClick={() => {
            setOpen((now) => !now);
          }}
        >
          {en.workspace.tools}
        </Button>
      </Box>
      {open && (
        <Box component="section" id="tools-panel" aria-label={en.workspace.tools} sx={{ maxHeight: "45vh", overflow: "auto", borderBottom: 1, borderColor: "divider" }}>
          {selected ? properties : toolbox}
          {selected ? toolbox : properties}
        </Box>
      )}
      <Box sx={{ display: "flex", flex: 1, minHeight: "55vh", minWidth: 0 }}>{children}</Box>
    </Box>
  );
}
