import { describe, expect, it } from "vitest";
import { readFlowchart } from "./flowchart";
import { scanC4, scanFlowchart, scanSequence } from "./scan";
import type { FlowchartSnapshot } from "./snapshots";

// VO-020 (FR-006, US2-AS3): a construct the editor has no exact match for is kept as the nearest one and reported as
// approximated with what it became; an invisible link is dropped and reported.

const vertex = (key: string, shape: string) => ({ key, text: key, shape });
const edge = (from: string, to: string, arrow: string, stroke: string) => ({ from, to, text: "", arrow, stroke });

describe("flowchart approximations", () => {
  it("keeps each shape without an exact match as the nearest editor shape", () => {
    const shapes = ["doublecircle", "odd", "trapezoid", "inv_trapezoid", "lean_left", "weird"];
    const snapshot: FlowchartSnapshot = {
      direction: "TD",
      vertices: shapes.map((shape, index) => vertex(`S${String(index)}`, shape)),
      edges: [],
      subgraphs: [],
    };
    const result = readFlowchart(snapshot);
    expect(result.nodes.map((node) => node.shape)).toEqual(["circle", "rectangle", "rectangle", "rectangle", "parallelogram", "rectangle"]);
  });

  it("keeps circle and cross endings as plain lines, and two-way circle and cross as both", () => {
    const snapshot: FlowchartSnapshot = {
      direction: "TD",
      vertices: [vertex("A", "square"), vertex("B", "square")],
      edges: [
        edge("A", "B", "arrow_circle", "normal"),
        edge("A", "B", "arrow_cross", "normal"),
        edge("A", "B", "double_arrow_circle", "normal"),
        edge("A", "B", "double_arrow_cross", "normal"),
      ],
      subgraphs: [],
    };
    const result = readFlowchart(snapshot);
    expect(result.connections.map((connection) => connection.ending)).toEqual(["plain", "plain", "both", "both"]);
  });

  it("drops an invisible link", () => {
    const snapshot: FlowchartSnapshot = {
      direction: "TD",
      vertices: [vertex("A", "square"), vertex("B", "square")],
      edges: [edge("A", "B", "arrow_open", "invisible")],
      subgraphs: [],
    };
    expect(readFlowchart(snapshot).connections).toEqual([]);
  });

  it("reports each approximation and each dropped link at its line, with what it became", () => {
    const text = [
      "flowchart TD",
      "  A(((Double)))",
      "  B>Asym]",
      "  C[/Trap\\]",
      "  D[\\Inv/]",
      "  E[\\LeanLeft\\]",
      "  F@{ shape: weird }",
      "  A --o B",
      "  A --x B",
      "  A o--o B",
      "  A ~~~ B",
    ].join("\n");
    const entries = scanFlowchart(text).filter((entry) => entry.category === "approximated");
    expect(entries.map((entry) => [entry.line, entry.becomes])).toEqual([
      [2, "a circle"],
      [3, "a rectangle"],
      [4, "a rectangle"],
      [5, "a rectangle"],
      [6, "a parallelogram"],
      [7, "a rectangle"],
      [8, "a plain line"],
      [9, "a plain line"],
      [10, "a two-way link"],
    ]);
    expect(scanFlowchart(text).find((entry) => entry.line === 11)).toMatchObject({ category: "dropped", construct: "invisible link" });
  });
});

describe("sequence and C4 approximations", () => {
  it("reports an actor of another kind as a participant and a message with no visible text with its default text", () => {
    const text = ['sequenceDiagram', '  actor B@{ "type": "database" }', "  A->>B: "].join("\n");
    const entries = scanSequence(text);
    expect(entries.map((entry) => [entry.line, entry.category, entry.becomes])).toEqual([
      [2, "approximated", "a participant"],
      [3, "approximated", "a message with the default text"],
    ]);
  });

  it("reports a C4 element the kind does not offer as the nearest type, and the Deployment boundary as dropped", () => {
    const context = ['C4Context', '  Container(app, "App", "React")'].join("\n");
    expect(scanC4(context)).toEqual([
      expect.objectContaining({ line: 2, category: "approximated", construct: "Container", becomes: "a System" }),
    ]);
    const deployment = ['C4Deployment', '  Boundary(b, "Edge") {', '    Node(n, "Box", "Linux")', "  }"].join("\n");
    expect(scanC4(deployment)).toEqual([
      expect.objectContaining({ line: 2, category: "dropped", construct: "Boundary" }),
    ]);
  });

  it("reports Dynamic relationship numbers out of order as approximated", () => {
    const text = ["C4Dynamic", '  Person(a, "A")', '  Person(b, "B")', '  RelIndex(2, a, b, "Second")', '  RelIndex(1, b, a, "First")'].join("\n");
    expect(scanC4(text).map((entry) => [entry.line, entry.category, entry.construct])).toEqual([
      [4, "approximated", "RelIndex"],
      [5, "approximated", "RelIndex"],
    ]);
  });
});

// VO-017 (FR-008, US4-AS2): every approximated entry says what the construct became, as a phrase that completes
// "Kept as …" (feature 006, research R6).
describe("what an approximated construct became", () => {
  const flowchart = [
    "flowchart TD",
    "  A(((Double)))",
    "  B>Flag]",
    "  C[/Trap\\]",
    "  D[\\Inverted/]",
    "  E[\\Lean\\]",
    "  F@{ shape: cloud }",
    "  A o--o B",
    "  A --o C",
  ].join("\n");
  const sequence = ["sequenceDiagram", '  actor U@{ "type": "boundary" }', "  A->>B: ", "  loop Every day", "    A->>B: Hi", "  end"].join("\n");
  // Context offers no Component, so it is kept as the nearest type; RelIndex numbers and direction hints are kept as order.
  const c4 = [
    "C4Context",
    '  Component(c, "C", "T")',
    '  Container(a, "A", "T")',
    '  RelIndex(2, a, c, "Uses")',
    '  Rel_U(a, c, "Up")',
  ].join("\n");
  const entries = [...scanFlowchart(flowchart), ...scanSequence(sequence), ...scanC4(c4)].filter((entry) => entry.category === "approximated");

  it("covers every kind of approximated construct", () => {
    expect(new Set(entries.map((entry) => entry.reason)).size).toBeGreaterThanOrEqual(9);
  });

  it("names, for each one, what it became, as the end of 'Kept as …'", () => {
    for (const entry of entries) expect(entry.becomes, `${entry.construct} on line ${String(entry.line)}`).toMatch(/^a /);
  });
});
