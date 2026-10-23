import { Background, BackgroundVariant } from "@xyflow/react";
import { gridLayers, MAJOR_GAP, MINOR_GAP } from "../shared/grid";

/**
 * The flowchart's drafting grid: two background layers that React Flow moves and scales with the drawing (spec 007, FR-011, FR-013).
 * They sit under the nodes and edges, are drawn by the canvas library apart from the diagram's own SVG, and take no pointer events.
 */
export function DraftingGrid({ zoom }: { readonly zoom: number }) {
  return (
    <>
      {gridLayers(zoom).minor !== null && <Background id="grid-minor" variant={BackgroundVariant.Lines} gap={MINOR_GAP} lineWidth={1} color="var(--grid-minor)" />}
      <Background id="grid-major" variant={BackgroundVariant.Lines} gap={MAJOR_GAP} lineWidth={1} color="var(--grid-major)" />
    </>
  );
}
