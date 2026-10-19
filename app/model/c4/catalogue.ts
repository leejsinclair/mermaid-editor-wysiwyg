import { en } from "../../text/en";
import { fill } from "../../text/fill";
import type { BoundaryType, C4Kind, Direction, ElementType } from "../types";

// What each C4 kind offers (spec.md, FR-031, and data-model.md). Types in a family are limited to those listed.

const PERSON: readonly ElementType[] = ["person", "person-ext"];
const SYSTEM: readonly ElementType[] = ["system", "system-db", "system-queue", "system-ext", "system-db-ext", "system-queue-ext"];
const SYSTEM_ONLY: readonly ElementType[] = ["system", "system-ext"];
const CONTAINER: readonly ElementType[] = ["container", "container-db", "container-queue", "container-ext", "container-db-ext", "container-queue-ext"];
const CONTAINER_ONLY: readonly ElementType[] = ["container", "container-ext"];
const COMPONENT: readonly ElementType[] = ["component", "component-db", "component-queue", "component-ext", "component-db-ext", "component-queue-ext"];

const COMPONENT_LEVEL: readonly ElementType[] = [...PERSON, ...SYSTEM_ONLY, ...CONTAINER_ONLY, ...COMPONENT];

export const ELEMENT_TYPES_BY_KIND: Readonly<Record<C4Kind, readonly ElementType[]>> = {
  context: [...PERSON, ...SYSTEM],
  container: [...PERSON, ...SYSTEM_ONLY, ...CONTAINER],
  component: COMPONENT_LEVEL,
  dynamic: COMPONENT_LEVEL,
  deployment: ["container"],
};

export const BOUNDARY_TYPES_BY_KIND: Readonly<Record<C4Kind, readonly BoundaryType[]>> = {
  context: ["enterprise", "system", "generic"],
  container: ["system", "container", "generic"],
  component: ["container", "generic"],
  dynamic: ["container", "generic"],
  deployment: [],
};

export const C4_KINDS: readonly C4Kind[] = ["context", "container", "component", "dynamic", "deployment"];

/** The family a type belongs to: Person, System, Container or Component, each with its database, queue and external variants (FR-040). */
export const familyOf = (elementType: ElementType): string => elementType.split("-")[0] ?? elementType;

/** Container and Component elements carry a technology; Person and System elements do not. */
export function hasTechnology(elementType: ElementType): boolean {
  return elementType.startsWith("container") || elementType.startsWith("component");
}

/** The label a new element starts with: its type's name (FR-007). */
export const ELEMENT_TYPE_NAMES: ReadonlyMap<ElementType, string> = new Map(
  (
    [
      ["person", en.c4.elementTypes.person],
      ["system", en.c4.elementTypes.system],
      ["system-db", en.c4.elementTypes.systemDb],
      ["system-queue", en.c4.elementTypes.systemQueue],
      ["container", en.c4.elementTypes.container],
      ["container-db", en.c4.elementTypes.containerDb],
      ["container-queue", en.c4.elementTypes.containerQueue],
      ["component", en.c4.elementTypes.component],
      ["component-db", en.c4.elementTypes.componentDb],
      ["component-queue", en.c4.elementTypes.componentQueue],
    ] as const
  ).flatMap(([type, name]) => [
    [type, name] as const,
    [`${type}-ext` as ElementType, fill(en.c4.external, { name: `${name.charAt(0).toLowerCase()}${name.slice(1)}` })] as const,
  ]),
);

/** The label a new boundary or Deployment node starts with. */
export const BOUNDARY_NAMES: ReadonlyMap<BoundaryType, string> = new Map([
  ["enterprise", en.c4.boundaries.enterprise],
  ["system", en.c4.boundaries.system],
  ["container", en.c4.boundaries.container],
  ["generic", en.c4.boundaries.generic],
]);

export const DEPLOYMENT_NODE_NAME = en.c4.deploymentNode;

/** The names of the two kinds of relationship, as shown in the toolbox and on the canvas. */
export const DIRECTION_NAMES: ReadonlyMap<Direction, string> = new Map([
  ["one-way", en.c4.directions.oneWay],
  ["two-way", en.c4.directions.twoWay],
]);

export const DIRECTIONS: readonly Direction[] = ["one-way", "two-way"];
