import { describe, expect, it } from "vitest";
import { gridLayers } from "./grid";

// VO-015 (FR-011, EC-04): the grid is a minor line every 16 px and a major line every 80 px at zoom 1, both scaled by the zoom; the
// minor grid is left out once its lines would be closer than 6 px, so the grid never becomes a dense texture.

describe("the spacings of the drafting grid", () => {
  it("are 16 px and 80 px at the drawing's own size", () => {
    expect(gridLayers(1)).toEqual({ minor: 16, major: 80 });
  });

  it("scale with the zoom", () => {
    expect(gridLayers(2)).toEqual({ minor: 32, major: 160 });
    expect(gridLayers(0.5)).toEqual({ minor: 8, major: 40 });
    expect(gridLayers(4)).toEqual({ minor: 64, major: 320 });
  });

  it("leave out the minor grid, and keep the major, when the zoom is so small that its lines would be under 6 px apart", () => {
    expect(gridLayers(0.25)).toEqual({ minor: null, major: 20 });
    expect(gridLayers(0.37).minor).toBeNull();
  });

  it("keep the minor grid when its lines are exactly 6 px apart", () => {
    expect(gridLayers(0.375).minor).toBe(6);
  });
});
