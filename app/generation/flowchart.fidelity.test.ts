// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { CONNECTION_TYPES, FLOWCHART_SHAPES } from "../model/flowchart/catalogue";
import type { Connection, FlowchartDiagram, Node } from "../model/types";
import { readFlowchart } from "../testing/mermaidReadback";
import { generate } from "./generate";

// VO-007: every shape and connection type, with and without labels, is read back by Mermaid's parser as itself.

const VERTEX_TYPE = new Map([
  ["rectangle", "square"],
  ["rounded", "round"],
  ["stadium", "stadium"],
  ["diamond", "diamond"],
  ["circle", "circle"],
  ["parallelogram", "lean_right"],
  ["cylinder", "cylinder"],
  ["subroutine", "subroutine"],
  ["hexagon", "hexagon"],
]);
const EDGE_TYPE = new Map([
  ["arrow", "arrow_point"],
  ["plain", "arrow_open"],
  ["both", "double_arrow_point"],
]);
const EDGE_STROKE = new Map([
  ["solid", "normal"],
  ["dotted", "dotted"],
  ["thick", "thick"],
]);

function diagramWith(connectionLabel: string): FlowchartDiagram {
  const nodes: Node[] = FLOWCHART_SHAPES.map((entry, index) => ({
    id: index + 1,
    shape: entry.shape,
    label: `Node ${String(index + 1)}`,
    x: index * 200,
    y: 0,
  }));
  const connections: Connection[] = CONNECTION_TYPES.map((entry, index) => ({
    id: nodes.length + index + 1,
    from: index + 1,
    to: ((index + 1) % nodes.length) + 1,
    line: entry.line,
    ending: entry.ending,
    label: connectionLabel,
  }));
  return {
    id: "d1",
    name: "Untitled flowchart",
    type: "flowchart",
    nextId: nodes.length + connections.length + 1,
    changedAt: "",
    content: { nodes, connections },
  };
}

describe.each([
  ["without labels", ""],
  ["with labels", "Label"],
])("a flowchart of every shape and connection type, %s", (_name, connectionLabel) => {
  const diagram = diagramWith(connectionLabel);

  it("is accepted by Mermaid's parser, which reports each vertex shape and its text", async () => {
    const { vertices } = await readFlowchart(generate(diagram).source);

    expect(vertices.map(({ id, type, text }) => [id, type, text])).toEqual(
      diagram.content.nodes.map((node) => [`n${String(node.id)}`, VERTEX_TYPE.get(node.shape), node.label]),
    );
  });

  it("is read back with every edge type, stroke and label", async () => {
    const { edges } = await readFlowchart(generate(diagram).source);

    expect(edges.map(({ from, to, type, stroke, text }) => [from, to, type, stroke, text])).toEqual(
      diagram.content.connections.map((connection) => [
        `n${String(connection.from)}`,
        `n${String(connection.to)}`,
        EDGE_TYPE.get(connection.ending),
        EDGE_STROKE.get(connection.line),
        connection.label,
      ]),
    );
  });
});
