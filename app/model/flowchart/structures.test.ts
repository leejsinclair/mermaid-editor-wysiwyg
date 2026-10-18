// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory, type History } from "../../history/history";
import { readFlowchart } from "../../testing/mermaidReadback";
import { newDiagram } from "../newDiagram";
import type { FlowchartDiagram } from "../types";

// VO-023 (FR-010, FR-025): any structure is allowed. Every operation is accepted, each connection stays distinct,
// and Mermaid's parser reads the source with the same counts.

function build(spec: { nodes: number; links: readonly (readonly [number, number])[] }): FlowchartDiagram {
  let history: History = createHistory(newDiagram("d1", "flowchart"));
  for (let index = 0; index < spec.nodes; index += 1) {
    history = accepted(history, { op: "addNode", shape: "rectangle", position: { x: index * 400, y: 0 } });
  }
  for (const [from, to] of spec.links) {
    history = accepted(history, { op: "addConnection", from, to, line: "solid", ending: "arrow" });
  }
  return history.present as FlowchartDiagram;
}

function accepted(history: History, operation: Parameters<typeof commit>[1]): History {
  const result = commit(history, operation);
  expect(result.outcome).toEqual({ committed: true });
  return result.history;
}

const STRUCTURES = [
  ["a cycle", { nodes: 3, links: [[1, 2], [2, 3], [3, 1]] }],
  ["fan-in", { nodes: 4, links: [[1, 4], [2, 4], [3, 4]] }],
  ["fan-out", { nodes: 4, links: [[1, 2], [1, 3], [1, 4]] }],
  ["disconnected nodes", { nodes: 4, links: [[1, 2]] }],
  ["self-loops", { nodes: 2, links: [[1, 1], [2, 2], [1, 1]] }],
  ["duplicate connections", { nodes: 2, links: [[1, 2], [1, 2], [1, 2]] }],
  ["opposite connections", { nodes: 2, links: [[1, 2], [2, 1]] }],
] as const;

describe("flowchart structures", () => {
  it.each(STRUCTURES)("%s is built and read back by Mermaid with the same counts", async (_name, spec) => {
    const diagram = build(spec);

    const { vertices, edges } = await readFlowchart(generate(diagram).source);

    expect(new Set(diagram.content.connections.map((connection) => connection.id)).size).toBe(spec.links.length);
    expect(vertices).toHaveLength(spec.nodes);
    expect(edges.map((edge) => [edge.from, edge.to])).toEqual(spec.links.map(([from, to]) => [`n${String(from)}`, `n${String(to)}`]));
  });
});
