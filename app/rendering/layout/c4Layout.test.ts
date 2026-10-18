import { describe, expect, it } from "vitest";
import { commit, createHistory } from "../../history/history";
import { boundary, c4Diagram, element, fullDiagram, node } from "../../testing/c4Builder";
import { C4_KINDS } from "../../model/c4/catalogue";
import type { C4Item } from "../../model/types";
import { BOUNDARIES_PER_ROW, c4Layout, SHAPES_PER_ROW, type C4Box } from "./c4Layout";

// VO-094: C4 items follow statement order, wrapping at Mermaid's four shapes and two boundaries per row, nested inside
// their boundaries; there is no free-position operation for C4.

const people = (from: number, count: number): C4Item[] => Array.from({ length: count }, (_, index) => element(from + index, "person"));
const boxOf = (boxes: readonly C4Box[], id: number): C4Box => {
  const found = boxes.find((box) => box.id === id);
  if (!found) throw new Error(`No box for ${String(id)}`);
  return found;
};
const inside = (inner: C4Box, outer: C4Box) =>
  inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
const overlap = (a: C4Box, b: C4Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe("shapes", () => {
  const { boxes } = c4Layout(c4Diagram("context", people(1, 10)).content);

  it("wrap after four to a row, in statement order, left to right then top to bottom", () => {
    expect(SHAPES_PER_ROW).toBe(4);
    const rows = [...new Set(boxes.map((box) => box.y))].sort((a, b) => a - b);
    expect(rows).toHaveLength(3);
    expect(rows.map((y) => boxes.filter((box) => box.y === y).map((box) => box.id))).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10],
    ]);
    for (const y of rows) {
      const xs = boxes.filter((box) => box.y === y).map((box) => box.x);
      expect(xs).toEqual([...xs].sort((a, b) => a - b));
    }
  });

  it("do not overlap", () => {
    for (const [index, a] of boxes.entries()) for (const b of boxes.slice(index + 1)) expect(overlap(a, b)).toBe(false);
  });
});

describe("boundaries", () => {
  it("wrap after two to a row, below the shapes at the same level, in statement order", () => {
    expect(BOUNDARIES_PER_ROW).toBe(2);
    const tree = [boundary(1, "generic", []), boundary(2, "generic", []), boundary(3, "generic", []), ...people(4, 2)];
    const { boxes } = c4Layout(c4Diagram("context", tree).content);

    const [a, b, c, d, e] = [1, 2, 3, 4, 5].map((id) => boxOf(boxes, id));
    expect(d?.y).toBe(e?.y);
    expect(a?.y).toBeGreaterThan((d?.y ?? 0) + (d?.height ?? 0) - 1);
    expect(a?.y).toBe(b?.y);
    expect(c?.y).toBeGreaterThan((a?.y ?? 0) + (a?.height ?? 0) - 1);
    expect(a?.x).toBeLessThan(b?.x ?? 0);
    expect(c?.x).toBe(a?.x);
  });

  it("hold their contents inside them, nested as deep as the tree goes", () => {
    const tree = [boundary(1, "enterprise", [element(2, "person"), boundary(3, "system", [...people(4, 5), boundary(9, "generic", [element(10, "person")])])])];
    const { boxes } = c4Layout(c4Diagram("context", tree).content);

    expect(inside(boxOf(boxes, 2), boxOf(boxes, 1))).toBe(true);
    expect(inside(boxOf(boxes, 3), boxOf(boxes, 1))).toBe(true);
    for (const id of [4, 5, 6, 7, 8, 9]) expect(inside(boxOf(boxes, id), boxOf(boxes, 3))).toBe(true);
    expect(inside(boxOf(boxes, 10), boxOf(boxes, 9))).toBe(true);
    expect(boxOf(boxes, 1).depth).toBe(0);
    expect(boxOf(boxes, 10).depth).toBe(3);
  });

  it("are sized to what they hold, and an empty one still has a box", () => {
    const { boxes } = c4Layout(c4Diagram("context", [boundary(1, "generic", []), boundary(2, "generic", people(3, 5))]).content);

    expect(boxOf(boxes, 1).width).toBeGreaterThan(0);
    expect(boxOf(boxes, 2).height).toBeGreaterThan(boxOf(boxes, 1).height);
  });
});

describe("Deployment nodes", () => {
  it("nest like boundaries, with Containers inside them", () => {
    const { boxes } = c4Layout(c4Diagram("deployment", [node(1, [element(2, "container"), node(3, [element(4, "container")])]), element(5, "container")]).content);

    expect(inside(boxOf(boxes, 4), boxOf(boxes, 3))).toBe(true);
    expect(inside(boxOf(boxes, 3), boxOf(boxes, 1))).toBe(true);
    expect(overlap(boxOf(boxes, 1), boxOf(boxes, 5))).toBe(false);
  });
});

describe.each(C4_KINDS)("a %s diagram holding everything its kind offers", (kind) => {
  const diagram = fullDiagram(kind);
  const { boxes, width, height } = c4Layout(diagram.content);

  it("has one box for every item, all inside the canvas, and no two siblings overlapping", () => {
    const count = (items: readonly C4Item[]): number => items.reduce((total, item) => total + 1 + (item.item === "element" ? 0 : count(item.children)), 0);
    expect(boxes).toHaveLength(count(diagram.content.tree));
    for (const box of boxes) expect(box.x + box.width <= width && box.y + box.height <= height && box.x >= 0 && box.y >= 0).toBe(true);
    const same = (a: C4Box, b: C4Box) => a.parentId === b.parentId;
    for (const [index, a] of boxes.entries()) for (const b of boxes.slice(index + 1)) if (same(a, b)) expect(overlap(a, b)).toBe(false);
  });

  it("is the same layout every time, and does not depend on the relationships", () => {
    expect(c4Layout(diagram.content)).toEqual(c4Layout(diagram.content));
    expect(c4Layout({ ...diagram.content, relationships: [] }).boxes).toEqual(boxes);
  });

  it("offers no operation that places an item freely", () => {
    const history = createHistory(diagram);

    const result = commit(history, { op: "moveNode", id: 1, position: { x: 5, y: 5 } });

    expect(result.outcome).toMatchObject({ committed: false });
    expect(result.history).toBe(history);
  });
});
