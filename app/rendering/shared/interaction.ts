import { targetList } from "../../model/targets";
import type { Diagram } from "../../model/types";

/** Two releases at most this far apart in time (ms) and space (px) can form a double activation. */
const DOUBLE_MS = 400;
const DOUBLE_PX = 8;
/** Handles show only on items at least this many screen px wide and tall: room for a 28 px hit square on each side. */
const MIN_ITEM_PX = 52;

/** One pointer release on an item: when, where (screen px), on which item, and whether a drag happened before it. */
export interface Release {
  readonly time: number;
  readonly x: number;
  readonly y: number;
  readonly itemId: number;
  readonly dragged: boolean;
}

/** True when `next` completes a double click, tap or pen tap that `previous` began: same item, close in time and place, no drag. */
export function isDoubleActivation(previous: Release | undefined, next: Release): boolean {
  if (previous === undefined || previous.dragged || next.dragged || previous.itemId !== next.itemId) return false;
  return next.time - previous.time <= DOUBLE_MS && Math.hypot(next.x - previous.x, next.y - previous.y) <= DOUBLE_PX;
}

/** True when an item of this size (drawing units) at this zoom is big enough on screen to show connection handles. */
export function handlesFit(size: { readonly width: number; readonly height: number }, zoom: number): boolean {
  return size.width * zoom >= MIN_ITEM_PX && size.height * zoom >= MIN_ITEM_PX;
}

/** The ids of the items a new line may end on: every item `targetList` offers, which is never a C4 boundary. */
export function validEnds(diagram: Diagram): number[] {
  return targetList(diagram).map((target) => target.id);
}

/** How a line being drawn marks an end: a valid one is ringed, and the one under the pointer is ringed more strongly. */
export function targetMark(valid: boolean, underPointer: boolean): "valid" | "drop" | undefined {
  if (!valid) return undefined;
  return underPointer ? "drop" : "valid";
}
