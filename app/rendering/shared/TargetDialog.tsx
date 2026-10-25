import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, List, ListItem, ListItemButton, Radio, RadioGroup } from "@mui/material";
import { useState } from "react";
import type { Target } from "../../model/targets";
import { en } from "../../text/en";


interface TargetDialogProps {
  readonly title: string;
  readonly targets: readonly Target[];
  /** Offer a choice of which end of a connection to move. */
  readonly chooseEnd: boolean;
  readonly onChoose: (targetId: number, end: "from" | "to") => void;
  readonly onClose: () => void;
}

/** Lists the allowed targets of Connect… and Change endpoints; choosing one completes the action. */
export function TargetDialog({ title, targets, chooseEnd, onChoose, onClose }: TargetDialogProps) {
  const [end, setEnd] = useState<"from" | "to">("to");
  return (
    <Dialog open onClose={onClose} aria-label={title}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {chooseEnd && (
          <RadioGroup
            row
            aria-label={en.properties.endGroup}
            value={end}
            onChange={(event) => {
              setEnd(event.target.value === "from" ? "from" : "to");
            }}
          >
            <FormControlLabel value="from" control={<Radio />} label={en.properties.ends.from} />
            <FormControlLabel value="to" control={<Radio />} label={en.properties.ends.to} />
          </RadioGroup>
        )}
        <List>
          {targets.map((target) => (
            <ListItem key={target.id} disablePadding>
              <ListItemButton
                onClick={() => {
                  onChoose(target.id, end);
                }}
              >
                {target.name}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{en.properties.cancel}</Button>
      </DialogActions>
    </Dialog>
  );
}
