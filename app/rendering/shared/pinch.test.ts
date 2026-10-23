import { describe, expect, it } from "vitest";
import { pinchZoom } from "./pinch";

// VO-040 (FR-028): a two-finger pinch scales the zoom by the ratio of the distance between the fingers now to the distance when
// the pinch began, within the zoom limits; a pinch that began with no distance leaves the zoom as it was.

const LIMITS = { min: 0.25, max: 4 };

describe("the zoom of a pinch", () => {
  it("grows as the fingers move apart and shrinks as they move together", () => {
    expect(pinchZoom(1, 100, 200, LIMITS)).toBe(2);
    expect(pinchZoom(1, 100, 50, LIMITS)).toBe(0.5);
    expect(pinchZoom(2, 100, 150, LIMITS)).toBe(3);
  });

  it("never goes past the limits", () => {
    expect(pinchZoom(2, 100, 1000, LIMITS)).toBe(4);
    expect(pinchZoom(0.5, 100, 10, LIMITS)).toBe(0.25);
  });

  it("leaves the zoom as it was when the fingers began with no distance between them", () => {
    expect(pinchZoom(1.5, 0, 100, LIMITS)).toBe(1.5);
    expect(pinchZoom(1.5, -5, 100, LIMITS)).toBe(1.5);
  });
});
