import { HEADER_HEIGHT, LEFT_MARGIN, LIFELINE_SPACING, ROW_SPACING, type SequenceLayout } from "../layout/sequenceLayout";

/** Where a participant dragged to `x` belongs in the left-to-right order. */
export function participantIndexAt(x: number, count: number): number {
  return Math.min(Math.max(Math.round((x - LEFT_MARGIN) / LIFELINE_SPACING), 0), Math.max(count - 1, 0));
}

/** Where a message dragged to `y` belongs in the top-to-bottom order. */
export function messageIndexAt(y: number, count: number): number {
  return Math.min(Math.max(Math.round((y - HEADER_HEIGHT) / ROW_SPACING) - 1, 0), Math.max(count - 1, 0));
}

/** The lifeline nearest `x`, if the point is within half a spacing of it. */
export function lifelineAt(layout: SequenceLayout, x: number): number | undefined {
  let nearest: { readonly id: number; readonly distance: number } | undefined;
  for (const lifeline of layout.lifelines) {
    const distance = Math.abs(lifeline.x - x);
    if (distance <= LIFELINE_SPACING / 2 && (nearest === undefined || distance < nearest.distance)) nearest = { id: lifeline.id, distance };
  }
  return nearest?.id;
}

export type DragKind =
  | { readonly kind: "participant"; readonly id: number }
  | { readonly kind: "message"; readonly id: number }
  | { readonly kind: "create"; readonly fromId: number }
  | { readonly kind: "end"; readonly id: number; readonly end: "from" | "to" };

export { useDrag, type DragEnd } from "../shared/useDrag";
