// Collision uses the nominal footprint, not the drawn size (research, open points; contracts/operations.md).
import type { Position } from "../operations";
import type { Node } from "../types";

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 64;

/** The farthest a coordinate may be, so a complete footprint stays representable when overlaps are checked. */
export const MAX_X = Number.MAX_SAFE_INTEGER - NODE_WIDTH;
export const MAX_Y = Number.MAX_SAFE_INTEGER - NODE_HEIGHT;

/** A position the canvas can hold: both coordinates finite and within the bounds above (data-model.md, invariant 7). */
export function withinBounds(position: Position): boolean {
  return Number.isFinite(position.x) && Number.isFinite(position.y) && Math.abs(position.x) <= MAX_X && Math.abs(position.y) <= MAX_Y;
}

/** Two footprints overlap when they share area; touching edges do not overlap. */
export function overlaps(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) < NODE_WIDTH && Math.abs(a.y - b.y) < NODE_HEIGHT;
}

function isFree(position: Position, others: readonly Node[]): boolean {
  return others.every((other) => !overlaps(position, other));
}

const ascending = (a: number, b: number) => a - b;

/** Clockwise angle from north, in [0, 2π): the fixed order in which equally near candidates are tried. */
function ringAngle(from: Position, to: Position): number {
  const angle = Math.atan2(to.x - from.x, from.y - to.y);
  return angle < 0 ? angle + 2 * Math.PI : angle;
}

/**
 * The free position nearest `requested`, or `requested` itself when it is free. The nearest free point always lies
 * on a footprint edge or on the requested coordinate, so only those coordinates are tried. Equally near candidates
 * resolve in a fixed outward ring order: north first, then clockwise.
 */
export function nearestFreePosition(others: readonly Node[], requested: Position): Position {
  if (isFree(requested, others)) return requested;
  const xs = [requested.x, ...others.flatMap((other) => [other.x - NODE_WIDTH, other.x + NODE_WIDTH])].sort(ascending);
  const ys = [requested.y, ...others.flatMap((other) => [other.y - NODE_HEIGHT, other.y + NODE_HEIGHT])].sort(ascending);
  let best: Position | undefined;
  let bestDistance = Infinity;
  let bestAngle = Infinity;
  for (const x of xs) {
    for (const y of ys) {
      const candidate = { x, y };
      const distance = (x - requested.x) ** 2 + (y - requested.y) ** 2;
      if (distance > bestDistance || !withinBounds(candidate) || !isFree(candidate, others)) continue;
      const angle = ringAngle(requested, candidate);
      if (distance < bestDistance || angle < bestAngle) {
        best = candidate;
        bestDistance = distance;
        bestAngle = angle;
      }
    }
  }
  return best ?? requested;
}
