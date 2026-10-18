// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit } from "../../history/history";
import { c4Of, emptyC4 } from "../../testing/c4Builder";
import { readC4 } from "../../testing/mermaidReadback";
import { run } from "../../testing/run";

// VO-055: in a Deployment diagram, nodes are nested in nodes and Containers are placed in nodes and at the top level;
// the source nests Deployment_Node blocks and puts each Container inside its node.

/** Node 1 holds node 2 (which holds Container 4) and Container 3; Container 5 is at the top level. */
const build = () =>
  run(
    emptyC4("deployment"),
    { op: "addContainer", container: "deployment-node" },
    { op: "addContainer", container: "deployment-node", parentId: 1 },
    { op: "addElement", elementType: "container", parentId: 1 },
    { op: "addElement", elementType: "container", parentId: 2 },
    { op: "addElement", elementType: "container" },
  );

describe("a Deployment diagram", () => {
  it("nests Deployment_Node blocks and writes each Container inside its node or at the top level", () => {
    const { source } = generate(build().present);

    expect(source.split("\n").slice(1)).toEqual([
      '  Deployment_Node(d1, "Deployment node") {',
      '    Deployment_Node(d2, "Deployment node") {',
      '      Container(e4, "Container")',
      "    }",
      '    Container(e3, "Container")',
      "  }",
      '  Container(e5, "Container")',
    ]);
  });

  it("is read back with every node's parent and every Container's parent", async () => {
    const read = await readC4(generate(build().present).source);

    expect(read.boundaries.map((node) => [node.alias, node.parent])).toEqual([
      ["d1", "global"],
      ["d2", "d1"],
    ]);
    expect(read.shapes.map((shape) => [shape.alias, shape.parent])).toEqual([
      ["e4", "d2"],
      ["e3", "d1"],
      ["e5", "global"],
    ]);
  });

  it("gives a node a technology and a description, written after its label", async () => {
    const history = run(build(), { op: "setLabel", itemId: 1, field: "technology", text: "Kubernetes" }, { op: "setLabel", itemId: 1, field: "description", text: "Production cluster" });

    const { source } = generate(history.present);
    const read = await readC4(source);

    expect(source).toContain('Deployment_Node(d1, "Deployment node", "Kubernetes", "Production cluster") {');
    expect(read.boundaries[0]).toMatchObject({ type: "Kubernetes", description: "Production cluster" });
  });

  it("allows a Container at the top level and in a node, and nothing else as an element", () => {
    const history = emptyC4("deployment");

    expect(commit(history, { op: "addElement", elementType: "container" }).outcome).toEqual({ committed: true });
    for (const elementType of ["person", "system", "container-db", "component"] as const) {
      expect(commit(history, { op: "addElement", elementType }).outcome).toMatchObject({ committed: false, rejection: { reason: "notOfferedInKind", details: { kind: "deployment" } } });
    }
  });

  it("holds its nodes and Containers in the order they were added", () => {
    expect(c4Of(build()).content.tree.map((item) => item.id)).toEqual([1, 5]);
  });
});
