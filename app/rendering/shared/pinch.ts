// The zoom of a two-finger pinch (spec 007, FR-028): the zoom the pinch began at, scaled by how far the fingers are now from each
// other against how far they were, and kept within the limits the zoom buttons keep to.

export interface ZoomLimits {
  readonly min: number;
  readonly max: number;
}

export function pinchZoom(startZoom: number, startDistance: number, distance: number, limits: ZoomLimits): number {
  if (startDistance <= 0) return startZoom;
  return Math.min(limits.max, Math.max(limits.min, (startZoom * distance) / startDistance));
}
