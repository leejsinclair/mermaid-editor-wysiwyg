import { Typography } from "@mui/material";
import { en } from "../../text/en";

interface EmptyHintProps {
  /** The lines to show, one per step; the general hint when none are given. */
  readonly lines?: readonly string[];
}

/** Tells a person who faces an empty canvas how to begin; it never takes the pointer, so the canvas stays editable. */
export function EmptyHint({ lines = [en.editor.emptyHint] }: Readonly<EmptyHintProps>) {
  return (
    <div
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center", padding: 16 }}
    >
      {lines.map((line) => (
        <Typography key={line} color="text.secondary" style={{ pointerEvents: "none" }}>
          {line}
        </Typography>
      ))}
    </div>
  );
}
