import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { createHistory, undo } from "../../history/history";
import { boundary, c4Diagram, c4Of, element, node, relationship } from "../../testing/c4Builder";
import { run } from "../../testing/run";
import type { C4Item } from "../types";

// VO-056: an element with relationships moved into a boundary, out to the top level and to another boundary, and a
// Deployment node and a Container re-nested, change membership, keep their relationships, show the new grouping in the
// source, and are one history entry each.

const childrenOf = (items: readonly C4Item[], id: number) => {
  const found = items.find((item) => item.id === id);
  return found && found.item !== "element" ? found.children.map((child) => child.id) : undefined;
};

/** Element 1 at the top level with relationships to elements 2 and 3; boundary 4 holds 2, boundary 5 is empty, 3 is top level. */
const container = () =>
  createHistory(
    c4Diagram("container", [element(1, "person"), boundary(4, "system", [element(2, "system")]), boundary(5, "generic", []), element(3, "container")], [relationship(10, 1, 2), relationship(11, 3, 1, "two-way")]),
  );

describe("moving an element that has relationships", () => {
  it("into a boundary, out to the top level and to another boundary changes only its membership", () => {
    const start = container();

    const inside = run(start, { op: "moveToParent", itemId: 1, parentId: 4 });
    const out = run(inside, { op: "moveToParent", itemId: 1, parentId: null });
    const across = run(out, { op: "moveToParent", itemId: 1, parentId: 5 });

    expect(childrenOf(c4Of(inside).content.tree, 4)).toEqual([2, 1]);
    expect(c4Of(out).content.tree.map((item) => item.id)).toEqual([4, 5, 3, 1]);
    expect(childrenOf(c4Of(across).content.tree, 5)).toEqual([1]);
    for (const history of [inside, out, across]) expect(c4Of(history).content.relationships).toEqual(c4Of(start).content.relationships);
    expect([inside.past.length, out.past.length, across.past.length]).toEqual([1, 2, 3]);
  });

  it("shows the new grouping in the source, with the relationships unchanged", () => {
    const moved = run(container(), { op: "moveToParent", itemId: 1, parentId: 5 });

    expect(generate(moved.present).source.split("\n").slice(1)).toEqual([
      '  System_Boundary(b4, "Boundary 4") {',
      '    System(e2, "Element 2", "Description 2")',
      "  }",
      '  Boundary(b5, "Boundary 5") {',
      '    Person(e1, "Element 1", "Description 1")',
      "  }",
      '  Container(e3, "Element 3", "Technology 3", "Description 3")',
      '  Rel(e1, e2, "Uses 10", "Technology 10")',
      '  BiRel(e3, e1, "Uses 11", "Technology 11")',
    ]);
  });

  it("is undone in one step", () => {
    const start = container();

    expect(undo(run(start, { op: "moveToParent", itemId: 1, parentId: 4 })).present).toEqual(start.present);
  });
});

describe("re-nesting in a Deployment diagram", () => {
  /** Node 1 holds Container 2 and node 3; node 4 is empty; Container 5 is at the top level; relationships to nodes and Containers. */
  const deployment = () =>
    createHistory(
      c4Diagram("deployment", [node(1, [element(2, "container"), node(3, [])]), node(4, []), element(5, "container")], [relationship(10, 2, 5), relationship(11, 3, 1), relationship(12, 4, 2)]),
    );

  it("moves a Container from one node to another, to the top level and into a node again", () => {
    const start = deployment();

    const other = run(start, { op: "moveToParent", itemId: 2, parentId: 4 });
    const top = run(other, { op: "moveToParent", itemId: 2, parentId: null });
    const back = run(top, { op: "moveToParent", itemId: 5, parentId: 1, index: 0 });

    expect(childrenOf(c4Of(other).content.tree, 4)).toEqual([2]);
    expect(c4Of(top).content.tree.map((item) => item.id)).toEqual([1, 4, 5, 2]);
    expect(childrenOf(c4Of(back).content.tree, 1)).toEqual([5, 3]);
    for (const history of [other, top, back]) expect(c4Of(history).content.relationships).toEqual(c4Of(start).content.relationships);
  });

  it("moves a node, with what it holds, into another node and out to the top level", () => {
    const start = deployment();

    const into = run(start, { op: "moveToParent", itemId: 1, parentId: 4 });
    const out = run(into, { op: "moveToParent", itemId: 3, parentId: null });

    expect(generate(into.present).source.split("\n").slice(1, 6)).toEqual([
      '  Deployment_Node(d4, "Node 4", "Technology 4", "Description 4") {',
      '    Deployment_Node(d1, "Node 1", "Technology 1", "Description 1") {',
      '      Container(e2, "Element 2", "Technology 2", "Description 2")',
      '      Deployment_Node(d3, "Node 3", "Technology 3", "Description 3") {',
      "      }",
    ]);
    expect(c4Of(out).content.tree.map((item) => item.id)).toEqual([4, 5, 3]);
    expect(c4Of(out).content.relationships).toEqual(c4Of(start).content.relationships);
    expect([into.past.length, out.past.length]).toEqual([1, 2]);
  });
});
