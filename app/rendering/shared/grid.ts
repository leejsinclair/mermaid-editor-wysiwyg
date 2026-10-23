// The spacings of the drafting grid on screen (spec 007, FR-011, EC-04): a minor line every 16 px and a major line every 80 px at the
// drawing's own size, both scaled by the zoom, so the grid moves and scales with the drawing. At a zoom so small that minor lines
// would be closer than 6 px the minor grid is left out and only the major grid shows, so it never becomes a dense texture.

export interface GridLayers {
  /** Pixels between minor lines, or null where they would be too close to read. */
  readonly minor: number | null;
  /** Pixels between major lines. */
  readonly major: number;
}

export const MINOR_GAP = 16;
export const MAJOR_GAP = 80;
const LEAST_MINOR_PX = 6;

export function gridLayers(zoom: number): GridLayers {
  const minor = MINOR_GAP * zoom;
  return { minor: minor >= LEAST_MINOR_PX ? minor : null, major: MAJOR_GAP * zoom };
}
