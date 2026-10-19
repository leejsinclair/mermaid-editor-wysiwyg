// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { C4_KINDS } from "../model/c4/catalogue";
import type { C4Diagram, C4Item, C4Kind, ElementType } from "../model/types";
import { fullDiagram } from "../testing/c4Builder";
import { readC4 } from "../testing/mermaidReadback";
import { generate } from "./generate";

// VO-048: for each C4 kind, a diagram holding every element and boundary the kind offers, nested and with
// relationships of both directions, is read back by Mermaid's parser as itself.

const HEADERS = new Map<C4Kind, string>([
  ["context", "C4Context"],
  ["container", "C4Container"],
  ["component", "C4Component"],
  ["dynamic", "C4Dynamic"],
  ["deployment", "C4Deployment"],
]);

// Mermaid's name for each element type.
const SHAPE_TYPES = new Map<ElementType, string>(
  (["person", "system", "system-db", "system-queue", "container", "container-db", "container-queue", "component", "component-db", "component-queue"] as const).flatMap((base) => [
    [base, base.replaceAll("-", "_")] as const,
    [`${base}-ext` as ElementType, base === "person" ? "external_person" : `external_${base.replaceAll("-", "_")}`] as const,
  ]),
);

const BOUNDARY_KEYWORDS = new Map([
  ["enterprise", "Enterprise_Boundary"],
  ["system", "System_Boundary"],
  ["container", "Container_Boundary"],
  ["generic", "Boundary"],
]);

interface Flat {
  readonly item: C4Item;
  readonly parent: string;
}

const PREFIX = new Map([
  ["element", "e"],
  ["boundary", "b"],
  ["deployment-node", "d"],
]);

const aliasOf = (item: C4Item) => `${PREFIX.get(item.item) ?? "?"}${String(item.id)}`;

function flatten(items: readonly C4Item[], parent = "global"): Flat[] {
  return items.flatMap((item): Flat[] => [{ item, parent }, ...(item.item === "element" ? [] : flatten(item.children, aliasOf(item)))]);
}

describe.each(C4_KINDS)("a %s diagram holding everything its kind offers", (kind) => {
  const diagram: C4Diagram = fullDiagram(kind);
  const { source } = generate(diagram);
  const flat = flatten(diagram.content.tree);

  it("starts with the kind's header, then its title", () => {
    expect(source.split("\n").slice(0, 2)).toEqual([HEADERS.get(kind), `  title ${diagram.title}`]);
  });

  it("holds no style or layout statement and nothing indented under the wrong block", () => {
    expect(source).not.toMatch(/Update(?:ElementStyle|RelStyle|LayoutConfig)|%%|AddElementTag|SHOW_LEGEND/);
  });

  it("is read back with the header and the title", async () => {
    const read = await readC4(source);

    expect(read.header).toBe(HEADERS.get(kind));
    expect(read.title).toBe(diagram.title);
  });

  it("is read back with every element's type, label, description, technology and parent", async () => {
    const read = await readC4(source);

    const expected = flat.flatMap(({ item, parent }) =>
      item.item === "element"
        ? [[`e${String(item.id)}`, SHAPE_TYPES.get(item.elementType), item.label, item.description, item.technology, parent]]
        : [],
    );
    expect(read.shapes.map((s) => [s.alias, s.type, s.label, s.description, s.technology, s.parent])).toEqual(expected);
  });

  it("is read back with every boundary or node, its label and its parent", async () => {
    const read = await readC4(source);

    const expected = flat.filter(({ item }) => item.item !== "element").map(({ item, parent }) => [aliasOf(item), item.label, parent]);
    expect(read.boundaries.map((b) => [b.alias, b.label, b.parent])).toEqual(expected);
  });

  it("writes each boundary with its own kind of block, and each Deployment node with its technology and description", async () => {
    const read = await readC4(source);

    for (const { item } of flat) {
      if (item.item === "boundary") expect(source).toContain(`${BOUNDARY_KEYWORDS.get(item.boundaryType) ?? "?"}(b${String(item.id)}, `);
      if (item.item === "deployment-node") {
        const found = read.boundaries.find((b) => b.alias === `d${String(item.id)}`);
        expect([found?.type, found?.description]).toEqual([item.technology, item.description]);
      }
    }
  });

  it("is read back with every relationship's ends, direction, label and technology in order", async () => {
    const read = await readC4(source);

    const aliases = new Map(flat.map(({ item }) => [item.id, aliasOf(item)]));
    const alias = (id: number) => aliases.get(id);
    expect(read.relationships.map((r) => [r.type, r.from, r.to, r.label, r.technology])).toEqual(
      diagram.content.relationships.map((r) => [r.direction === "two-way" ? "birel" : "rel", alias(r.from), alias(r.to), r.label, r.technology]),
    );
  });

  it("is the same text every time", () => {
    expect(generate(diagram).source).toBe(source);
  });
});
