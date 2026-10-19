import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory } from "../../history/history";
import { newDiagram } from "../newDiagram";
import type { FlowchartDiagram } from "../types";
import { addConnection, addNode } from "./apply";

// VO-020: a connection's label can be edited, including to empty; its ends, line style and ending are unchanged.

function labelled(label: string): FlowchartDiagram {
  let diagram = newDiagram("d1", "flowchart") as FlowchartDiagram;
  diagram = addNode(diagram, "rectangle", { x: 0, y: 0 });
  diagram = addNode(diagram, "circle", { x: 400, y: 0 });
  return addConnection(diagram, 1, 2, "dotted", "both", label);
}

const connectionOf = (diagram: FlowchartDiagram) => {
  const connection = diagram.content.connections[0];
  if (!connection) throw new Error("No connection");
  return connection;
};

describe("editing a connection's label", () => {
  it("changes the label in the diagram and in the source", () => {
    const history = createHistory(labelled("old"));

    const { history: after, outcome } = commit(history, { op: "setLabel", itemId: 3, field: "label", text: "new" });

    expect(outcome).toEqual({ committed: true });
    const present = after.present as FlowchartDiagram;
    expect(connectionOf(present).label).toBe("new");
    expect(generate(present).source).toContain('<-.->|"new"|');
    expect(generate(present).source).not.toContain("old");
  });

  it("accepts an empty label and then writes the connection without one", () => {
    const { history: after, outcome } = commit(createHistory(labelled("old")), {
      op: "setLabel",
      itemId: 3,
      field: "label",
      text: "",
    });

    expect(outcome).toEqual({ committed: true });
    const present = after.present as FlowchartDiagram;
    expect(connectionOf(present).label).toBe("");
    expect(generate(present).source).toContain("n1 <-.-> n2");
    expect(generate(present).source).not.toContain("|");
  });

  it("leaves the ends, line style and ending unchanged", () => {
    const before = labelled("old");

    const { history: after } = commit(createHistory(before), { op: "setLabel", itemId: 3, field: "label", text: "new" });

    expect(connectionOf(after.present as FlowchartDiagram)).toEqual({ ...connectionOf(before), label: "new" });
  });
});
