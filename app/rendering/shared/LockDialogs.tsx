import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { en } from "../../text/en";

interface LockDialogsProps {
  /** `elsewhere`: another tab is editing this diagram. `moved`: another tab took over from this one. None: nothing to say. */
  readonly situation: "elsewhere" | "moved" | null;
  readonly onEditHere: () => void;
  readonly onTakeBack: () => void;
  readonly onCancel: () => void;
}

/** The two things a tab says about the one-editing-tab rule (FR-050); state and handlers come from the caller. */
export function LockDialogs({ situation, onEditHere, onTakeBack, onCancel }: LockDialogsProps) {
  return (
    <>
      <Dialog open={situation === "elsewhere"} aria-labelledby="elsewhere-title">
        <DialogTitle id="elsewhere-title">{en.lock.elsewhereTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{en.lock.elsewhereBody}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>{en.lock.cancel}</Button>
          <Button onClick={onEditHere}>{en.lock.editHere}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={situation === "moved"} aria-labelledby="moved-title">
        <DialogTitle id="moved-title">{en.lock.movedTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{en.lock.movedBody}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onTakeBack}>{en.lock.takeBack}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
