import type { CSSProperties } from "react";
import { gridLayers } from "./grid";

/**
 * The drafting grid of a scrolling SVG canvas (Sequence and C4) as background layers of the scrolling area (spec 007, FR-011, FR-013).
 * They are anchored to the scrolled content, so they scroll with the drawing, and scale with its zoom; a background draws no element
 * of its own and takes no pointer events. The major lines are drawn over the minor ones.
 */
export function gridBackground(zoom: number): CSSProperties {
  const { minor, major } = gridLayers(zoom);
  const layers: { readonly gap: number; readonly colour: string }[] = [{ gap: major, colour: "var(--grid-major)" }];
  if (minor !== null) layers.push({ gap: minor, colour: "var(--grid-minor)" });
  return {
    // One layer per spacing: a conic gradient with its centre at the corner of the tile draws the tile's top and left lines together.
    backgroundImage: layers.map(({ colour }) => `conic-gradient(from 90deg at 1px 1px, transparent 90deg, ${colour} 0)`).join(", "),
    backgroundSize: layers.map(({ gap }) => `${String(gap)}px ${String(gap)}px`).join(", "),
    backgroundAttachment: "local",
  };
}
