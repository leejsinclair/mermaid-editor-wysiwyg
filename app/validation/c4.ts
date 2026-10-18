import { BOUNDARY_TYPES_BY_KIND, ELEMENT_TYPES_BY_KIND, ELEMENT_TYPE_NAMES, familyOf, hasTechnology } from "../model/c4/catalogue";
import { findItem, isContainer, walkItems } from "../model/c4/tree";
import type { Operation } from "../model/operations";
import type { C4Diagram } from "../model/types";
import { isVisible } from "./label";
import type { Rejection } from "./reasons";

type Check = (diagram: C4Diagram, operation: Operation) => Rejection | undefined;

/** The operations a C4 diagram has; none of them positions anything freely, so nothing like moveNode (FR-038). */
const OPERATIONS: ReadonlySet<Operation["op"]> = new Set(["setTitle", "addElement", "addContainer", "addRelationship", "setLabel", "reorder", "deleteItem", "moveToParent", "changeType", "moveEnd", "reverse"]);

const checkOffered: Check = (_diagram, operation) => (OPERATIONS.has(operation.op) ? undefined : { reason: "unknownItem" });

/** Relationships end at elements, and in a Deployment diagram at nodes too; the sentence says which. */
const endNotAllowed = (diagram: C4Diagram): Rejection => ({ reason: "endNotAllowed", details: { deployment: diagram.kind === "deployment" ? ", or deployment nodes" : "" } });

const checkAddElement: Check = (diagram, operation) => {
  if (operation.op !== "addElement") return undefined;
  if (!ELEMENT_TYPES_BY_KIND[diagram.kind].includes(operation.elementType)) return { reason: "notOfferedInKind", details: { kind: diagram.kind } };
  if (operation.parentId === undefined) return undefined;
  const parent = findItem(diagram.content.tree, operation.parentId);
  if (!parent) return { reason: "unknownItem" };
  if (isContainer(parent)) return undefined;
  return {
    reason: "parentNotAllowed",
    details: { item: ELEMENT_TYPE_NAMES.get(operation.elementType) ?? operation.elementType, parent: parent.label, kind: diagram.kind },
  };
};

const checkAddContainer: Check = (diagram, operation) => {
  if (operation.op !== "addContainer") return undefined;
  const { container, parentId } = operation;
  const offered = container === "deployment-node" ? diagram.kind === "deployment" : (BOUNDARY_TYPES_BY_KIND[diagram.kind] as readonly string[]).includes(container);
  if (!offered) return { reason: "notOfferedInKind", details: { kind: diagram.kind } };
  if (parentId === undefined) return undefined;
  const parent = findItem(diagram.content.tree, parentId);
  if (!parent) return { reason: "unknownItem" };
  return isContainer(parent) ? undefined : { reason: "parentNotAllowed", details: { item: container, parent: parent.label, kind: diagram.kind } };
};

const checkAddRelationship: Check = (diagram, operation) => {
  if (operation.op !== "addRelationship") return undefined;
  const ends = [operation.from, operation.to].map((id) => findItem(diagram.content.tree, id));
  if (ends.some((end) => end === undefined)) return { reason: "unknownEndpoint" };
  if (ends.some((end) => end?.item === "boundary")) {
    return endNotAllowed(diagram);
  }
  return undefined;
};

const checkMoveToParent: Check = (diagram, operation) => {
  if (operation.op !== "moveToParent") return undefined;
  const { tree } = diagram.content;
  const { itemId, parentId, index } = operation;
  const item = findItem(tree, itemId);
  if (!item) return { reason: "unknownItem" };
  if (parentId === null) return undefined;
  const parent = findItem(tree, parentId);
  if (!parent) return { reason: "unknownItem" };
  if (!isContainer(parent)) return { reason: "parentNotAllowed", details: { item: item.label, parent: parent.label, kind: diagram.kind } };
  if (isContainer(item) && walkItems([item]).some((inside) => inside.id === parentId)) return { reason: "nestingCycle" };
  if (index === undefined) return undefined;
  const others = parent.children.filter((child) => child.id !== itemId).length;
  return Number.isInteger(index) && index >= 0 && index <= others ? undefined : { reason: "outOfRange" };
};

const checkChangeType: Check = (diagram, operation) => {
  if (operation.op !== "changeType") return undefined;
  const item = findItem(diagram.content.tree, operation.itemId);
  const { to } = operation;
  if (!item) {
    if (!diagram.content.relationships.some((relationship) => relationship.id === operation.itemId)) return { reason: "unknownItem" };
    return to.kind === "direction" ? undefined : { reason: "notOfferedInKind", details: { kind: diagram.kind } };
  }
  if (item.item !== "element") return { reason: "typeFixed" };
  if (to.kind !== "elementType") return { reason: "notOfferedInKind", details: { kind: diagram.kind } };
  const [from, target] = [item.elementType, to.elementType].map((type) => ELEMENT_TYPE_NAMES.get(type) ?? type);
  if (familyOf(item.elementType) !== familyOf(to.elementType)) return { reason: "crossFamily", details: { from: from ?? "", to: target ?? "" } };
  return ELEMENT_TYPES_BY_KIND[diagram.kind].includes(to.elementType) ? undefined : { reason: "notOfferedInKind", details: { kind: diagram.kind } };
};

const checkMoveEnd: Check = (diagram, operation) => {
  if (operation.op !== "moveEnd") return undefined;
  if (!diagram.content.relationships.some((relationship) => relationship.id === operation.linkId)) return { reason: "unknownItem" };
  const target = findItem(diagram.content.tree, operation.targetId);
  if (!target) return { reason: "unknownEndpoint" };
  return target.item === "boundary" ? endNotAllowed(diagram) : undefined;
};

const checkReverse: Check = (diagram, operation) => {
  if (operation.op !== "reverse") return undefined;
  const relationship = diagram.content.relationships.find((candidate) => candidate.id === operation.linkId);
  if (!relationship) return { reason: "unknownItem" };
  if (relationship.direction === "two-way") return { reason: "reverseUndirected" };
  return relationship.from === relationship.to ? { reason: "reverseSelf" } : undefined;
};

const hasRelationship = (diagram: C4Diagram, id: number) => diagram.content.relationships.some((relationship) => relationship.id === id);

const checkReorder: Check = (diagram, operation) => {
  if (operation.op !== "reorder") return undefined;
  if (diagram.kind !== "dynamic") return { reason: "notOfferedInKind", details: { kind: diagram.kind } };
  if (!hasRelationship(diagram, operation.itemId)) return { reason: "unknownItem" };
  const { toIndex } = operation;
  return Number.isInteger(toIndex) && toIndex >= 0 && toIndex < diagram.content.relationships.length ? undefined : { reason: "outOfRange" };
};

const checkDeleteItem: Check = (diagram, operation) =>
  operation.op === "deleteItem" && !hasRelationship(diagram, operation.itemId) && !findItem(diagram.content.tree, operation.itemId) ? { reason: "unknownItem" } : undefined;

const checkSetLabel: Check = (diagram, operation) => {
  if (operation.op !== "setLabel") return undefined;
  const { itemId, field, text } = operation;
  const item = findItem(diagram.content.tree, itemId);
  if (item) {
    const has =
      field === "label" ||
      (item.item === "element" && (field === "description" || (field === "technology" && hasTechnology(item.elementType)))) ||
      (item.item === "deployment-node" && (field === "description" || field === "technology"));
    if (!has) return { reason: "noSuchField" };
    return field === "label" && !isVisible(text) ? { reason: "blankLabel" } : undefined;
  }
  if (!diagram.content.relationships.some((relationship) => relationship.id === itemId)) return { reason: "unknownItem" };
  if (field !== "label" && field !== "technology") return { reason: "noSuchField" };
  return field === "label" && !isVisible(text) ? { reason: "blankRelationshipLabel" } : undefined;
};

const CHECKS: readonly Check[] = [checkOffered, checkAddElement, checkAddContainer, checkAddRelationship, checkReorder, checkMoveToParent, checkChangeType, checkMoveEnd, checkReverse, checkDeleteItem, checkSetLabel];

/** Why a C4 operation must be refused, or undefined when it may be applied. */
export function checkC4(diagram: C4Diagram, operation: Operation): Rejection | undefined {
  for (const check of CHECKS) {
    const rejection = check(diagram, operation);
    if (rejection) return rejection;
  }
  return undefined;
}
