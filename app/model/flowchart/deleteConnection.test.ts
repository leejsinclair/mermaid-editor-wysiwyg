import { describe, expect, it } from "vitest";
import { commit, createHistory } from "../../history/history";
import { newDiagram } from "../newDiagram";
import type { FlowchartDiagram } from "../types";
import { addConnection, addNode } from "./apply";

// VO-022: deleting a connection removes only that connection.

describe("deleting a connection", () => {
  it("removes only the one chosen, even when an identical one exists, and leaves everything else identical", () => {
    let diagram = addNode(addNode(newDiagram("d1", "flowchart") as FlowchartDiagram, "rectangle", { x: 0, y: 0 }), "circle", { x: 400, y: 0 });
    diagram = addConnection(diagram, 1, 2, "solid", "arrow", "same");
    diagram = addConnection(diagram, 1, 2, "solid", "arrow", "same");
    diagram = addConnection(diagram, 2, 1, "dotted", "plain");
    const [first, second, third] = diagram.content.connections;

    const result = commit(createHistory(diagram), { op: "deleteItem", itemId: second?.id ?? -1 });

    expect(result.outcome).toEqual({ committed: true });
    const after = result.history.present as FlowchartDiagram;
    expect(after.content.nodes).toEqual(diagram.content.nodes);
    expect(after.content.connections).toEqual([first, third]);
  });
});
