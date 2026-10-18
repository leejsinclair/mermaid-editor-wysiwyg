import { MESSAGE_STYLES, PARTICIPANT_ROLES } from "../model/sequence/catalogue";
import type { Operation } from "../model/operations";
import type { SequenceDiagram } from "../model/types";
import { isVisible } from "./label";
import type { Rejection } from "./reasons";

type Check = (diagram: SequenceDiagram, operation: Operation) => Rejection | undefined;

const hasParticipant = (diagram: SequenceDiagram, id: number) => diagram.content.participants.some((participant) => participant.id === id);
const hasMessage = (diagram: SequenceDiagram, id: number) => diagram.content.messages.some((message) => message.id === id);

const checkAddMessage: Check = (diagram, operation) => {
  if (operation.op !== "addMessage") return undefined;
  if (!(hasParticipant(diagram, operation.from) && hasParticipant(diagram, operation.to))) return { reason: "unknownEndpoint" };
  return isVisible(operation.text) ? undefined : { reason: "blankMessage" };
};

const checkSetLabel: Check = (diagram, operation) => {
  if (operation.op !== "setLabel") return undefined;
  const isParticipant = hasParticipant(diagram, operation.itemId);
  if (!isParticipant && !hasMessage(diagram, operation.itemId)) return { reason: "unknownItem" };
  if (operation.field !== (isParticipant ? "label" : "text")) return { reason: "noSuchField" };
  if (isVisible(operation.text)) return undefined;
  return { reason: isParticipant ? "blankLabel" : "blankMessage" };
};

const checkDeleteItem: Check = (diagram, operation) =>
  operation.op === "deleteItem" && !hasParticipant(diagram, operation.itemId) && !hasMessage(diagram, operation.itemId)
    ? { reason: "unknownItem" }
    : undefined;

const checkReorder: Check = (diagram, operation) => {
  if (operation.op !== "reorder") return undefined;
  const { participants, messages } = diagram.content;
  const list = hasParticipant(diagram, operation.itemId) ? participants : messages;
  if (list === messages && !hasMessage(diagram, operation.itemId)) return { reason: "unknownItem" };
  return Number.isInteger(operation.toIndex) && operation.toIndex >= 0 && operation.toIndex < list.length ? undefined : { reason: "outOfRange" };
};

const checkChangeType: Check = (diagram, operation) => {
  if (operation.op !== "changeType") return undefined;
  const { to, itemId } = operation;
  if (to.kind === "role") {
    if (!PARTICIPANT_ROLES.includes(to.role)) return { reason: "crossFamily" };
    return hasParticipant(diagram, itemId) ? undefined : { reason: "unknownItem" };
  }
  if (to.kind === "style") {
    if (!MESSAGE_STYLES.includes(to.style)) return { reason: "crossFamily" };
    return hasMessage(diagram, itemId) ? undefined : { reason: "unknownItem" };
  }
  return { reason: "crossFamily" };
};

const checkMoveEnd: Check = (diagram, operation) => {
  if (operation.op !== "moveEnd") return undefined;
  if (!hasMessage(diagram, operation.linkId)) return { reason: "unknownItem" };
  return hasParticipant(diagram, operation.targetId) ? undefined : { reason: "unknownEndpoint" };
};

const checkReverse: Check = (diagram, operation) => {
  if (operation.op !== "reverse") return undefined;
  const target = diagram.content.messages.find((message) => message.id === operation.linkId);
  if (!target) return { reason: "unknownItem" };
  return target.from === target.to ? { reason: "reverseSelf" } : undefined;
};

/** The operations a sequence diagram has; it has no free positions, so nothing like moveNode (FR-003). */
const OPERATIONS: ReadonlySet<Operation["op"]> = new Set([
  "addParticipant",
  "addMessage",
  "setLabel",
  "deleteItem",
  "reorder",
  "changeType",
  "moveEnd",
  "reverse",
]);

const checkOffered: Check = (_diagram, operation) => (OPERATIONS.has(operation.op) ? undefined : { reason: "unknownItem" });

const CHECKS: readonly Check[] = [checkOffered, checkAddMessage, checkSetLabel, checkDeleteItem, checkReorder, checkChangeType, checkMoveEnd, checkReverse];

/** Why a sequence operation must be refused, or undefined when it may be applied. */
export function checkSequence(diagram: SequenceDiagram, operation: Operation): Rejection | undefined {
  for (const check of CHECKS) {
    const rejection = check(diagram, operation);
    if (rejection) return rejection;
  }
  return undefined;
}
