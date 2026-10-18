import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { useState } from "react";
import { en } from "../../text/en";
import type { Target } from "./TargetDialog";

interface MessageDialogProps {
  /** The participants a message can go between. */
  readonly participants: readonly Target[];
  /** Where each end starts: the selected participant, if there is one. */
  readonly defaultEnd: number | undefined;
  readonly onChoose: (from: number, to: number) => void;
  readonly onClose: () => void;
  /** What the dialog says; messages by default. */
  readonly text?: { readonly title: string; readonly first: string; readonly second: string; readonly add: string };
}

/** Asks for a message's sender, then its receiver; the two default to the selected participant (FR-029). */
export function MessageDialog({ participants, defaultEnd, onChoose, onClose, text = { title: en.message.title, first: en.message.sender, second: en.message.receiver, add: en.message.add } }: MessageDialogProps) {
  const [from, setFrom] = useState<number | undefined>(defaultEnd);
  const [to, setTo] = useState<number | undefined>(defaultEnd);
  const choice = (label: string, value: number | undefined, set: (id: number) => void) => (
    <FormControl sx={{ display: "block", mb: 1 }}>
      <FormLabel id={`message-${label}`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`message-${label}`}
        value={value === undefined ? "" : String(value)}
        onChange={(event) => {
          set(Number(event.target.value));
        }}
      >
        {participants.map((participant) => (
          <FormControlLabel key={participant.id} value={String(participant.id)} control={<Radio />} label={participant.name} />
        ))}
      </RadioGroup>
    </FormControl>
  );
  return (
    <Dialog open onClose={onClose} aria-label={text.title}>
      <DialogTitle>{text.title}</DialogTitle>
      <DialogContent>
        {choice(text.first, from, setFrom)}
        {choice(text.second, to, setTo)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{en.properties.cancel}</Button>
        <Button
          disabled={from === undefined || to === undefined}
          onClick={() => {
            if (from !== undefined && to !== undefined) onChoose(from, to);
          }}
        >
          {text.add}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
