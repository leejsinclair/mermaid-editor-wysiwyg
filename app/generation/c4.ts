import { hasTechnology } from "../model/c4/catalogue";
import type { BoundaryType, C4Diagram, C4Item, C4Kind, Element, Relationship } from "../model/types";
import { en } from "../text/en";
import { fill } from "../text/fill";
import { escapeLabel } from "./escape";
import type { Generated, Notice } from "./generate";

// Mermaid's header for each kind, and its macro for each element and boundary type (contracts/mermaid-output.md).
const HEADERS = new Map<C4Kind, string>([
  ["context", "C4Context"],
  ["container", "C4Container"],
  ["component", "C4Component"],
  ["dynamic", "C4Dynamic"],
  ["deployment", "C4Deployment"],
]);

const MACROS = new Map<string, string>(
  (
    [
      ["person", "Person"],
      ["system", "System"],
      ["system-db", "SystemDb"],
      ["system-queue", "SystemQueue"],
      ["container", "Container"],
      ["container-db", "ContainerDb"],
      ["container-queue", "ContainerQueue"],
      ["component", "Component"],
      ["component-db", "ComponentDb"],
      ["component-queue", "ComponentQueue"],
    ] as const
  ).flatMap(([type, macro]) => [
    [type, macro],
    [`${type}-ext`, `${macro}_Ext`],
  ]),
);

const BOUNDARY_MACROS = new Map<BoundaryType, string>([
  ["enterprise", "Enterprise_Boundary"],
  ["system", "System_Boundary"],
  ["container", "Container_Boundary"],
  ["generic", "Boundary"],
]);

const INDENT = "  ";

/** Aliases come from ids, never from labels (AC11). */
const aliasOf = (item: C4Item) => {
  if (item.item === "element") return `e${String(item.id)}`;
  return `${item.item === "boundary" ? "b" : "d"}${String(item.id)}`;
};

/** The quoted arguments after the alias, with empty trailing ones left out and an empty one before a filled one written `""`. */
function args(values: readonly string[]): string {
  let last = values.length;
  while (last > 0 && values[last - 1] === "") last -= 1;
  return values
    .slice(0, last)
    .map((value) => `"${escapeLabel(value)}"`)
    .join(", ");
}

const statement = (macro: string, head: readonly string[], rest: readonly string[]) => {
  const tail = args(rest);
  const all = tail === "" ? head.join(", ") : [...head, tail].join(", ");
  return `${macro}(${all})`;
};

function elementLine(element: Element): string {
  const macro = MACROS.get(element.elementType) ?? "Person";
  const alias = aliasOf(element);
  // Elements with a technology take it before the description; Person and System elements have none.
  if (hasTechnology(element.elementType)) return statement(macro, [alias], [element.label, element.technology, element.description]);
  return statement(macro, [alias], [element.label, element.description]);
}

function itemLines(item: C4Item, depth: number): string[] {
  const pad = INDENT.repeat(depth);
  if (item.item === "element") return [`${pad}${elementLine(item)}`];
  const open =
    item.item === "boundary"
      ? statement(BOUNDARY_MACROS.get(item.boundaryType) ?? "Boundary", [aliasOf(item)], [item.label])
      : statement("Deployment_Node", [aliasOf(item)], [item.label, item.technology, item.description]);
  return [`${pad}${open} {`, ...item.children.flatMap((child) => itemLines(child, depth + 1)), `${pad}}`];
}

/** One-way relationships in a Dynamic diagram carry their number: 1 + their position (FR-033). */
function relationshipLine(relationship: Relationship, position: number, kind: C4Kind, endAlias: (id: number) => string): string {
  const ends = [endAlias(relationship.from), endAlias(relationship.to)];
  const rest = [relationship.label, relationship.technology];
  if (relationship.direction === "two-way") return statement("BiRel", ends, rest);
  if (kind === "dynamic") return statement("RelIndex", [String(position + 1), ...ends], rest);
  return statement("Rel", ends, rest);
}

function walk(items: readonly C4Item[], visit: (item: C4Item) => void): void {
  for (const item of items) {
    visit(item);
    if (item.item !== "element") walk(item.children, visit);
  }
}

/** Mermaid cannot draw an empty diagram or an empty boundary; each is kept in the source and reported (research R6). */
function noticesFor(diagram: C4Diagram): Notice[] {
  const notices: Notice[] = [];
  if (diagram.content.tree.length === 0 && diagram.title === "") notices.push({ code: "c4-empty", text: en.notices.c4Empty });
  walk(diagram.content.tree, (item) => {
    if (item.item !== "element" && item.children.length === 0) {
      notices.push({ code: "c4-empty-container", text: fill(en.notices.c4EmptyContainer, { label: item.label }) });
    }
  });
  return notices;
}

/** The header, the title if there is one, the tree depth first in order, then the relationships in order. */
export function generateC4(diagram: C4Diagram): Generated {
  const aliases = new Map<number, string>();
  walk(diagram.content.tree, (item) => aliases.set(item.id, aliasOf(item)));
  const endAlias = (id: number) => aliases.get(id) ?? `e${String(id)}`;
  const source = [
    HEADERS.get(diagram.kind) ?? "C4Context",
    ...(diagram.title === "" ? [] : [`${INDENT}title ${escapeLabel(diagram.title)}`]),
    ...diagram.content.tree.flatMap((item) => itemLines(item, 1)),
    ...diagram.content.relationships.map((relationship, position) => `${INDENT}${relationshipLine(relationship, position, diagram.kind, endAlias)}`),
  ].join("\n");
  return { source, notices: noticesFor(diagram) };
}
