// Test support: C4 diagrams built literally, so tests of generation and checking do not depend on the operations.
import { createHistory, type History } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import { BOUNDARY_TYPES_BY_KIND, ELEMENT_TYPES_BY_KIND, hasTechnology } from "../model/c4/catalogue";
import type { Boundary, C4Diagram, C4Item, C4Kind, DeploymentNode, Element, ElementType, Relationship } from "../model/types";

export const element = (id: number, elementType: ElementType, label = `Element ${String(id)}`, extra: Partial<Element> = {}): Element => ({
  item: "element",
  id,
  elementType,
  label,
  description: `Description ${String(id)}`,
  technology: hasTechnology(elementType) ? `Technology ${String(id)}` : "",
  ...extra,
});

export const boundary = (id: number, boundaryType: Boundary["boundaryType"], children: readonly C4Item[], label = `Boundary ${String(id)}`): Boundary => ({
  item: "boundary",
  id,
  boundaryType,
  label,
  children,
});

export const node = (id: number, children: readonly C4Item[], label = `Node ${String(id)}`): DeploymentNode => ({
  item: "deployment-node",
  id,
  label,
  description: `Description ${String(id)}`,
  technology: `Technology ${String(id)}`,
  children,
});

export const relationship = (id: number, from: number, to: number, direction: Relationship["direction"] = "one-way", label = `Uses ${String(id)}`): Relationship => ({
  id,
  from,
  to,
  direction,
  label,
  technology: `Technology ${String(id)}`,
});

export function c4Diagram(kind: C4Kind, tree: readonly C4Item[], relationships: readonly Relationship[] = [], title = ""): C4Diagram {
  return { id: "d1", name: `Untitled C4 ${kind} diagram`, type: "c4", kind, title, nextId: 1000, changedAt: "", content: { tree, relationships } };
}

/**
 * A diagram holding every element type and boundary its kind offers: boundaries nested one inside the next, elements
 * spread over the top level and every depth, and relationships between neighbours, alternating one-way and two-way.
 */
export function fullDiagram(kind: C4Kind): C4Diagram {
  if (kind === "deployment") return deploymentDiagram();
  const types = ELEMENT_TYPES_BY_KIND[kind];
  const boundaries = BOUNDARY_TYPES_BY_KIND[kind];
  const elements = types.map((type, index) => element(index + 1, type));
  const levels: Element[][] = Array.from({ length: boundaries.length + 1 }, () => []);
  for (const [index, item] of elements.entries()) levels[index % levels.length]?.push(item);
  let nested: readonly C4Item[] = [];
  for (let depth = boundaries.length; depth >= 1; depth -= 1) {
    const type = boundaries[depth - 1] ?? "generic";
    nested = [boundary(100 + depth, type, [...(levels[depth] ?? []), ...nested])];
  }
  const tree = [...(levels[0] ?? []), ...nested];
  const relationships = elements.slice(1).map((item, index) => relationship(200 + index, elements[index]?.id ?? 0, item.id, index % 2 === 0 ? "one-way" : "two-way"));
  return c4Diagram(kind, tree, relationships, `A ${kind} title`);
}

function deploymentDiagram(): C4Diagram {
  const inner = node(103, [element(3, "container")]);
  const outer = node(102, [element(2, "container"), inner]);
  const tree = [element(1, "container"), outer, node(104, [element(4, "container")])];
  const relationships = [relationship(200, 1, 2), relationship(201, 2, 3, "two-way"), relationship(202, 103, 104), relationship(203, 4, 1)];
  return c4Diagram("deployment", tree, relationships, "A deployment title");
}

export const c4Of = (history: History): C4Diagram => history.present as C4Diagram;

/** An empty C4 diagram of a kind, as a history. */
export const emptyC4 = (kind: C4Kind): History => createHistory(newDiagram("d1", "c4", kind));
