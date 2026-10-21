// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { parseLocated } from "../editor/mermaidParser";
import { snapshotFlowchart, snapshotSequence } from "../editor/mermaidSnapshot";
import { generate } from "../generation/generate";
import type { C4Item, C4Kind, Diagram, Relationship } from "../model/types";
import { c4Diagram, element, fullDiagram, relationship, boundary, node } from "../testing/c4Builder";
import { threeAndMessages, sequenceOf } from "../testing/sequenceBuilder";
import { readDocument } from "./readDocument";
import type { ReadDeps } from "./outcome";

// VO-028 (FR-009, SC-006): a diagram generated, imported and generated again gives the same source; the imported diagram
// equals the original once ids and positions are set aside. Ids are compared by position in the document, since a
// document does not carry them.

const realDeps: ReadDeps = { parse: parseLocated, snapshotFlowchart, snapshotSequence };

/** A flowchart holding every node shape and connection form the editor has, with and without labels. */
function flowchartOriginal(): Diagram {
  const shapes = ["rectangle", "rounded", "stadium", "diamond", "circle", "parallelogram", "cylinder", "subroutine", "hexagon"] as const;
  const nodes = shapes.map((shape, index) => ({ id: index + 1, shape, label: `Node ${shape}`, x: 0, y: 0 }));
  const forms = [
    ["solid", "arrow"],
    ["solid", "plain"],
    ["dotted", "arrow"],
    ["dotted", "plain"],
    ["thick", "arrow"],
    ["solid", "both"],
  ] as const;
  const connections = forms.map(([line, ending], index) => ({
    id: shapes.length + index + 1,
    from: 1,
    to: index + 2,
    line,
    ending,
    label: index % 2 === 0 ? `Edge ${String(index)}` : "",
  }));
  return { id: "f", name: "Flow", type: "flowchart", nextId: shapes.length + forms.length + 1, changedAt: "", content: { nodes, connections } };
}

/** Ids replaced by their position in the document, and positions and names set aside. */
function canonical(diagram: Diagram): unknown {
  if (diagram.type === "flowchart") {
    const index = new Map(diagram.content.nodes.map((item, position) => [item.id, position + 1]));
    return {
      type: "flowchart",
      nodes: diagram.content.nodes.map((item) => ({ shape: item.shape, label: item.label })),
      connections: diagram.content.connections.map((item) => ({
        from: index.get(item.from),
        to: index.get(item.to),
        line: item.line,
        ending: item.ending,
        label: item.label,
      })),
    };
  }
  if (diagram.type === "sequence") {
    const index = new Map(diagram.content.participants.map((item, position) => [item.id, position + 1]));
    return {
      type: "sequence",
      participants: diagram.content.participants.map((item) => ({ role: item.role, label: item.label })),
      messages: diagram.content.messages.map((item) => ({
        from: index.get(item.from),
        to: index.get(item.to),
        style: item.style,
        text: item.text,
      })),
    };
  }
  const order = new Map<number, number>();
  const walk = (items: readonly C4Item[]): void => {
    for (const item of items) {
      order.set(item.id, order.size + 1);
      if (item.item !== "element") walk(item.children);
    }
  };
  walk(diagram.content.tree);
  const strip = (items: readonly C4Item[]): unknown[] =>
    items.map((item) => {
      if (item.item === "element") return { item: "element", elementType: item.elementType, label: item.label, description: item.description, technology: item.technology };
      const { children, label } = item;
      return { item: item.item, label, children: strip(children) };
    });
  const relationships = diagram.content.relationships.map((item: Relationship) => ({
    from: order.get(item.from),
    to: order.get(item.to),
    direction: item.direction,
    label: item.label,
    technology: item.technology,
  }));
  return { type: "c4", kind: diagram.kind, title: diagram.title, tree: strip(diagram.content.tree), relationships };
}

/**
 * The editor's normal form for a C4 diagram: elements, boundaries and nodes numbered 1 upward in statement order, a
 * boundary before the items in it, and relationships after them (SC-006). The generator names aliases from these ids.
 */
function inNormalForm(diagram: Diagram): Diagram {
  if (diagram.type !== "c4") return diagram;
  const ids = new Map<number, number>();
  let next = 1;
  const number = (items: readonly C4Item[]): C4Item[] =>
    items.map((item) => {
      const id = next;
      next += 1;
      ids.set(item.id, id);
      if (item.item === "element") return { ...item, id };
      return { ...item, id, children: number(item.children) };
    });
  const tree = number(diagram.content.tree);
  const relationships = diagram.content.relationships.map((item) => {
    const id = next;
    next += 1;
    return { ...item, id, from: ids.get(item.from) ?? item.from, to: ids.get(item.to) ?? item.to };
  });
  return { ...diagram, nextId: next, content: { tree, relationships } };
}

async function expectRoundtrip(input: Diagram): Promise<void> {
  const original = inNormalForm(input);
  const first = generate(original).source;
  const outcome = await readDocument(first, realDeps);
  expect(outcome.kind).toBe("ready");
  if (outcome.kind !== "ready") return;
  expect(generate(outcome.diagram).source).toBe(first);
  expect(canonical(outcome.diagram)).toEqual(canonical(original));
}

describe("generate, import, generate", () => {
  it("returns the same source for a flowchart, and the same diagram apart from ids and positions", async () => {
    await expectRoundtrip(flowchartOriginal());
  });

  it("returns the same source for a sequence diagram", async () => {
    await expectRoundtrip(sequenceOf(threeAndMessages()));
  });

  const kinds: readonly C4Kind[] = ["context", "container", "component", "dynamic"];
  it.each(kinds)("returns the same source for a C4 %s diagram holding every element type", async (kind) => {
    await expectRoundtrip(fullDiagram(kind));
  });

  it("returns the same source for a C4 deployment diagram with nested nodes", async () => {
    const tree = [node(1, [node(2, [element(3, "container", "API")]), node(4, [element(5, "container", "DB")])])];
    await expectRoundtrip(c4Diagram("deployment", tree, [relationship(6, 3, 4)], "Estate"));
  });

  it("keeps a boundary with a title and an element with a description", async () => {
    const tree = [boundary(1, "system", [element(2, "person", "Customer", { description: "Buys" })], "Shop")];
    await expectRoundtrip(c4Diagram("context", tree, [], "Shop estate"));
  });

  // VO-003 (FR-002, US1-AS2, EC-03, SC-001): text holding every character the generator escapes survives generate,
  // import and generate three times over, for two diagrams of each C4 kind; text typed as `#38;` stays `#38;`.
  const special = ` R&D "fast" <cheap> C# 50% $5 a\\b \`x\` {y} [z] (w) a|b, c:d 'e' *f* _g_ ~h~ =i= -j- /k/ ; #38; `;
  const texts = [special, `Line one\nLine two & ${special.trim()}`];
  const relabel = (items: readonly C4Item[], text: string): C4Item[] =>
    items.map((item) => {
      if (item.item === "element") return { ...item, label: text, description: item.description === "" ? "" : text, technology: item.technology === "" ? "" : text };
      if (item.item === "boundary") return { ...item, label: text, children: relabel(item.children, text) };
      return { ...item, label: text, description: text, technology: text, children: relabel(item.children, text) };
    });
  const special4: readonly C4Kind[] = ["context", "container", "component", "dynamic", "deployment"];
  const cases = special4.flatMap((kind) => texts.map((text, index) => [kind, index, text] as const));
  it.each(cases)("keeps every escaped character in a C4 %s diagram (text %i) over three round trips", async (kind, _index, text) => {
    const base =
      kind === "deployment"
        ? c4Diagram("deployment", [node(1, [element(2, "container", "API")]), node(3, [element(4, "container", "DB")])], [relationship(5, 2, 4)])
        : fullDiagram(kind);
    const original = inNormalForm({
      ...base,
      title: text,
      content: { tree: relabel(base.content.tree, text), relationships: base.content.relationships.map((item) => ({ ...item, label: text, technology: text })) },
    });
    const first = generate(original).source;
    let source = first;
    for (let round = 0; round < 3; round += 1) {
      const outcome = await readDocument(source, realDeps);
      expect(outcome.kind).toBe("ready");
      if (outcome.kind !== "ready") return;
      expect(canonical(outcome.diagram)).toEqual(canonical(original));
      source = generate(outcome.diagram).source;
      expect(source).toBe(first);
    }
  });
});
