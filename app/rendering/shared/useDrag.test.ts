import { describe, expect, it } from "vitest";
import { withinVisibleBounds } from "./useDrag";

describe("withinVisibleBounds", () => {
  const drawing = { left: 100, top: 100, right: 900, bottom: 700 };
  const viewport = { left: 100, top: 100, right: 500, bottom: 500 };

  it("accepts points in the visible drawing", () => {
    expect(withinVisibleBounds({ x: 200, y: 200 }, drawing, viewport)).toBe(true);
  });

  it("rejects points clipped by the viewport even when inside drawing bounds", () => {
    expect(withinVisibleBounds({ x: 600, y: 200 }, drawing, viewport)).toBe(false);
  });
});
