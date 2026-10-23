import { useEffect, useImperativeHandle, useState, type RefObject, type Ref } from "react";

/** Tells whoever shows the zoom (the status area) how large the drawing is shown, now and whenever it changes. */
export function useReportZoom(zoom: number, report: ((zoom: number) => void) | undefined): void {
  useEffect(() => {
    report?.(zoom);
  }, [zoom, report]);
}

/** What the toolbar may ask of a canvas: change how large the drawing is shown. Panning is done in the canvas itself. */
export interface ViewHandle {
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly fit: () => void;
}

const ZOOM_STEP = 1.25;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;

const clamp = (zoom: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

/**
 * The zoom of an SVG drawing that sits in a scrolling container (Sequence and C4): the drawing is shown at `zoom` times
 * its own size by a viewBox, and the container's scroll bars pan it. Fit shows the whole drawing, never larger than it is.
 */
export function useSvgViewport(handleRef: Ref<ViewHandle> | undefined, size: { readonly width: number; readonly height: number }, container: RefObject<HTMLElement | null>): { readonly zoom: number; readonly zoomTo: (zoom: number) => void } {
  const [zoom, setZoom] = useState(1);
  useImperativeHandle(handleRef, () => ({
    zoomIn: () => {
      setZoom((current) => clamp(current * ZOOM_STEP));
    },
    zoomOut: () => {
      setZoom((current) => clamp(current / ZOOM_STEP));
    },
    fit: () => {
      const box = container.current;
      if (!box) return;
      setZoom(clamp(Math.min(1, box.clientWidth / size.width, box.clientHeight / size.height)));
      box.scrollTo(0, 0);
    },
  }));
  return { zoom, zoomTo: (next) => { setZoom(clamp(next)); } };
}
