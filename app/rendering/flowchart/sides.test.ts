import { describe, expect, it } from "vitest";
import { nearestSides, type Box } from "./sides";

// VO-032 (FR-008): the chosen sides face each other along the larger gap; the same node keeps the bottom-to-top loop.
const box = (x: number, y: number): Box => ({ x, y, width: 100, height: 50 });
const centre = box(300, 300);

describe("nearestSides", () => {
  it("joins the facing sides when the target is above, below, left or right", () => {
    expect(nearestSides(centre, box(300, 100))).toEqual({ source: "top", target: "bottom" });
    expect(nearestSides(centre, box(300, 500))).toEqual({ source: "bottom", target: "top" });
    expect(nearestSides(centre, box(60, 300))).toEqual({ source: "left", target: "right" });
    expect(nearestSides(centre, box(540, 300))).toEqual({ source: "right", target: "left" });
  });

  it("follows the larger gap when the target is diagonal", () => {
    expect(nearestSides(centre, box(700, 360))).toEqual({ source: "right", target: "left" });
    expect(nearestSides(centre, box(340, 700))).toEqual({ source: "bottom", target: "top" });
    expect(nearestSides(centre, box(-100, 200))).toEqual({ source: "left", target: "right" });
    expect(nearestSides(centre, box(260, -100))).toEqual({ source: "top", target: "bottom" });
  });

  it("follows the larger centre offset when the nodes overlap", () => {
    expect(nearestSides(centre, box(380, 320))).toEqual({ source: "right", target: "left" });
    expect(nearestSides(centre, box(320, 340))).toEqual({ source: "bottom", target: "top" });
  });

  it("keeps the bottom-to-top loop for the same node", () => {
    expect(nearestSides(centre, centre)).toEqual({ source: "bottom", target: "top" });
  });
});
