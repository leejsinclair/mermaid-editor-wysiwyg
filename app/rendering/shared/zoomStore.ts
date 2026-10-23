import { useSyncExternalStore } from "react";

/**
 * Where the canvas's zoom is kept for whoever shows it (spec 007, FR-008). A zoom changes many times a second while the drawing is
 * zoomed, so it is not held in the editor's own state, which would redraw the whole editor each time: only what shows the zoom
 * subscribes to it.
 */
export interface ZoomStore {
  readonly get: () => number;
  readonly set: (zoom: number) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

export function createZoomStore(): ZoomStore {
  let zoom = 1;
  const listeners = new Set<() => void>();
  return {
    get: () => zoom,
    set: (next) => {
      if (next === zoom) return;
      zoom = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const useZoom = (store: ZoomStore): number => useSyncExternalStore(store.subscribe, store.get);
