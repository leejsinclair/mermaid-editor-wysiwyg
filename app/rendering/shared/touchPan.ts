import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { pinchZoom } from "./pinch";
import { MAX_ZOOM, MIN_ZOOM } from "./viewport";

// Touch on the scrolling SVG canvases, Sequence and C4 (spec 007, FR-028). Their SVG takes no native touch scrolling or zooming
// (`touch-action: none`, so the page never zooms), which leaves the editor to do it: one finger dragged across empty canvas scrolls
// the area with the finger, and two fingers pinching zoom the drawing about the middle between them. A finger that goes down on an
// item, a handle or a line end belongs to that drag (feature 004), and a second finger that goes down meanwhile is ignored until it
// ends: the drag continues and no zoom starts. Mouse and pen are not touched here.

interface Point {
  readonly x: number;
  readonly y: number;
}

interface Pinch {
  readonly startZoom: number;
  readonly startDistance: number;
  /** Where the middle between the fingers was in the scrolling area, and how far it was scrolled, when the pinch began. */
  readonly offset: Point;
  readonly scrolled: Point;
}

const distanceBetween = (first: Point, second: Point): number => Math.hypot(first.x - second.x, first.y - second.y);

/** The parts of the canvas that own a finger that goes down on them: items, handles and line ends, and anything typed in. */
const OWNED = "[data-zone], input, textarea, [contenteditable]";

export function useTouchPan(scroller: RefObject<HTMLElement | null>, zoom: number, zoomTo: (zoom: number) => void): void {
  const now = useRef({ zoom, zoomTo });
  const wanted = useRef<{ readonly startZoom: number; readonly offset: Point; readonly scrolled: Point } | undefined>(undefined);
  useEffect(() => {
    now.current = { zoom, zoomTo };
  }, [zoom, zoomTo]);

  // After a pinch has changed the zoom and the drawing has been drawn at its new size, scroll so the point between the fingers stays put.
  useLayoutEffect(() => {
    const area = scroller.current;
    const keep = wanted.current;
    if (!area || !keep) return;
    const scale = zoom / keep.startZoom;
    area.scrollTo((keep.scrolled.x + keep.offset.x) * scale - keep.offset.x, (keep.scrolled.y + keep.offset.y) * scale - keep.offset.y);
  }, [zoom, scroller]);

  useEffect(() => {
    const area = scroller.current;
    if (!area) return;
    const fingers = new Map<number, Point>();
    const owned = new Set<number>();
    let pinch: Pinch | undefined;

    const startPinch = (): void => {
      const [first, second] = [...fingers.values()];
      if (!first || !second) return;
      const box = area.getBoundingClientRect();
      pinch = {
        startZoom: now.current.zoom,
        startDistance: distanceBetween(first, second),
        offset: { x: (first.x + second.x) / 2 - box.left, y: (first.y + second.y) / 2 - box.top },
        scrolled: { x: area.scrollLeft, y: area.scrollTop },
      };
    };

    const onDown = (event: PointerEvent): void => {
      if (event.pointerType !== "touch") return;
      if (event.target instanceof Element && event.target.closest(OWNED)) {
        owned.add(event.pointerId);
        return;
      }
      if (owned.size > 0) return;
      fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (fingers.size === 2) startPinch();
    };

    const onMove = (event: PointerEvent): void => {
      const last = fingers.get(event.pointerId);
      if (event.pointerType !== "touch" || !last) return;
      const next = { x: event.clientX, y: event.clientY };
      fingers.set(event.pointerId, next);
      const [first, second] = [...fingers.values()];
      if (pinch && first && second) {
        const zoomed = pinchZoom(pinch.startZoom, pinch.startDistance, distanceBetween(first, second), { min: MIN_ZOOM, max: MAX_ZOOM });
        wanted.current = { startZoom: pinch.startZoom, offset: pinch.offset, scrolled: pinch.scrolled };
        now.current.zoomTo(zoomed);
      } else if (fingers.size === 1) {
        area.scrollBy(last.x - next.x, last.y - next.y);
      }
    };

    const onEnd = (event: PointerEvent): void => {
      owned.delete(event.pointerId);
      fingers.delete(event.pointerId);
      if (fingers.size < 2) pinch = undefined;
      if (fingers.size === 0) wanted.current = undefined;
    };

    area.addEventListener("pointerdown", onDown);
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerup", onEnd);
    area.addEventListener("pointercancel", onEnd);
    return () => {
      area.removeEventListener("pointerdown", onDown);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerup", onEnd);
      area.removeEventListener("pointercancel", onEnd);
    };
  }, [scroller]);
}
