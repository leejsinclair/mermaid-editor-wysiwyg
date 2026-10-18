// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import type { FlowchartDiagram, Node } from "../types";
import { addConnection, addNode, moveNode } from "./apply";
import { overlaps } from "./freePosition";

// VO-015: moving a node changes only its position; it never collides with itself or another node; equally near
// candidates resolve by the fixed outward ring order (EC-01, DC-03).

const empty = (): FlowchartDiagram => ({
  id: "d1",
  name: "Untitled flowchart",
  type: "flowchart",
  nextId: 1,
  changedAt: "",
  content: { nodes: [], connections: [] },
});

/** Node 1 at (0, 0), node 2 at (400, 0), node 3 at (800, 0), joined 1 -> 2 and 2 -> 3. */
function chain(): FlowchartDiagram {
  let diagram = addNode(empty(), "rectangle", { x: 0, y: 0 });
  diagram = addNode(diagram, "circle", { x: 400, y: 0 });
  diagram = addNode(diagram, "diamond", { x: 800, y: 0 });
  diagram = addConnection(diagram, 1, 2, "solid", "arrow");
  return addConnection(diagram, 2, 3, "dotted", "plain", "next");
}

const node = (diagram: FlowchartDiagram, id: number): Node => {
  const found = diagram.content.nodes.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No node ${String(id)}`);
  return found;
};

describe("moveNode to a free spot", () => {
  it("changes only that node's position, keeping every connection's ends and the source identical", () => {
    const before = chain();
    const after = moveNode(before, 2, { x: 400, y: 300 });

    expect(node(after, 2)).toMatchObject({ x: 400, y: 300, label: "Circle", shape: "circle" });
    expect(after.content.connections).toEqual(before.content.connections);
    expect(after.content.nodes.filter((other) => other.id !== 2)).toEqual(before.content.nodes.filter((other) => other.id !== 2));
    expect(generate(after).source).toBe(generate(before).source);
  });

  it("generates the same source every time (DC-03)", () => {
    const diagram = moveNode(chain(), 1, { x: 40, y: 500 });

    expect(generate(diagram).source).toBe(generate(diagram).source);
  });
});

describe("moveNode onto an occupied position", () => {
  it("lands at the nearest free position and overlaps no other node", () => {
    const after = moveNode(chain(), 1, { x: 410, y: 20 });

    // Node 2 sits at (400, 0); the nearest way clear of its 160 x 64 footprint is straight down to y = 64.
    expect(node(after, 1)).toMatchObject({ x: 410, y: 64 });
    for (const other of after.content.nodes.filter((candidate) => candidate.id !== 1)) {
      expect(overlaps(node(after, 1), other)).toBe(false);
    }
  });

  it("does not collide with itself: a small move over its own old footprint is kept exactly", () => {
    const after = moveNode(chain(), 2, { x: 410, y: 10 });

    expect(node(after, 2)).toMatchObject({ x: 410, y: 10 });
  });

  it("resolves equally near free positions by the fixed ring order, north first, then clockwise", () => {
    // Node 2 at (400, 0): requesting exactly its position is equally near above (400, -64) and below (400, 64).
    const after = moveNode(chain(), 1, { x: 400, y: 0 });

    expect(node(after, 1)).toMatchObject({ x: 400, y: -64 });
  });

  it("resolves the same tie the same way every time", () => {
    const first = moveNode(chain(), 1, { x: 400, y: 0 });
    const second = moveNode(chain(), 1, { x: 400, y: 0 });

    expect(node(first, 1)).toEqual(node(second, 1));
  });
});
