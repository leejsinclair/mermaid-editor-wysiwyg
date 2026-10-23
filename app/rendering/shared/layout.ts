// How the workspace is arranged for a window width (spec 007, FR-010): side by side from 900 px, with the toolbox and properties in
// a panel from 600 px up to that, and with the less used actions in a menu as well below 600 px.

export type Layout = "wide" | "narrow" | "compact";

export const WIDE_FROM = 900;
export const NARROW_FROM = 600;

export function layoutFor(width: number): Layout {
  if (width >= WIDE_FROM) return "wide";
  return width >= NARROW_FROM ? "narrow" : "compact";
}
