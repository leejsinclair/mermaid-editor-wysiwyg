import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemButton } from "@mui/material";
import { en } from "../../text/en";

export interface MoveToOption {
  /** The boundary or Deployment node to move into, or null for the top level. */
  readonly id: number | null;
  readonly name: string;
}

interface MoveToDialogProps {
  readonly options: readonly MoveToOption[];
  readonly onChoose: (parentId: number | null) => void;
  readonly onClose: () => void;
}

/** Lists the places an item may be moved to ("Top level" and each allowed boundary or node); choosing one moves it (FR-034). */
export function MoveToDialog({ options, onChoose, onClose }: MoveToDialogProps) {
  return (
    <Dialog open onClose={onClose} aria-label={en.moveTo.title}>
      <DialogTitle>{en.moveTo.title}</DialogTitle>
      <DialogContent>
        <List>
          {options.map((option) => (
            <ListItemButton
              key={option.id ?? "top"}
              onClick={() => {
                onChoose(option.id);
              }}
            >
              {option.name}
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{en.properties.cancel}</Button>
      </DialogActions>
    </Dialog>
  );
}
