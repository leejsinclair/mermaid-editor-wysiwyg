import { Typography } from "@mui/material";
import { en } from "../../text/en";

/** Tells a person who faces an empty canvas how to begin; it never takes the pointer, so the canvas stays editable. */
export function EmptyHint() {
  return (
    <Typography
      color="text.secondary"
      style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center", padding: 16 }}
    >
      {en.editor.emptyHint}
    </Typography>
  );
}
