import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Movement below this many pixels is a click, not a drag. */
const DRAG_THRESHOLD = 5;

interface Drag<K> {
  readonly what: K;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
}

interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Whether a point lies inside both the drawing and the viewport clipping it. */
export function withinVisibleBounds(point: { readonly x: number; readonly y: number }, drawing: Bounds, viewport: Bounds): boolean {
  return (
    point.x >= Math.max(drawing.left, viewport.left) &&
    point.x <= Math.min(drawing.right, viewport.right) &&
    point.y >= Math.max(drawing.top, viewport.top) &&
    point.y <= Math.min(drawing.bottom, viewport.bottom)
  );
}

export interface DragEnd<K> {
  readonly what: K;
  /** The point released at, in the drawing's own coordinates. */
  readonly x: number;
  readonly y: number;
  /** Whether the pointer was released over the drawing; a line let go outside it is cancelled. */
  readonly inside: boolean;
}

/**
 * Tracks one pointer drag over the drawing. `begin` starts it from a pointer-down; moving past a few pixels makes it
 * a drag, and releasing then calls `onDrop` with where it ended, in the drawing's own coordinates whatever its `zoom`. A release without movement is left to the click.
 */
export function useDrag<K>(svg: RefObject<SVGSVGElement | null>, viewport: RefObject<HTMLElement | null>, onDrop: (end: DragEnd<K>) => void, zoom = 1) {
  const [drag, setDrag] = useState<Drag<K> | undefined>();
  // The drag as of the last pointer event, so a release reads it without running side effects inside a state update.
  const latest = useRef<Drag<K> | undefined>(undefined);
  const active = drag !== undefined;

  const update = useCallback((next: Drag<K> | undefined) => {
    latest.current = next;
    setDrag(next);
  }, []);

  useEffect(() => {
    if (!active) return;
    const local = (event: PointerEvent) => {
      const box = svg.current?.getBoundingClientRect();
      return { x: (event.clientX - (box?.left ?? 0)) / zoom, y: (event.clientY - (box?.top ?? 0)) / zoom };
    };
    const onMove = (event: PointerEvent) => {
      if (latest.current) update({ ...latest.current, ...local(event) });
    };
    const onUp = (event: PointerEvent) => {
      const point = local(event);
      const current = latest.current;
      update(undefined);
      const box = svg.current?.getBoundingClientRect();
      const visible = viewport.current?.getBoundingClientRect();
      const inside = box !== undefined && visible !== undefined && withinVisibleBounds({ x: event.clientX, y: event.clientY }, box, visible);
      if (current && Math.hypot(point.x - current.startX, point.y - current.startY) >= DRAG_THRESHOLD) onDrop({ what: current.what, ...point, inside });
    };
    // Escape ends the drag and is marked handled, so the editor's own Escape does not also act on this press.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      update(undefined);
      event.preventDefault();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [active, svg, viewport, onDrop, update, zoom]);

  const begin = (what: K) => (event: { clientX: number; clientY: number; button: number }) => {
    if (event.button !== 0) return;
    const box = svg.current?.getBoundingClientRect();
    const x = event.clientX - (box?.left ?? 0);
    const y = event.clientY - (box?.top ?? 0);
    update({ what, startX: x, startY: y, x, y });
  };

  const moved = drag !== undefined && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= DRAG_THRESHOLD;
  return { begin, current: moved ? drag : undefined };
}
