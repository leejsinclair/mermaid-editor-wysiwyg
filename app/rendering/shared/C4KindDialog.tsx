import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import type { C4Kind } from "../../model/types";
import { en } from "../../text/en";

const KINDS: readonly { kind: C4Kind; name: string }[] = [
  { kind: "context", name: en.start.kinds.context },
  { kind: "container", name: en.start.kinds.container },
  { kind: "component", name: en.start.kinds.component },
  { kind: "dynamic", name: en.start.kinds.dynamic },
  { kind: "deployment", name: en.start.kinds.deployment },
];

interface C4KindDialogProps {
  readonly open: boolean;
  readonly onChoose: (kind: C4Kind) => void;
  readonly onClose: () => void;
}

/** The second step of starting a C4 diagram: the kind is fixed once the diagram opens (FR-037). */
export function C4KindDialog({ open, onChoose, onClose }: C4KindDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="c4-kind-title" aria-describedby="c4-kind-note">
      <DialogTitle id="c4-kind-title">{en.start.chooseKind}</DialogTitle>
      <DialogContent>
        <DialogContentText id="c4-kind-note">{en.start.c4Experimental}</DialogContentText>
        <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", gap: 1 }}>
          {KINDS.map(({ kind, name }) => (
            <Button
              key={kind}
              variant="outlined"
              onClick={() => {
                onChoose(kind);
              }}
            >
              {name}
            </Button>
          ))}
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
