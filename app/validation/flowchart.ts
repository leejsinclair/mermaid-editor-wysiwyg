import { shapeName } from "../model/flowchart/catalogue";
import { withinBounds } from "../model/flowchart/freePosition";
import type { Operation } from "../model/operations";
import type { FlowchartDiagram } from "../model/types";
import { isVisible } from "./label";
import type { Rejection } from "./reasons";

type Check = (diagram: FlowchartDiagram, operation: Operation) => Rejection | undefined;

const hasNode = (diagram: FlowchartDiagram, id: number) => diagram.content.nodes.some((node) => node.id === id);
const hasConnection = (diagram: FlowchartDiagram, id: number) => diagram.content.connections.some((connection) => connection.id === id);

const checkAddNode: Check = (_diagram, operation) => {
  if (operation.op !== "addNode") return undefined;
  if (shapeName(operation.shape) === undefined) return { reason: "unknownShape" };
  return withinBounds(operation.position) ? undefined : { reason: "outOfRange" };
};

const checkMoveNode: Check = (diagram, operation) => {
  if (operation.op !== "moveNode") return undefined;
  if (!hasNode(diagram, operation.id)) return { reason: "unknownItem" };
  return withinBounds(operation.position) ? undefined : { reason: "outOfRange" };
};

const checkAddConnection: Check = (diagram, operation) =>
  operation.op === "addConnection" && !(hasNode(diagram, operation.from) && hasNode(diagram, operation.to))
    ? { reason: "unknownEndpoint" }
    : undefined;

const checkSetLabel: Check = (diagram, operation) => {
  if (operation.op !== "setLabel") return undefined;
  const isNode = hasNode(diagram, operation.itemId);
  if (!isNode && !hasConnection(diagram, operation.itemId)) return { reason: "unknownItem" };
  if (operation.field !== "label") return { reason: "noSuchField" };
  // A node's label is required; a connection's may be empty.
  return isNode && !isVisible(operation.text) ? { reason: "blankLabel" } : undefined;
};

const checkDeleteItem: Check = (diagram, operation) =>
  operation.op === "deleteItem" && !hasNode(diagram, operation.itemId) && !hasConnection(diagram, operation.itemId)
    ? { reason: "unknownItem" }
    : undefined;

const checkChangeShape: Check = (diagram, operation) => {
  if (operation.op !== "changeType" || operation.to.kind !== "shape") return undefined;
  if (shapeName(operation.to.shape) === undefined) return { reason: "unknownShape" };
  return hasNode(diagram, operation.itemId) ? undefined : { reason: "unknownItem" };
};

const checkChangeConnection: Check = (diagram, operation) =>
  operation.op === "changeType" && operation.to.kind === "connection" && !hasConnection(diagram, operation.itemId)
    ? { reason: "unknownItem" }
    : undefined;

const checkMoveEnd: Check = (diagram, operation) => {
  if (operation.op !== "moveEnd") return undefined;
  if (!hasConnection(diagram, operation.linkId)) return { reason: "unknownItem" };
  return hasNode(diagram, operation.targetId) ? undefined : { reason: "unknownEndpoint" };
};

const checkReverse: Check = (diagram, operation) => {
  if (operation.op !== "reverse") return undefined;
  const target = diagram.content.connections.find((connection) => connection.id === operation.linkId);
  if (!target) return { reason: "unknownItem" };
  if (target.from === target.to) return { reason: "reverseSelf" };
  return target.ending === "arrow" ? undefined : { reason: "reverseUndirected" };
};

const CHECKS: readonly Check[] = [checkAddNode, checkMoveNode, checkAddConnection, checkSetLabel, checkDeleteItem, checkChangeShape, checkChangeConnection, checkMoveEnd, checkReverse];

/** Why a flowchart operation must be refused, or undefined when it may be applied. */
export function checkFlowchart(diagram: FlowchartDiagram, operation: Operation): Rejection | undefined {
  for (const check of CHECKS) {
    const rejection = check(diagram, operation);
    if (rejection) return rejection;
  }
  return undefined;
}
