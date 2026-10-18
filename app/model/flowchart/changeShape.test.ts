import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory } from "../../history/history";
import { newDiagram } from "../newDiagram";
import type { FlowchartDiagram, FlowchartShape } from "../types";
import { FLOWCHART_SHAPES } from "./catalogue";
import { addConnection, addNode } from "./apply";

// VO-026: changing a node's shape keeps its label, position and connections; the source shows the new shape;
// the change is one history entry.

function connected(): FlowchartDiagram {
  let diagram = addNode(addNode(newDiagram("d1", "flowchart") as FlowchartDiagram, "rectangle", { x: 40, y: 80 }), "circle", { x: 400, y: 0 });
  diagram = addNode(diagram, "hexagon", { x: 800, y: 0 });
  diagram = addConnection(diagram, 1, 2, "solid", "arrow", "in");
  return addConnection(diagram, 3, 1, "dotted", "plain", "out");
}

const ALL = FLOWCHART_SHAPES.map((entry): FlowchartShape => entry.shape);

describe("changing a node's shape", () => {
  it.each(ALL)("to %s keeps the label, position and connections and shows in the source", (shape) => {
    const before = connected();
    const history = createHistory(before);

    const result = commit(history, { op: "changeType", itemId: 1, to: { kind: "shape", shape } });

    const rectangle = before.content.nodes[0];
    if (shape === "rectangle") {
      expect(result.outcome).toEqual({ committed: false });
      return;
    }
    expect(result.outcome).toEqual({ committed: true });
    const after = result.history.present as FlowchartDiagram;
    expect(after.content.nodes[0]).toEqual({ ...rectangle, shape });
    expect(after.content.nodes.slice(1)).toEqual(before.content.nodes.slice(1));
    expect(after.content.connections).toEqual(before.content.connections);
    expect(generate(after).source).not.toBe(generate(before).source);
  });

  it("is one history entry, and restoring the previous present restores the old shape", () => {
    const history = createHistory(connected());

    const result = commit(history, { op: "changeType", itemId: 1, to: { kind: "shape", shape: "diamond" } });

    expect(result.history.past).toHaveLength(1);
    expect((result.history.past[0] as FlowchartDiagram).content.nodes[0]?.shape).toBe("rectangle");
  });

  it("rejects a shape the editor does not offer", () => {
    const result = commit(createHistory(connected()), { op: "changeType", itemId: 1, to: { kind: "shape", shape: "blob" as never } });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "unknownShape" } });
  });
});
