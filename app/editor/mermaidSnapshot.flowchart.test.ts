// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { snapshotFlowchart } from "./mermaidSnapshot";

// VO-008 (FR-005): Mermaid's own reading of each flowchart shape and arrow is captured as plain data.
// The words asserted here are the ones Mermaid reports, so a Mermaid upgrade that changes one fails this test.

const SHAPES: readonly (readonly [string, string])[] = [
  ["A[x]", "square"],
  ["A(x)", "round"],
  ["A([x])", "stadium"],
  ["A[(x)]", "cylinder"],
  ["A((x))", "circle"],
  ["A{x}", "diamond"],
  ["A{{x}}", "hexagon"],
  ["A[/x/]", "lean_right"],
  ["A[\\x\\]", "lean_left"],
  ["A[/x\\]", "trapezoid"],
  ["A[\\x/]", "inv_trapezoid"],
  ["A>x]", "odd"],
  ["A(((x)))", "doublecircle"],
  ["A@{ shape: doc }", "doc"],
  ["A@{ shape: bolt }", "bolt"],
];

const ARROWS: readonly (readonly [string, string, string])[] = [
  ["A-->B", "arrow_point", "normal"],
  ["A---B", "arrow_open", "normal"],
  ["A-.->B", "arrow_point", "dotted"],
  ["A==>B", "arrow_point", "thick"],
  ["A<-->B", "double_arrow_point", "normal"],
  ["A--oB", "arrow_circle", "normal"],
  ["A--xB", "arrow_cross", "normal"],
  ["A o--o B", "double_arrow_circle", "normal"],
  ["A x--x B", "double_arrow_cross", "normal"],
  ["A~~~B", "arrow_open", "invisible"],
];

describe("snapshotFlowchart: shapes", () => {
  it.each(SHAPES)("reads %s as Mermaid's shape %s", async (line, shape) => {
    const snapshot = await snapshotFlowchart(`flowchart TD\n  ${line}`);
    expect(snapshot.vertices).toHaveLength(1);
    expect(snapshot.vertices[0]?.shape).toBe(shape);
  });
});

describe("snapshotFlowchart: arrows", () => {
  it.each(ARROWS)("reads %s as arrow %s with stroke %s", async (line, arrow, stroke) => {
    const snapshot = await snapshotFlowchart(`flowchart TD\n  ${line}`);
    expect(snapshot.edges).toHaveLength(1);
    expect(snapshot.edges[0]).toMatchObject({ from: "A", to: "B", arrow, stroke });
  });

  it("reads a labelled arrow's text", async () => {
    const snapshot = await snapshotFlowchart("flowchart TD\n  A -- text --> B");
    expect(snapshot.edges[0]).toMatchObject({ from: "A", to: "B", text: "text", arrow: "arrow_point", stroke: "normal" });
  });
});

describe("snapshotFlowchart: structure", () => {
  it("reads the direction keyword", async () => {
    expect((await snapshotFlowchart("flowchart LR\n  A --> B")).direction).toBe("LR");
    expect((await snapshotFlowchart("graph TD\n  A --> B")).direction).toBe("TD");
  });

  it("reads chains, fan-outs and subgraphs in order", async () => {
    const chain = await snapshotFlowchart("flowchart TD\n  A --> B --> C");
    expect(chain.edges.map((edge) => [edge.from, edge.to])).toEqual([["A", "B"], ["B", "C"]]);
    const fan = await snapshotFlowchart("flowchart TD\n  A --> B & C");
    expect(fan.edges.map((edge) => [edge.from, edge.to])).toEqual([["A", "B"], ["A", "C"]]);
    const group = await snapshotFlowchart("flowchart TD\n  subgraph S1[Group]\n    A --> B\n  end");
    expect(group.subgraphs).toEqual([{ id: "S1", title: "Group" }]);
  });
});
