import { describe, expect, it } from "vitest";
import { scanFlowchart } from "./scan";
import { layoutFlowchart } from "./layout";
import { readFlowchart } from "./flowchart";
import type { FlowchartSnapshot } from "./snapshots";

// VO-007 (FR-005): a flowchart snapshot becomes the editor's nodes and connections with the same shape, line, ending,
// label and endpoints; ids run from 1 in document order (nodes first, then connections).

const vertex = (key: string, shape: string, text = key) => ({ key, text, shape });
const edge = (from: string, to: string, arrow: string, stroke: string, text = "") => ({ from, to, text, arrow, stroke });
const snapshot = (
  vertices: FlowchartSnapshot["vertices"],
  edges: FlowchartSnapshot["edges"],
  direction: FlowchartSnapshot["direction"] = "TD",
): FlowchartSnapshot => ({ direction, vertices, edges, subgraphs: [] });

describe("readFlowchart", () => {
  it("maps every node shape the editor has to the same shape", () => {
    const shapes: readonly (readonly [string, string])[] = [
      ["square", "rectangle"],
      ["round", "rounded"],
      ["stadium", "stadium"],
      ["cylinder", "cylinder"],
      ["circle", "circle"],
      ["diamond", "diamond"],
      ["hexagon", "hexagon"],
      ["lean_right", "parallelogram"],
      ["subroutine", "subroutine"],
    ];
    const result = readFlowchart(snapshot(shapes.map(([mermaid], index) => vertex(`N${String(index)}`, mermaid, "x")), []));
    expect(result.nodes.map((node) => node.shape)).toEqual(shapes.map(([, editor]) => editor));
  });

  it("maps every connection form the editor has to the same line style and ending", () => {
    const forms: readonly (readonly [string, string, string])[] = [
      ["arrow_point", "normal", "solid/arrow"],
      ["arrow_open", "normal", "solid/plain"],
      ["arrow_point", "dotted", "dotted/arrow"],
      ["arrow_open", "dotted", "dotted/plain"],
      ["arrow_point", "thick", "thick/arrow"],
      ["arrow_open", "thick", "thick/plain"],
      ["double_arrow_point", "normal", "solid/both"],
    ];
    const edges = forms.map(([arrow, stroke]) => edge("A", "B", arrow, stroke));
    const result = readFlowchart(snapshot([vertex("A", "square"), vertex("B", "square")], edges));
    expect(result.connections.map((connection) => `${connection.line}/${connection.ending}`)).toEqual(
      forms.map(([, , expected]) => expected),
    );
  });

  it("keeps labels, endpoints and the order of nodes and connections", () => {
    const result = readFlowchart(
      snapshot(
        [vertex("A", "square", "Start"), vertex("B", "round", "Next"), vertex("C", "diamond", "Ok?")],
        [edge("A", "B", "arrow_point", "normal", "go"), edge("B", "C", "arrow_point", "normal")],
      ),
    );
    expect(result.nodes.map((node) => [node.id, node.label, node.shape])).toEqual([
      [1, "Start", "rectangle"],
      [2, "Next", "rounded"],
      [3, "Ok?", "diamond"],
    ]);
    expect(result.connections.map((connection) => [connection.id, connection.from, connection.to, connection.label])).toEqual([
      [4, 1, 2, "go"],
      [5, 2, 3, ""],
    ]);
    expect(result.nextId).toBe(6);
  });

  it("keeps self-loops, parallel connections and cycles", () => {
    const result = readFlowchart(
      snapshot(
        [vertex("A", "square"), vertex("B", "square")],
        [
          edge("A", "A", "arrow_point", "normal"),
          edge("A", "B", "arrow_point", "normal"),
          edge("A", "B", "arrow_open", "dotted", "again"),
          edge("B", "A", "arrow_point", "normal"),
        ],
      ),
    );
    expect(result.connections.map((connection) => [connection.from, connection.to])).toEqual([
      [1, 1],
      [1, 2],
      [1, 2],
      [2, 1],
    ]);
  });

  it("makes a bare id a rectangle labelled with the id", () => {
    const result = readFlowchart(snapshot([vertex("Solo", "")], []));
    expect(result.nodes).toEqual([expect.objectContaining({ id: 1, shape: "rectangle", label: "Solo" })]);
  });

  it("takes node positions from the layout, following the direction", () => {
    const edges = [edge("A", "B", "arrow_point", "normal"), edge("B", "C", "arrow_point", "normal")];
    const result = readFlowchart(snapshot([vertex("A", "square"), vertex("B", "square"), vertex("C", "square")], edges, "LR"));
    const expected = layoutFlowchart({ direction: "LR", ids: [1, 2, 3], edges: [{ from: 1, to: 2 }, { from: 2, to: 3 }] });
    expect(result.nodes.map((node) => ({ x: node.x, y: node.y }))).toEqual([1, 2, 3].map((id) => expected.get(id)));
  });
});

// VO-049 (EC-04): an id mentioned twice, or defined after use, is one node; an id given two different labels keeps the
// node Mermaid reads and reports the second label.

describe("ids mentioned more than once", () => {
  it("reports a second, different label for an id and keeps one node for it", () => {
    const text = ["flowchart TD", "  A --> B", "  B[Bee]", "  A[First] --> C", "  A[Second] --> B"].join("\n");
    const entries = scanFlowchart(text).filter((entry) => entry.construct === "node label");
    expect(entries.map((entry) => [entry.line, entry.category])).toEqual([[5, "dropped"]]);
    const result = readFlowchart({
      direction: "TD",
      vertices: [
        { key: "A", text: "First", shape: "square" },
        { key: "B", text: "Bee", shape: "square" },
        { key: "C", text: "C", shape: "" },
      ],
      edges: [
        { from: "A", to: "B", text: "", arrow: "arrow_point", stroke: "normal" },
        { from: "A", to: "C", text: "", arrow: "arrow_point", stroke: "normal" },
      ],
      subgraphs: [],
    });
    expect(result.nodes.map((node) => node.id)).toEqual([1, 2, 3]);
  });
});
