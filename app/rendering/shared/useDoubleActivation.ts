import { useRef } from "react";
import { isDoubleActivation, type Release } from "./interaction";

/** Movement of a press below this many pixels is still a click. */
const CLICK_SLOP = 5;

interface Point {
  readonly clientX: number;
  readonly clientY: number;
}

/**
 * Tells a double click, tap or pen tap from two single ones. `pressed` notes where a press began and `released` is called
 * with each click; it reports true, and calls `onDouble`, when the click completes a double activation of the item.
 */
export function useDoubleActivation(onDouble: (itemId: number) => void) {
  const last = useRef<Release | undefined>(undefined);
  const down = useRef<Point | undefined>(undefined);
  return {
    pressed: (event: Point): void => {
      down.current = { clientX: event.clientX, clientY: event.clientY };
    },
    released: (itemId: number, event: Point & { readonly timeStamp: number }): boolean => {
      const start = down.current;
      const dragged = start !== undefined && Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > CLICK_SLOP;
      const next: Release = { time: event.timeStamp, x: event.clientX, y: event.clientY, itemId, dragged };
      const double = isDoubleActivation(last.current, next);
      last.current = double ? undefined : next;
      if (double) onDouble(itemId);
      return double;
    },
  };
}
