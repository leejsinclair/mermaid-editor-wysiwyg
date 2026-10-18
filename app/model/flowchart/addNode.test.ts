// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { readFlowchart } from "../../testing/mermaidReadback";
import type { FlowchartDiagram, FlowchartShape, Node } from "../types";
import { addNode } from "./apply";

// VO-004: a node of each shape is added at a free position, and at an occupied one (EC-01).

const NAMES: readonly (readonly [FlowchartShape, string])[] = [
  ["rectangle", "Rectangle"],
  ["rounded", "Rounded rectangle"],
  ["stadium", "Stadium"],
  ["diamond", "Diamond"],
  ["circle", "Circle"],
  ["parallelogram", "Parallelogram"],
  ["cylinder", "Cylinder"],
  ["subroutine", "Subroutine"],
  ["hexagon", "Hexagon"],
];

const WIDTH = 160;
const HEIGHT = 64;

const empty = (): FlowchartDiagram => ({
  id: "d1",
  name: "Untitled flowchart",
  type: "flowchart",
  nextId: 1,
  changedAt: "",
  content: { nodes: [], connections: [] },
});

const overlaps = (a: Node, b: Node) => Math.abs(a.x - b.x) < WIDTH && Math.abs(a.y - b.y) < HEIGHT;

describe("addNode at a free position", () => {
  it.each(NAMES)("places a %s node exactly where requested, labelled with its shape name", async (shape, name) => {
    const diagram = addNode(empty(), shape, { x: 40, y: 80 });

    expect(diagram.content.nodes).toHaveLength(1);
    expect(diagram.content.nodes[0]).toMatchObject({ shape, label: name, x: 40, y: 80 });

    const { source } = generate(diagram);
    expect(source).toContain(name);
    const { vertices } = await readFlowchart(source);
    expect(vertices.map((vertex) => vertex.text)).toEqual([name]);
  });

  it("gives each new node a new id and counts ids up, never reusing one", () => {
    let diagram = addNode(empty(), "rectangle", { x: 0, y: 0 });
    diagram = addNode(diagram, "circle", { x: 400, y: 0 });

    expect(diagram.content.nodes.map((node) => node.id)).toEqual([1, 2]);
    expect(diagram.nextId).toBe(3);
  });
});

describe("addNode at an occupied position (EC-01)", () => {
  it("places the node at the nearest free position", () => {
    const first = addNode(empty(), "rectangle", { x: 0, y: 0 });
    const diagram = addNode(first, "diamond", { x: 10, y: 20 });

    // Only moving down by 44 units clears the 160 x 64 footprint of the first node; every other way is farther.
    expect(diagram.content.nodes[1]).toMatchObject({ shape: "diamond", x: 10, y: 64 });
  });

  it("never overlaps another node, however many are dropped on the same spot", async () => {
    let diagram = empty();
    for (const [shape] of NAMES) diagram = addNode(diagram, shape, { x: 0, y: 0 });

    const nodes = diagram.content.nodes;
    expect(nodes).toHaveLength(NAMES.length);
    for (const [index, node] of nodes.entries()) {
      for (const other of nodes.slice(index + 1)) expect(overlaps(node, other)).toBe(false);
    }
    expect((await readFlowchart(generate(diagram).source)).vertices).toHaveLength(NAMES.length);
  });
});
