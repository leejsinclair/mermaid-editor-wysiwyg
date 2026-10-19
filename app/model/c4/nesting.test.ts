// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, type History } from "../../history/history";
import { c4Of, emptyC4 } from "../../testing/c4Builder";
import { readC4 } from "../../testing/mermaidReadback";
import { run } from "../../testing/run";
import type { C4Item } from "../types";
import { BOUNDARY_TYPES_BY_KIND } from "./catalogue";
import { walkItems } from "./tree";

// VO-054: an element belongs to at most one boundary; every nesting of boundaries the kind offers is accepted and
// appears nested in the source; a boundary moved inside itself or one of its own boundaries is refused (nestingCycle).

const KINDS_WITH_BOUNDARIES = ["context", "container", "component", "dynamic"] as const;

const membership = (items: readonly C4Item[]) => walkItems(items).filter((item) => item.item === "element").map((element) => element.id);

describe.each(KINDS_WITH_BOUNDARIES)("boundaries in a %s diagram", (kind) => {
  const types = BOUNDARY_TYPES_BY_KIND[kind];
  const pairs = types.flatMap((outer) => types.map((inner) => [outer, inner] as const));

  it.each(pairs)("accept a %s boundary holding a %s boundary holding an element, nested in the source", async (outer, inner) => {
    const history = run(
      emptyC4(kind),
      { op: "addContainer", container: outer },
      { op: "addContainer", container: inner, parentId: 1 },
      { op: "addElement", elementType: "person", parentId: 2 },
    );

    const read = await readC4(generate(history.present).source);

    expect(read.boundaries.map((boundary) => [boundary.alias, boundary.parent])).toEqual([
      ["b1", "global"],
      ["b2", "b1"],
    ]);
    expect(read.shapes.map((shape) => [shape.alias, shape.parent])).toEqual([["e3", "b2"]]);
  });
});

describe("an element's membership", () => {
  const start = () =>
    run(
      emptyC4("container"),
      { op: "addContainer", container: "system" },
      { op: "addContainer", container: "generic" },
      { op: "addElement", elementType: "person", parentId: 1 },
    );

  it("is exactly one place: moving it into another boundary takes it out of the first", () => {
    const history = run(start(), { op: "moveToParent", itemId: 3, parentId: 2 });

    const [first, second] = c4Of(history).content.tree;
    expect([first?.item === "boundary" && first.children.length, second?.item === "boundary" && second.children.map((child) => child.id)]).toEqual([0, [3]]);
    expect(membership(c4Of(history).content.tree)).toEqual([3]);
  });

  it("is the top level when it is moved out", () => {
    const history = run(start(), { op: "moveToParent", itemId: 3, parentId: null });

    expect(c4Of(history).content.tree.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("can be at a chosen position among the contents of the boundary it moves into", () => {
    const history = run(start(), { op: "addElement", elementType: "system", parentId: 2 }, { op: "addElement", elementType: "system", parentId: 2 }, { op: "moveToParent", itemId: 3, parentId: 2, index: 1 });

    const target = c4Of(history).content.tree[1];
    expect(target?.item === "boundary" && target.children.map((child) => child.id)).toEqual([4, 3, 5]);
  });

  it("is not changed by moving it to where it already is", () => {
    const history = start();

    const result = commit(history, { op: "moveToParent", itemId: 3, parentId: 1 });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(history);
  });
});

describe("moving a boundary", () => {
  /** Boundary 1 holds boundary 2, which holds boundary 3; boundary 4 is separate. */
  const nested = (): History =>
    run(
      emptyC4("context"),
      { op: "addContainer", container: "enterprise" },
      { op: "addContainer", container: "system", parentId: 1 },
      { op: "addContainer", container: "generic", parentId: 2 },
      { op: "addContainer", container: "generic" },
    );

  it.each([
    ["itself", 1, 1],
    ["its own boundary", 1, 2],
    ["a boundary two levels down", 1, 3],
    ["itself, when nested", 2, 2],
    ["its own boundary, when nested", 2, 3],
  ] as const)("inside %s is refused with nestingCycle and changes nothing", (_name, itemId, parentId) => {
    const start = nested();

    const result = commit(start, { op: "moveToParent", itemId, parentId });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "nestingCycle" } });
    expect(result.history).toBe(start);
  });

  it("into a boundary that is not its own is accepted, with everything it holds", () => {
    const history = run(nested(), { op: "moveToParent", itemId: 1, parentId: 4 });

    const outer = c4Of(history).content.tree;
    expect(outer.map((item) => item.id)).toEqual([4]);
    expect(walkItems(outer).map((item) => item.id)).toEqual([4, 1, 2, 3]);
  });

  it("out to the top level is accepted", () => {
    const history = run(nested(), { op: "moveToParent", itemId: 3, parentId: null });

    expect(c4Of(history).content.tree.map((item) => item.id)).toEqual([1, 4, 3]);
  });
});

describe("a place something cannot go", () => {
  it("is refused when the parent does not exist, or is an element", () => {
    const start = run(emptyC4("container"), { op: "addElement", elementType: "person" }, { op: "addElement", elementType: "system" }, { op: "addContainer", container: "generic" });

    expect(commit(start, { op: "moveToParent", itemId: 1, parentId: 99 }).outcome).toMatchObject({ rejection: { reason: "unknownItem" } });
    expect(commit(start, { op: "moveToParent", itemId: 99, parentId: 3 }).outcome).toMatchObject({ rejection: { reason: "unknownItem" } });
    const result = commit(start, { op: "moveToParent", itemId: 3, parentId: 2 });
    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "parentNotAllowed", details: { parent: "System", kind: "container" } } });
    expect(result.history).toBe(start);
  });

  it("is refused for a boundary type the kind does not offer", () => {
    expect(commit(emptyC4("component"), { op: "addContainer", container: "enterprise" }).outcome).toMatchObject({ rejection: { reason: "notOfferedInKind", details: { kind: "component" } } });
    expect(commit(emptyC4("deployment"), { op: "addContainer", container: "generic" }).outcome).toMatchObject({ rejection: { reason: "notOfferedInKind" } });
    expect(commit(emptyC4("context"), { op: "addContainer", container: "deployment-node" }).outcome).toMatchObject({ rejection: { reason: "notOfferedInKind" } });
  });
});
