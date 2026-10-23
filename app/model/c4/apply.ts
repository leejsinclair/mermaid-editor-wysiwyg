import { en } from "../../text/en";
import { fill } from "../../text/fill";
import type { LabelField } from "../operations";
import type { BoundaryType, C4Diagram, C4Item, Direction, Element, ElementType, Relationship } from "../types";
import { BOUNDARY_NAMES, DEPLOYMENT_NODE_NAME, ELEMENT_TYPE_NAMES } from "./catalogue";
import { findItem, insertItem, isContainer, liftItem, removeItem, replaceItem } from "./tree";

/** Replaces the title; the same diagram comes back when it is already that. */
export function setTitle(diagram: C4Diagram, text: string): C4Diagram {
  return diagram.title === text ? diagram : { ...diagram, title: text };
}

/** Adds an element labelled with its type's name to `parentId` (or the top level), at `index` or last. */
export function addElement(diagram: C4Diagram, elementType: ElementType, parentId?: number, index?: number): C4Diagram {
  const element: Element = {
    item: "element",
    id: diagram.nextId,
    elementType,
    label: ELEMENT_TYPE_NAMES.get(elementType) ?? elementType,
    description: "",
    technology: "",
  };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, tree: insertItem(diagram.content.tree, parentId ?? null, element, index) },
  };
}

/** Adds an empty boundary or Deployment node, labelled with its kind of container, to `parentId` or the top level. */
export function addContainer(diagram: C4Diagram, container: BoundaryType | "deployment-node", parentId?: number): C4Diagram {
  const item: C4Item =
    container === "deployment-node"
      ? { item: "deployment-node", id: diagram.nextId, label: DEPLOYMENT_NODE_NAME, description: "", technology: "", children: [] }
      : { item: "boundary", id: diagram.nextId, boundaryType: container, label: BOUNDARY_NAMES.get(container) ?? container, children: [] };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, tree: insertItem(diagram.content.tree, parentId ?? null, item) },
  };
}

/** Appends a relationship labelled "Uses" with no technology. */
export function addRelationship(diagram: C4Diagram, from: number, to: number, direction: Direction): C4Diagram {
  const relationship: Relationship = { id: diagram.nextId, from, to, direction, label: en.c4.defaultRelationshipLabel, technology: "" };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, relationships: [...diagram.content.relationships, relationship] },
  };
}

const FIELDS = new Set<LabelField>(["label", "description", "technology"]);

function withField(item: C4Item, field: LabelField, text: string): C4Item {
  if (!FIELDS.has(field)) return item;
  if (field === "label") return { ...item, label: text };
  if (item.item === "boundary") return item;
  return { ...item, [field]: text };
}

function withRelationshipField(relationship: Relationship, field: LabelField, text: string): Relationship {
  if (field === "label") return { ...relationship, label: text };
  if (field === "technology") return { ...relationship, technology: text };
  return relationship;
}

/** Replaces a text field of an element, boundary, Deployment node or relationship; the same diagram when it is unchanged. */
export function setLabel(diagram: C4Diagram, itemId: number, field: LabelField, text: string): C4Diagram {
  const { tree, relationships } = diagram.content;
  const item = findItem(tree, itemId);
  if (item) {
    const changed = withField(item, field, text);
    if (JSON.stringify(changed) === JSON.stringify(item)) return diagram;
    return { ...diagram, content: { ...diagram.content, tree: replaceItem(tree, itemId, () => changed) } };
  }
  const relationship = relationships.find((candidate) => candidate.id === itemId);
  if (!relationship) return diagram;
  const changed = withRelationshipField(relationship, field, text);
  if (changed.label === relationship.label && changed.technology === relationship.technology) return diagram;
  return { ...diagram, content: { ...diagram.content, relationships: relationships.map((candidate) => (candidate === relationship ? changed : candidate)) } };
}

/** Moves a relationship to `toIndex` among the relationships; Dynamic numbers follow because they are derived (FR-033). */
export function reorder(diagram: C4Diagram, relationshipId: number, toIndex: number): C4Diagram {
  const { relationships } = diagram.content;
  const from = relationships.findIndex((relationship) => relationship.id === relationshipId);
  // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
  const moving = relationships[from];
  if (!moving || from === toIndex) return diagram;
  const rest = relationships.filter((relationship) => relationship !== moving);
  return { ...diagram, content: { ...diagram.content, relationships: [...rest.slice(0, toIndex), moving, ...rest.slice(toIndex)] } };
}

/** Removes a relationship; nothing else changes. */
function deleteRelationship(diagram: C4Diagram, relationshipId: number): C4Diagram {
  const relationships = diagram.content.relationships.filter((relationship) => relationship.id !== relationshipId);
  return { ...diagram, content: { ...diagram.content, relationships } };
}

/**
 * Deletes an element, relationship, boundary or Deployment node. An item's relationships go with it, a boundary or node
 * gives its contents to its parent at its own position, and nothing is ever added (FR-011).
 */
export function deleteItem(diagram: C4Diagram, itemId: number): C4Diagram {
  const { tree, relationships } = diagram.content;
  if (!findItem(tree, itemId)) return deleteRelationship(diagram, itemId);
  return {
    ...diagram,
    content: {
      tree: liftItem(tree, itemId),
      relationships: relationships.filter((relationship) => relationship.from !== itemId && relationship.to !== itemId),
    },
  };
}

/**
 * Moves an element, boundary or Deployment node, with everything it holds, into `parentId` (or the top level when that is
 * null) at `index` or last. Relationships are untouched; the same diagram comes back when nothing would move (FR-034).
 */
export function moveToParent(diagram: C4Diagram, itemId: number, parentId: number | null, index?: number): C4Diagram {
  const { tree } = diagram.content;
  const item = findItem(tree, itemId);
  if (!item) return diagram;
  const moved = insertItem(removeItem(tree, itemId), parentId, item, index);
  if (JSON.stringify(moved) === JSON.stringify(tree)) return diagram;
  return { ...diagram, content: { ...diagram.content, tree: moved } };
}

/** Changes an element's type; label, details, relationships and membership stay. */
export function changeElementType(diagram: C4Diagram, itemId: number, elementType: ElementType): C4Diagram {
  const item = findItem(diagram.content.tree, itemId);
  if (item?.item !== "element" || item.elementType === elementType) return diagram;
  return { ...diagram, content: { ...diagram.content, tree: replaceItem(diagram.content.tree, itemId, () => ({ ...item, elementType })) } };
}

const withRelationship = (diagram: C4Diagram, id: number, change: (relationship: Relationship) => Relationship): C4Diagram => {
  const { relationships } = diagram.content;
  const target = relationships.find((relationship) => relationship.id === id);
  if (!target) return diagram;
  const changed = change(target);
  if (JSON.stringify(changed) === JSON.stringify(target)) return diagram;
  return { ...diagram, content: { ...diagram.content, relationships: relationships.map((relationship) => (relationship === target ? changed : relationship)) } };
};

/** Moves one end of a relationship to another element (or Deployment node); everything else about it stays. */
export function moveEnd(diagram: C4Diagram, relationshipId: number, end: "from" | "to", targetId: number): C4Diagram {
  return withRelationship(diagram, relationshipId, (relationship) => ({ ...relationship, [end]: targetId }));
}

/** Swaps a relationship's source and target. */
export function reverse(diagram: C4Diagram, relationshipId: number): C4Diagram {
  return withRelationship(diagram, relationshipId, (relationship) => ({ ...relationship, from: relationship.to, to: relationship.from }));
}

/** Makes a relationship one-way or two-way. */
export function changeDirection(diagram: C4Diagram, relationshipId: number, direction: Direction): C4Diagram {
  return withRelationship(diagram, relationshipId, (relationship) => ({ ...relationship, direction }));
}

/** The notice for deleting a boundary or Deployment node that held something, naming it; undefined otherwise. */
export function liftNotice(diagram: C4Diagram, itemId: number): string | undefined {
  const item = findItem(diagram.content.tree, itemId);
  if (!isContainer(item) || item.children.length === 0) return undefined;
  return fill(item.item === "boundary" ? en.notices.liftedBoundary : en.notices.liftedNode, { label: item.label });
}
