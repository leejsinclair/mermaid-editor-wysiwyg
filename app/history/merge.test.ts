import { describe, expect, it } from "vitest";
import { addNode } from "../model/flowchart/apply";
import { newDiagram } from "../model/newDiagram";
import type { FlowchartDiagram, Node } from "../model/types";
import { commit, createHistory, redo, seal, undo, type History } from "./history";

// VO-063 (FR-019, EC-19): uninterrupted arrow moves of one node are one undo step; selecting another item and
// reselecting the node, focus leaving the canvas, any other change, Undo and Redo each seal the group, so a later move is
// a second step; a move onto an occupied position resolves to the nearest free one.

const start = (): History => {
  let diagram = newDiagram("d1", "flowchart") as FlowchartDiagram;
  diagram = addNode(diagram, "rectangle", { x: 0, y: 0 });
  diagram = addNode(diagram, "circle", { x: 400, y: 0 });
  return createHistory(diagram);
};

const nodeOf = (history: History, id: number): Node => {
  const found = history.present.type === "flowchart" ? history.present.content.nodes.find((node) => node.id === id) : undefined;
  if (!found) throw new Error(`No node ${String(id)}`);
  return found;
};

/** One arrow press: the node moves 10 to the right of where it is, in the group named by `key`. */
const step = (history: History, id: number, key = `move:${String(id)}`): History => {
  const { x, y } = nodeOf(history, id);
  return commit(history, { op: "moveNode", id, position: { x: x + 10, y } }, key).history;
};

describe("uninterrupted arrow moves of one node", () => {
  it("are one undo step, and one Undo returns the node to where it started", () => {
    const moved = step(step(step(start(), 1), 1), 1);

    expect(nodeOf(moved, 1).x).toBe(30);
    expect(moved.past).toHaveLength(1);
    expect(nodeOf(undo(moved), 1).x).toBe(0);
    expect(undo(moved).past).toHaveLength(0);
  });

  it("are redone in one step", () => {
    const moved = step(step(start(), 1), 1);

    expect(nodeOf(redo(undo(moved)), 1).x).toBe(20);
  });

  it("clear the redo stack like any other change", () => {
    const moved = step(step(start(), 1), 1);
    const afterUndo = undo(moved);

    expect(step(afterUndo, 1).future).toEqual([]);
  });
});

describe("a group is sealed", () => {
  it("by seal, as when the selection changes or focus leaves the canvas, so the next move is a second step", () => {
    const first = step(step(start(), 1), 1);
    const second = step(seal(first), 1);

    expect(second.past).toHaveLength(2);
    expect(nodeOf(second, 1).x).toBe(30);
    expect(nodeOf(undo(second), 1).x).toBe(20);
    expect(nodeOf(undo(undo(second)), 1).x).toBe(0);
  });

  it("by a change of another kind, which is its own step", () => {
    const first = step(start(), 1);
    const renamed = commit(first, { op: "setLabel", itemId: 1, field: "label", text: "Renamed" }).history;
    const second = step(renamed, 1);

    expect(second.past).toHaveLength(3);
  });

  it("by Undo and by Redo", () => {
    const moved = step(step(start(), 1), 1);

    expect(step(undo(moved), 1).past).toHaveLength(1);
    expect(step(redo(undo(moved)), 1).past).toHaveLength(2);
  });

  it("by moving another node, whose moves form a group of their own", () => {
    const mixed = step(step(step(step(start(), 1), 1), 2), 2);

    expect(mixed.past).toHaveLength(2);
    expect(nodeOf(undo(mixed), 2).x).toBe(400);
    expect(nodeOf(undo(mixed), 1).x).toBe(20);
  });

  it("not by a change that is refused or changes nothing", () => {
    const first = step(start(), 1);
    const refused = commit(first, { op: "setLabel", itemId: 1, field: "label", text: "   " }).history;
    const unchanged = commit(first, { op: "moveNode", id: 1, position: { x: 10, y: 0 } }, "move:1").history;

    expect(step(refused, 1).past).toHaveLength(1);
    expect(step(unchanged, 1).past).toHaveLength(1);
  });

  it("not by seal when no group is open", () => {
    const history = start();

    expect(seal(history)).toBe(history);
  });
});

describe("a move onto an occupied position", () => {
  it("resolves to the nearest free position, in a merged group as well", () => {
    const first = commit(start(), { op: "moveNode", id: 1, position: { x: 390, y: 0 } }, "move:1").history;
    const second = commit(first, { op: "moveNode", id: 1, position: { x: 410, y: 20 } }, "move:1").history;

    expect(nodeOf(first, 1)).toMatchObject({ x: 390, y: -64 });
    expect(nodeOf(second, 1)).toMatchObject({ x: 410, y: 64 });
    expect(second.past).toHaveLength(1);
  });
});
