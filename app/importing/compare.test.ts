import { describe, expect, it } from "vitest";
import { compareLines, type CompareLine } from "./compare";

// VO-032 (FR-010): two texts are compared line by line; each line is classed same, changed, removed or added, in order,
// with the line numbers on each side.

describe("compareLines", () => {
  it("classes equal texts as all same, with both line numbers", () => {
    expect(compareLines("a\nb", "a\nb").lines).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "same", original: "b", generated: "b", originalLine: 2, generatedLine: 2 },
    ]);
  });

  it("pairs a changed line as one changed entry", () => {
    expect(compareLines("a\nb\nc", "a\nX\nc").lines).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "changed", original: "b", generated: "X", originalLine: 2, generatedLine: 2 },
      { kind: "same", original: "c", generated: "c", originalLine: 3, generatedLine: 3 },
    ]);
  });

  it("classes a line the generated text lacks as removed, with its original line number", () => {
    expect(compareLines("a\nb\nc", "a\nc").lines).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "removed", original: "b", originalLine: 2 },
      { kind: "same", original: "c", generated: "c", originalLine: 3, generatedLine: 2 },
    ]);
  });

  it("classes a line the generated text gains as added, with its generated line number", () => {
    expect(compareLines("a\nc", "a\nb\nc").lines).toEqual([
      { kind: "same", original: "a", generated: "a", originalLine: 1, generatedLine: 1 },
      { kind: "added", generated: "b", generatedLine: 2 },
      { kind: "same", original: "c", generated: "c", originalLine: 2, generatedLine: 3 },
    ]);
  });
});

// VO-023 (FR-010, US5-AS3): within the work limit the comparison is exact: the fewest removed and added lines possible,
// and the result is not marked simplified (feature 006).

/** Removed plus added lines; a changed line is one of each. */
const EDITS: Readonly<Record<CompareLine["kind"], number>> = { same: 0, changed: 2, removed: 1, added: 1 };
const edits = (lines: readonly CompareLine[]): number => lines.reduce((sum, line) => sum + EDITS[line.kind], 0);

describe("compareLines within the work limit", () => {
  it.each([
    ["a\nb\nc\nd\ne\nf", "a\nx\nc\ny\ne\nz", 6],
    ["a\nb\na\nb", "b\na\nb\na", 2],
    ["one\ntwo\nthree", "zero\none\ntwo\nthree\nfour", 2],
    ["x\ny\nz", "p\nq", 5],
    ["", "a", 2],
  ])("marks the fewest removed and added lines (%#)", (original, generated, fewest) => {
    const result = compareLines(original, generated);
    expect(edits(result.lines)).toBe(fewest);
    expect(result.simplified).toBe(false);
  });
});


// VO-020 (FR-010, US5-AS1): two 10,000-line texts that differ in a few hundred scattered lines compare in under two
// seconds, and exactly the differing lines are marked.
describe("compareLines on large texts", () => {
  it("compares two 10,000-line texts differing in 300 lines in under 2 seconds, marking exactly those lines", () => {
    const original = Array.from({ length: 10000 }, (_, index) => `line ${String(index + 1)}`);
    const differing = new Set(Array.from({ length: 300 }, (_, index) => index * 33 + 7));
    const generated = original.map((line, index) => (differing.has(index) ? `${line} changed` : line));

    const started = performance.now();
    const result = compareLines(original.join("\n"), generated.join("\n"));
    const elapsed = performance.now() - started;

    expect(elapsed).toBeLessThan(2000);
    const changed = result.lines.filter((line) => line.kind !== "same");
    expect(changed.every((line) => line.kind === "changed")).toBe(true);
    expect(new Set(changed.map((line) => (line.originalLine ?? 0) - 1))).toEqual(differing);
  });
});

// VO-021 (FR-010, US5-AS2): texts too different to compare exactly within the work limit keep their shared start and end
// lines as same, mark the middle as changed, removed or added, and say the result was simplified.
describe("compareLines past the work limit", () => {
  it("matches the shared start and end lines, marks the whole middle, and says it was simplified", () => {
    const shared = ["first", "second", "third"];
    const ends = ["end one", "end two", "end three"];
    const original = [...shared, ...Array.from({ length: 5000 }, (_, index) => `left ${String(index)}`), ...ends];
    const generated = [...shared, ...Array.from({ length: 5000 }, (_, index) => `right ${String(index)}`), ...ends];

    const started = performance.now();
    const result = compareLines(original.join("\n"), generated.join("\n"));
    const elapsed = performance.now() - started;

    expect(result.simplified).toBe(true);
    expect(elapsed).toBeLessThan(2000);
    expect(result.lines.slice(0, 3).map((line) => line.kind)).toEqual(["same", "same", "same"]);
    expect(result.lines.slice(-3).map((line) => line.kind)).toEqual(["same", "same", "same"]);
    expect(result.lines.slice(3, -3).every((line) => line.kind !== "same")).toBe(true);
  });
});

// VO-025 (FR-010, US5-AS2): memory stays bounded. Two completely different 5,000-line texts would need 25 million table
// cells under a lines × lines comparison; the memory in use (heap and array buffers) must grow by less than 64 MB, measured
// straight after the comparison, before the garbage it made can be collected.
describe("compareLines memory", () => {
  it("grows memory in use by less than 64 MB comparing two completely different 5,000-line texts", () => {
    const original = Array.from({ length: 5000 }, (_, index) => `left ${String(index)}`).join("\n");
    const generated = Array.from({ length: 5000 }, (_, index) => `right ${String(index)}`).join("\n");
    const inUse = (): number => {
      const usage = process.memoryUsage();
      return usage.heapUsed + usage.arrayBuffers;
    };
    (globalThis as { gc?: () => void }).gc?.();
    const before = inUse();
    const result = compareLines(original, generated);
    const grown = (inUse() - before) / (1024 * 1024);
    expect(result.lines.length).toBeGreaterThan(0);
    expect(grown).toBeLessThan(64);
  });
});
