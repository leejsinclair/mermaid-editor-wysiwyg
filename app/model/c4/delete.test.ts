import { describe, expect, it } from "vitest";
import { commit, createHistory, undo } from "../../history/history";
import { boundary, c4Diagram, c4Of, element, node, relationship } from "../../testing/c4Builder";
import { run } from "../../testing/run";
import { liftNotice } from "./apply";

// VO-053: deleting an element removes its relationships and membership; deleting a relationship removes only it;
// deleting a boundary or Deployment node lifts its contents, in order, and removes its own relationships.

const ids = (items: readonly { id: number }[]) => items.map((item) => item.id);

/** Top level 1, boundary 2 holding 3, boundary 4 (holding 5 and 6) and 7, then 8; relationships 10 (1-3), 11 (3-5), 12 (5-6), 13 (6-8). */
function diagram() {
  return createHistory(
    c4Diagram(
      "component",
      [element(1, "person"), boundary(2, "container", [element(3, "component"), boundary(4, "generic", [element(5, "component"), element(6, "component")]), element(7, "component")]), element(8, "system")],
      [relationship(10, 1, 3), relationship(11, 3, 5), relationship(12, 5, 6), relationship(13, 6, 8)],
    ),
  );
}

describe("deleting an element", () => {
  it("removes it and every relationship that starts or ends at it, and nothing else", () => {
    const history = run(diagram(), { op: "deleteItem", itemId: 5 });

    expect(ids(c4Of(history).content.relationships)).toEqual([10, 13]);
    expect(ids(c4Of(history).content.tree)).toEqual([1, 2, 8]);
    const kept = c4Of(history).content.tree[1];
    expect(kept?.item === "boundary" && kept.children.map((child) => child.id)).toEqual([3, 4, 7]);
    const inner = kept?.item === "boundary" ? kept.children[1] : undefined;
    expect(inner?.item === "boundary" && inner.children.map((child) => child.id)).toEqual([6]);
  });

  it("is one history entry, and Undo restores everything", () => {
    const start = diagram();

    const deleted = run(start, { op: "deleteItem", itemId: 3 });

    expect(deleted.past).toHaveLength(1);
    expect(undo(deleted).present).toEqual(start.present);
  });
});

describe("deleting a relationship", () => {
  it("removes only that relationship, leaving its ends and every other item", () => {
    const start = diagram();

    const history = run(start, { op: "deleteItem", itemId: 11 });

    expect(ids(c4Of(history).content.relationships)).toEqual([10, 12, 13]);
    expect(c4Of(history).content.tree).toEqual(c4Of(start).content.tree);
  });
});

describe("deleting a boundary", () => {
  it("lifts its contents to its parent at its position, in order, and adds no relationship", () => {
    const history = run(diagram(), { op: "deleteItem", itemId: 4 });

    const outer = c4Of(history).content.tree[1];
    expect(outer?.item === "boundary" && outer.children.map((child) => child.id)).toEqual([3, 5, 6, 7]);
    expect(ids(c4Of(history).content.relationships)).toEqual([10, 11, 12, 13]);
  });

  it("lifts the contents of a top-level boundary to the top level", () => {
    const history = run(diagram(), { op: "deleteItem", itemId: 2 });

    expect(ids(c4Of(history).content.tree)).toEqual([1, 3, 4, 7, 8]);
  });

  it("is one history entry", () => {
    expect(run(diagram(), { op: "deleteItem", itemId: 2 }).past).toHaveLength(1);
  });

  it("names itself in a notice when it had contents, and not when it was empty", () => {
    const withEmpty = run(diagram(), { op: "addContainer", container: "generic" });

    expect(liftNotice(c4Of(diagram()), 2)).toBe('The boundary "Boundary 2" was deleted. What it held moved up one level.');
    expect(liftNotice(c4Of(withEmpty), 11)).toBeUndefined();
    expect(liftNotice(c4Of(diagram()), 1)).toBeUndefined();
    expect(liftNotice(c4Of(diagram()), 99)).toBeUndefined();
  });
});

describe("deleting a Deployment node", () => {
  const start = () =>
    createHistory(
      c4Diagram("deployment", [node(1, [element(2, "container"), node(3, [element(4, "container")])]), element(5, "container")], [relationship(10, 1, 5), relationship(11, 2, 4), relationship(12, 3, 5), relationship(13, 5, 2)]),
    );

  it("lifts its contents in order and removes the relationships that start or end at the node", () => {
    const history = run(start(), { op: "deleteItem", itemId: 1 });

    expect(ids(c4Of(history).content.tree)).toEqual([2, 3, 5]);
    expect(ids(c4Of(history).content.relationships)).toEqual([11, 12, 13]);
  });

  it("removes the relationships of a nested node, and lifts its contents into the node around it", () => {
    const history = run(start(), { op: "deleteItem", itemId: 3 });

    expect(ids(c4Of(history).content.relationships)).toEqual([10, 11, 13]);
    const outer = c4Of(history).content.tree[0];
    expect(outer?.item === "deployment-node" && outer.children.map((child) => child.id)).toEqual([2, 4]);
  });

  it("names itself in a notice", () => {
    expect(liftNotice(c4Of(start()), 1)).toBe('The deployment node "Node 1" was deleted. What it held moved up one level.');
  });
});

describe("deleting something that does not exist", () => {
  it("is refused and changes nothing", () => {
    const start = diagram();

    const result = commit(start, { op: "deleteItem", itemId: 99 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "unknownItem" } });
    expect(result.history).toBe(start);
  });
});
