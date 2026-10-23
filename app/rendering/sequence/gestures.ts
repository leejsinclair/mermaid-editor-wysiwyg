import { HEADER_HEIGHT, LEFT_MARGIN, LIFELINE_SPACING, ROW_SPACING, type SequenceLayout } from "../layout/sequenceLayout";

/** Where a message released at `y` goes among messages drawn at the heights `rows`: the number of rows above it. */
export function insertIndexAt(y: number, rows: readonly number[]): number {
  return rows.filter((row) => row < y).length;
}

/** The height of the gap that insertion index `index` is: halfway between the rows either side, or half a row beyond the first or last. */
export function insertionY(index: number, rows: readonly number[]): number {
  const before = rows[index - 1];
  // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
  const after = rows[index];
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (after !== undefined) return after - ROW_SPACING / 2;
  return (before ?? HEADER_HEIGHT) + ROW_SPACING / 2;
}

/** The width of a participant's header box. */
export const HEADER_WIDTH = 140;

/** Where a participant dragged to `x` belongs in the left-to-right order. */
export function participantIndexAt(x: number, count: number): number {
  return Math.min(Math.max(Math.round((x - LEFT_MARGIN) / LIFELINE_SPACING), 0), Math.max(count - 1, 0));
}

/** Where a message dragged to `y` belongs in the top-to-bottom order. */
export function messageIndexAt(y: number, count: number): number {
  return Math.min(Math.max(Math.round((y - HEADER_HEIGHT) / ROW_SPACING) - 1, 0), Math.max(count - 1, 0));
}

/**
 * The participant drawn at a point: its header box (140 wide, as drawn) or the strip of its lifeline below it, `strip` wide.
 * Elsewhere on the canvas, including between lifelines, there is none.
 */
export function participantAt(layout: SequenceLayout, x: number, y: number, strip: number): number | undefined {
  return layout.lifelines.find((lifeline) => {
    const dx = Math.abs(lifeline.x - x);
    const headerHeight = lifeline.role === "actor" ? 72 : 50;
    const inHeader = y >= 0 && y <= headerHeight && dx <= HEADER_WIDTH / 2;
    const inLifeline = y >= HEADER_HEIGHT - 20 && y <= layout.height && dx <= strip / 2;
    return inHeader || inLifeline;
  })?.id;
}

export type DragKind =
  | { readonly kind: "participant"; readonly id: number }
  | { readonly kind: "message"; readonly id: number }
  | { readonly kind: "create"; readonly fromId: number }
  | { readonly kind: "end"; readonly id: number; readonly end: "from" | "to" };

export { useDrag, type DragEnd } from "../shared/useDrag";
