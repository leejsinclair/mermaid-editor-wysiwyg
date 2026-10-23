import { BOUNDARY_NAMES, BOUNDARY_TYPES_BY_KIND, DEPLOYMENT_NODE_NAME, DIRECTIONS, DIRECTION_NAMES, ELEMENT_TYPES_BY_KIND, ELEMENT_TYPE_NAMES } from "../../model/c4/catalogue";
import type { Operation } from "../../model/operations";
import type { BoundaryType, C4Kind, Direction, ElementType } from "../../model/types";
import { en } from "../../text/en";
import type { ToolboxGroup } from "../shared/Toolbox";

/** The id prefixes of toolbox items: an element type, `boundary:` and a boundary type, `node`, and `relationship:` and a direction. */
export const BOUNDARY_PREFIX = "boundary:";
export const NODE_ID = "node";
export const RELATIONSHIP_PREFIX = "relationship:";

const shapeOf = (type: ElementType) => {
  if (type.startsWith("person")) return <path d="M20 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 22c0-6 4-9 8-9s8 3 8 9z" />;
  if (type.includes("-db")) return <path d="M8 6a12 4 0 0 0 24 0a12 4 0 0 0-24 0v12a12 4 0 0 0 24 0V6" />;
  if (type.includes("-queue")) return <path d="M6 6h28v14H6zM30 6a3 7 0 0 1 0 14" />;
  return <rect x="6" y="4" width="28" height="16" />;
};

const ElementIcon = ({ type }: Readonly<{ type: ElementType }>) => (
  <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false" fill={type.endsWith("-ext") ? "currentColor" : "none"} fillOpacity={0.25} stroke="currentColor" strokeWidth="2">
    {shapeOf(type)}
  </svg>
);

const ContainerIcon = ({ dashed }: Readonly<{ dashed: boolean }>) => (
  <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={dashed ? "4 3" : undefined}>
    <rect x="4" y="3" width="32" height="18" rx="2" />
  </svg>
);

const RelationshipIcon = ({ twoWay }: Readonly<{ twoWay: boolean }>) => (
  <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <path d="M8 12h24" fill="none" />
    <path d="M32 12l-6-4v8z" />
    {twoWay && <path d="M8 12l6-4v8z" />}
  </svg>
);

/** The elements, boundaries or Deployment nodes, and relationships the kind offers; nothing else (FR-031). */
export function c4Toolbox(kind: C4Kind): readonly ToolboxGroup[] {
  // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
  const boundaries = BOUNDARY_TYPES_BY_KIND[kind];
  const containers: ToolboxGroup =
    kind === "deployment"
      ? { label: en.c4.groups.nodes, items: [{ id: NODE_ID, name: DEPLOYMENT_NODE_NAME, icon: <ContainerIcon dashed={false} /> }] }
      : { label: en.c4.groups.boundaries, items: boundaries.map((type) => ({ id: `${BOUNDARY_PREFIX}${type}`, name: BOUNDARY_NAMES.get(type) ?? type, icon: <ContainerIcon dashed /> })) };
  return [
    // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
    { label: en.c4.groups.elements, items: ELEMENT_TYPES_BY_KIND[kind].map((type) => ({ id: type, name: ELEMENT_TYPE_NAMES.get(type) ?? type, icon: <ElementIcon type={type} /> })) },
    containers,
    { label: en.c4.groups.relationships, items: DIRECTIONS.map((direction) => ({ id: `${RELATIONSHIP_PREFIX}${direction}`, name: DIRECTION_NAMES.get(direction) ?? direction, icon: <RelationshipIcon twoWay={direction === "two-way"} /> })) },
  ];
}

export type C4ToolboxAction =
  | { readonly kind: "relationship"; readonly direction: Direction }
  | { readonly kind: "add"; readonly operation: Operation };

/** What activating a toolbox item asks for: an element or container is added, a relationship asks for its ends first. */
export function c4ToolboxAction(id: string): C4ToolboxAction {
  if (id.startsWith(RELATIONSHIP_PREFIX)) return { kind: "relationship", direction: id.slice(RELATIONSHIP_PREFIX.length) === "two-way" ? "two-way" : "one-way" };
  if (id === NODE_ID) return { kind: "add", operation: { op: "addContainer", container: "deployment-node" } };
  if (id.startsWith(BOUNDARY_PREFIX)) return { kind: "add", operation: { op: "addContainer", container: id.slice(BOUNDARY_PREFIX.length) as BoundaryType } };
  return { kind: "add", operation: { op: "addElement", elementType: id as ElementType } };
}
