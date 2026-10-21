import { describe, expect, it } from "vitest";
import { compareLines } from "./compare";

// VO-032 (FR-010): two texts are compared line by line; each line is classed same, changed, removed or added, in order,
// with the line numbers on each side.

describe("compareLines", () => {
  it("classes equal texts as all same, with both line numbers", () => {
    expect(compareLines("a\nb", "a\nb")).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "same", original: "b", generated: "b", originalLine: 2, generatedLine: 2 },
    ]);
  });

  it("pairs a changed line as one changed entry", () => {
    expect(compareLines("a\nb\nc", "a\nX\nc")).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "changed", original: "b", generated: "X", originalLine: 2, generatedLine: 2 },
      { kind: "same", original: "c", generated: "c", originalLine: 3, generatedLine: 3 },
    ]);
  });

  it("classes a line the generated text lacks as removed, with its original line number", () => {
    expect(compareLines("a\nb\nc", "a\nc")).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "removed", original: "b", originalLine: 2 },
      { kind: "same", original: "c", generated: "c", originalLine: 3, generatedLine: 2 },
    ]);
  });

  it("classes a line the generated text gains as added, with its generated line number", () => {
    expect(compareLines("a\nc", "a\nb\nc")).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "added", generated: "b", generatedLine: 2 },
      { kind: "same", original: "c", generated: "c", originalLine: 2, generatedLine: 3 },
    ]);
  });
});
