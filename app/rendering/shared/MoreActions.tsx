import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState, type ReactNode } from "react";
import { en } from "../../text/en";

export interface MoreAction {
  readonly name: string;
  readonly run: () => void;
  /** A toggle that is on. */
  readonly on?: boolean;
  /** The icon the action has as a button, so it looks the same in the menu (FR-039). */
  readonly icon?: ReactNode;
}

/**
 * The less frequent actions a compact toolbar has no room for, under one labelled button (spec 007, FR-010; spec 008, FR-018). Each is a menu item with the name and
 * the effect it has as a button on a wider toolbar; choosing one closes the menu first.
 */
export function MoreActions({ actions }: { readonly actions: readonly MoreAction[] }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-controls="more-actions-menu"
        onClick={(event) => {
          setAnchor(event.currentTarget);
        }}
      >
        {en.toolbar.moreActions}
      </Button>
      <Menu
        id="more-actions-menu"
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => {
          setAnchor(null);
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.name}
            selected={action.on === true}
            onClick={() => {
              setAnchor(null);
              action.run();
            }}
          >
            {action.icon !== undefined && <ListItemIcon>{action.icon}</ListItemIcon>}
            <ListItemText>{action.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
