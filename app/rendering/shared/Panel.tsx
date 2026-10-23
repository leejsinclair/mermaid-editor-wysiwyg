import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface PanelProps {
  readonly children: ReactNode;
  readonly mt?: number;
  readonly "aria-labelledby"?: string;
  readonly "aria-label"?: string;
}

/** A labelled region on the panel surface: the raised part of a page, in either appearance. */
export function Panel({ children, mt = 0, ...labels }: PanelProps) {
  return (
    <Box component="section" {...labels} sx={{ mt, p: 2, bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 1 }}>
      {children}
    </Box>
  );
}
