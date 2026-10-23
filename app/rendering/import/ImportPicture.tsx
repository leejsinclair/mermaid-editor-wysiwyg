import { Box } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { en } from "../../text/en";
import { drawWithMermaid } from "../shared/MermaidPicture";
import { latestOnly } from "../shared/latestOnly";
import { useAppearance } from "../theme/appearanceContext";

/** The diagram the import would create, drawn by Mermaid. Mermaid's markup is its own output at the strict level. */
export function ImportPicture({ source }: { readonly source: string }) {
  const latest = useMemo(() => latestOnly(), []);
  const host = useRef<HTMLDivElement>(null);
  // The picture is drawn again when the appearance changes, in that appearance's look (spec 007, FR-019).
  const { appearance } = useAppearance();
  useEffect(() => {
    latest(() => drawWithMermaid(source))
      .then((drawn) => {
        if (drawn && host.current) host.current.innerHTML = "svg" in drawn ? drawn.svg : "";
      })
      .catch(() => undefined);
  }, [latest, source, appearance]);
  return (
    <Box component="section" aria-label={en.importMermaid.previewRegion} sx={{ mt: 2, overflow: "auto", maxHeight: 360 }}>
      <Box ref={host} sx={{ "& svg": { maxWidth: "100%", height: "auto" } }} />
    </Box>
  );
}
