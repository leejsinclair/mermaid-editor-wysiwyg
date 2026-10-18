import { describe, expect, it } from "vitest";
import { commit, createHistory } from "../../history/history";
import { newDiagram } from "../newDiagram";
import type { FlowchartDiagram } from "../types";
import { addConnection, addNode } from "./apply";

// VO-021 (EC-02): deleting a node removes it and every connection that touches it, and adds nothing.

const start = () => newDiagram("d1", "flowchart") as FlowchartDiagram;
const nodeIds = (diagram: FlowchartDiagram) => diagram.content.nodes.map((node) => node.id);
const links = (diagram: FlowchartDiagram) => diagram.content.connections.map((c) => [c.from, c.to]);

function remove(diagram: FlowchartDiagram, itemId: number): FlowchartDiagram {
  const result = commit(createHistory(diagram), { op: "deleteItem", itemId });
  expect(result.outcome).toEqual({ committed: true });
  return result.history.present as FlowchartDiagram;
}

/** Nodes 1, 2, 3 in a chain 1 -> 2 -> 3. */
function chain(): FlowchartDiagram {
  let diagram = addNode(start(), "rectangle", { x: 0, y: 0 });
  diagram = addNode(diagram, "circle", { x: 400, y: 0 });
  diagram = addNode(diagram, "diamond", { x: 800, y: 0 });
  diagram = addConnection(diagram, 1, 2, "solid", "arrow");
  return addConnection(diagram, 2, 3, "solid", "arrow");
}

describe("deleting a node", () => {
  it("in the middle of a chain removes it and both its connections, joining nothing", () => {
    const after = remove(chain(), 2);

    expect(nodeIds(after)).toEqual([1, 3]);
    expect(links(after)).toEqual([]);
  });

  it("with many connections removes all of them and leaves the others", () => {
    let diagram = chain();
    diagram = addNode(diagram, "stadium", { x: 0, y: 400 });
    for (let count = 0; count < 5; count += 1) diagram = addConnection(diagram, 2, 6, "dotted", "plain");
    diagram = addConnection(diagram, 6, 2, "thick", "arrow");
    diagram = addConnection(diagram, 1, 3, "solid", "arrow");

    const after = remove(diagram, 2);

    expect(nodeIds(after)).toEqual([1, 3, 6]);
    expect(links(after)).toEqual([[1, 3]]);
  });

  it("as the only node leaves an empty diagram", () => {
    const after = remove(addNode(start(), "hexagon", { x: 0, y: 0 }), 1);

    expect(after.content).toEqual({ nodes: [], connections: [] });
  });

  it("with self-loops, duplicates and connections in both directions removes every one of them", () => {
    let diagram = addNode(addNode(start(), "rectangle", { x: 0, y: 0 }), "circle", { x: 400, y: 0 });
    diagram = addConnection(diagram, 1, 1, "solid", "arrow");
    diagram = addConnection(diagram, 1, 2, "solid", "arrow");
    diagram = addConnection(diagram, 1, 2, "solid", "arrow");
    diagram = addConnection(diagram, 2, 1, "dotted", "arrow");

    const after = remove(diagram, 1);

    expect(nodeIds(after)).toEqual([2]);
    expect(links(after)).toEqual([]);
  });

  it("never reuses the freed ids", () => {
    const after = addNode(remove(chain(), 3), "rectangle", { x: 0, y: 300 });

    expect(nodeIds(after)).toEqual([1, 2, 6]);
  });
});
