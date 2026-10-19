// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, type History } from "../../history/history";
import { c4Of, emptyC4 } from "../../testing/c4Builder";
import { readC4 } from "../../testing/mermaidReadback";
import { run } from "../../testing/run";

// VO-051: in a Dynamic diagram relationships are numbered from 1 by their position, with no gaps or duplicates, as they
// are added, reordered and deleted; one-way ones carry the number in the source, two-way ones are BiRel at their
// position; no operation sets a number.

/** Elements 1 to 4; relationships 5 (1 to 2), 6 (2 to 3, two-way), 7 (3 to 4), 8 (4 to 1, two-way). */
function dynamic(): History {
  return run(
    emptyC4("dynamic"),
    { op: "addElement", elementType: "person" },
    { op: "addElement", elementType: "container" },
    { op: "addElement", elementType: "component" },
    { op: "addElement", elementType: "system" },
    { op: "addRelationship", from: 1, to: 2, direction: "one-way" },
    { op: "addRelationship", from: 2, to: 3, direction: "two-way" },
    { op: "addRelationship", from: 3, to: 4, direction: "one-way" },
    { op: "addRelationship", from: 4, to: 1, direction: "two-way" },
  );
}

const relationshipLines = (history: History) =>
  generate(history.present).source.split("\n").filter((line) => /^ {2}(?:Rel|BiRel|RelIndex)\(/.test(line)).map((line) => line.trim());

const order = (history: History) => c4Of(history).content.relationships.map((relationship) => relationship.id);

describe("a Dynamic diagram's relationships", () => {
  it("are numbered from 1 by position, one-way with RelIndex and two-way as BiRel without a number", () => {
    expect(relationshipLines(dynamic())).toEqual([
      'RelIndex(1, e1, e2, "Uses")',
      'BiRel(e2, e3, "Uses")',
      'RelIndex(3, e3, e4, "Uses")',
      'BiRel(e4, e1, "Uses")',
    ]);
  });

  it("are renumbered when one is moved earlier or later, each move one history entry", () => {
    const start = dynamic();

    const earlier = run(start, { op: "reorder", itemId: 7, toIndex: 0 });
    const later = run(earlier, { op: "reorder", itemId: 5, toIndex: 3 });

    expect(order(earlier)).toEqual([7, 5, 6, 8]);
    expect(relationshipLines(earlier)).toEqual(['RelIndex(1, e3, e4, "Uses")', 'RelIndex(2, e1, e2, "Uses")', 'BiRel(e2, e3, "Uses")', 'BiRel(e4, e1, "Uses")']);
    expect(order(later)).toEqual([7, 6, 8, 5]);
    expect(relationshipLines(later).filter((line) => line.startsWith("RelIndex")).map((line) => line.slice(0, 11))).toEqual(["RelIndex(1,", "RelIndex(4,"]);
    expect([earlier.past.length, later.past.length]).toEqual([start.past.length + 1, start.past.length + 2]);
  });

  it("are renumbered without a gap when one is deleted, and a new one is numbered last", () => {
    const deleted = run(dynamic(), { op: "deleteItem", itemId: 5 });
    const added = run(deleted, { op: "addRelationship", from: 1, to: 3, direction: "one-way" });

    expect(relationshipLines(deleted)).toEqual(['BiRel(e2, e3, "Uses")', 'RelIndex(2, e3, e4, "Uses")', 'BiRel(e4, e1, "Uses")']);
    expect(relationshipLines(added).at(-1)).toBe('RelIndex(4, e1, e3, "Uses")');
    expect(c4Of(deleted).content.tree).toHaveLength(4);
  });

  it("are read back by Mermaid in the new order", async () => {
    const moved = run(dynamic(), { op: "reorder", itemId: 8, toIndex: 1 });

    const read = await readC4(generate(moved.present).source);

    expect(read.relationships.map((relationship) => [relationship.type, relationship.from, relationship.to])).toEqual([
      ["rel", "e1", "e2"],
      ["birel", "e4", "e1"],
      ["birel", "e2", "e3"],
      ["rel", "e3", "e4"],
    ]);
  });

  it("have no stored number, and no operation takes one", () => {
    const relationship = c4Of(dynamic()).content.relationships[0];

    expect(Object.keys(relationship ?? {}).sort((a, b) => a.localeCompare(b))).toEqual(["direction", "from", "id", "label", "technology", "to"]);
  });

  it("are refused a reorder to a position that does not exist, or of an item that is not a relationship", () => {
    const start = dynamic();

    for (const [itemId, toIndex, reason] of [
      [5, 4, "outOfRange"],
      [5, -1, "outOfRange"],
      [5, 1.5, "outOfRange"],
      [99, 0, "unknownItem"],
      [1, 0, "unknownItem"],
    ] as const) {
      const result = commit(start, { op: "reorder", itemId, toIndex });
      expect(result.outcome).toMatchObject({ committed: false, rejection: { reason } });
      expect(result.history).toBe(start);
    }
  });

  it("are not reordered by moving to where they already are", () => {
    const start = dynamic();

    const result = commit(start, { op: "reorder", itemId: 6, toIndex: 1 });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(start);
  });
});

describe("a C4 diagram that is not Dynamic", () => {
  it.each(["context", "container", "component", "deployment"] as const)("offers no reorder in %s, which has no numbers", (kind) => {
    const history = emptyC4(kind);

    const result = commit(history, { op: "reorder", itemId: 1, toIndex: 0 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "notOfferedInKind", details: { kind } } });
    expect(result.history).toBe(history);
  });
});
