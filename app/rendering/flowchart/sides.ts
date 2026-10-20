export type Side = "top" | "right" | "bottom" | "left";

/** A node's box in the drawing's own coordinates. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The space between two boxes along one axis; zero or less where they overlap on it. */
function gap(aStart: number, aSize: number, bStart: number, bSize: number): number {
  return Math.max(bStart - (aStart + aSize), aStart - (bStart + bSize));
}

/**
 * The sides of two nodes that face each other along the larger gap, measured in node sizes (a node is wider than it is
 * tall, so a pixel of height counts for more than a pixel of width). Where the boxes overlap, the centre offset is used.
 */
export function nearestSides(from: Box, to: Box): { readonly source: Side; readonly target: Side } {
  const dx = to.x + to.width / 2 - (from.x + from.width / 2);
  const dy = to.y + to.height / 2 - (from.y + from.height / 2);
  const reachX = (from.width + to.width) / 2;
  const reachY = (from.height + to.height) / 2;
  const gapX = gap(from.x, from.width, to.x, to.width) / reachX;
  const gapY = gap(from.y, from.height, to.y, to.height) / reachY;
  const horizontal = gapX > 0 || gapY > 0 ? gapX > gapY : Math.abs(dx) / reachX > Math.abs(dy) / reachY;
  if (horizontal) return dx > 0 ? { source: "right", target: "left" } : { source: "left", target: "right" };
  return dy >= 0 ? { source: "bottom", target: "top" } : { source: "top", target: "bottom" };
}
