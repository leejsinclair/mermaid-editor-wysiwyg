import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { en } from "../../text/en";
import { TOOLBOX_DRAG_TYPE } from "./dnd";

export interface ToolboxItem {
  readonly id: string;
  readonly name: string;
  readonly icon: ReactNode;
  /** Items that can be dropped on the canvas with a pointer carry their id in the drag data. */
  readonly draggable?: boolean;
  /** A toggle: pressing it arms the item for the next gesture, pressing it again disarms it. */
  readonly toggle?: boolean;
}

export interface ToolboxGroup {
  readonly label: string;
  readonly items: readonly ToolboxItem[];
}

interface ToolboxProps {
  readonly groups: readonly ToolboxGroup[];
  /** The id of the armed toggle item, if any. */
  readonly armedId?: string | null;
  readonly onActivate?: (id: string) => void;
}

/** One button per element or connection type of the diagram's type; nothing else is offered (FR-002). */
export function Toolbox({ groups, armedId = null, onActivate }: ToolboxProps) {
  return (
    <Box component="section" aria-label={en.toolbox.region} sx={{ p: 2, width: 240, borderRight: 1, borderColor: "divider" }}>
      {groups.map((group) => (
        <Box key={group.label} role="group" aria-label={group.label} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="h2" aria-hidden="true">
            {group.label}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {group.items.map((item) => (
              <Button
                key={item.id}
                variant="outlined"
                size="small"
                startIcon={item.icon}
                sx={{ justifyContent: "flex-start" }}
                draggable={item.draggable === true}
                aria-pressed={item.toggle === true ? armedId === item.id : undefined}
                onClick={() => onActivate?.(item.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(TOOLBOX_DRAG_TYPE, item.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
