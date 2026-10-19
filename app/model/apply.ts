import {
  addConnection,
  addNode,
  changeConnection,
  changeShape,
  deleteItem,
  moveEnd,
  moveNode,
  reverse,
  setLabel,
} from "./flowchart/apply";
import type { Operation, TypeChange } from "./operations";
import * as c4 from "./c4/apply";
import * as sequence from "./sequence/apply";
import type { C4Diagram, Diagram, FlowchartDiagram, SequenceDiagram } from "./types";

function applyFlowchart(diagram: FlowchartDiagram, operation: Operation): FlowchartDiagram | undefined {
  switch (operation.op) {
    case "addNode":
      return addNode(diagram, operation.shape, operation.position);
    case "addConnection":
      return addConnection(diagram, operation.from, operation.to, operation.line, operation.ending, operation.label);
    case "moveNode":
      return moveNode(diagram, operation.id, operation.position);
    case "setLabel":
      return setLabel(diagram, operation.itemId, operation.field, operation.text);
    case "deleteItem":
      return deleteItem(diagram, operation.itemId);
    case "changeType":
      if (operation.to.kind === "shape") return changeShape(diagram, operation.itemId, operation.to.shape);
      if (operation.to.kind === "connection") return changeConnection(diagram, operation.itemId, operation.to.line, operation.to.ending);
      return undefined;
    case "moveEnd":
      return moveEnd(diagram, operation.linkId, operation.end, operation.targetId);
    case "reverse":
      return reverse(diagram, operation.linkId);
    default:
      return undefined;
  }
}

function changeSequenceType(diagram: SequenceDiagram, itemId: number, to: TypeChange): SequenceDiagram | undefined {
  if (to.kind === "role") return sequence.changeRole(diagram, itemId, to.role);
  if (to.kind === "style") return sequence.changeStyle(diagram, itemId, to.style);
  return undefined;
}

function applySequence(diagram: SequenceDiagram, operation: Operation): SequenceDiagram | undefined {
  switch (operation.op) {
    case "addParticipant":
      return sequence.addParticipant(diagram, operation.role, operation.index);
    case "addMessage":
      return sequence.addMessage(diagram, operation.from, operation.to, operation.style, operation.text, operation.index);
    case "setLabel":
      return sequence.setLabel(diagram, operation.itemId, operation.field, operation.text);
    case "deleteItem":
      return sequence.deleteItem(diagram, operation.itemId);
    case "reorder":
      return sequence.reorder(diagram, operation.itemId, operation.toIndex);
    case "changeType":
      return changeSequenceType(diagram, operation.itemId, operation.to);
    case "moveEnd":
      return sequence.moveEnd(diagram, operation.linkId, operation.end, operation.targetId);
    case "reverse":
      return sequence.reverse(diagram, operation.linkId);
    default:
      return undefined;
  }
}

function changeC4Type(diagram: C4Diagram, itemId: number, to: TypeChange): C4Diagram | undefined {
  if (to.kind === "elementType") return c4.changeElementType(diagram, itemId, to.elementType);
  if (to.kind === "direction") return c4.changeDirection(diagram, itemId, to.direction);
  return undefined;
}

function applyC4(diagram: C4Diagram, operation: Operation): C4Diagram | undefined {
  switch (operation.op) {
    case "setTitle":
      return c4.setTitle(diagram, operation.text);
    case "addElement":
      return c4.addElement(diagram, operation.elementType, operation.parentId, operation.index);
    case "addContainer":
      return c4.addContainer(diagram, operation.container, operation.parentId);
    case "addRelationship":
      return c4.addRelationship(diagram, operation.from, operation.to, operation.direction);
    case "changeType":
      return changeC4Type(diagram, operation.itemId, operation.to);
    case "moveEnd":
      return c4.moveEnd(diagram, operation.linkId, operation.end, operation.targetId);
    case "reverse":
      return c4.reverse(diagram, operation.linkId);
    case "moveToParent":
      return c4.moveToParent(diagram, operation.itemId, operation.parentId, operation.index);
    case "reorder":
      return c4.reorder(diagram, operation.itemId, operation.toIndex);
    case "deleteItem":
      return c4.deleteItem(diagram, operation.itemId);
    case "setLabel":
      return c4.setLabel(diagram, operation.itemId, operation.field, operation.text);
    default:
      return undefined;
  }
}

/** Applies an accepted operation whole. Validation has already run, so an operation that cannot apply is a bug. */
export function apply(diagram: Diagram, operation: Operation): Diagram {
  if (operation.op === "renameDiagram") return diagram.name === operation.name ? diagram : { ...diagram, name: operation.name };
  let result: Diagram | undefined;
  if (diagram.type === "flowchart") result = applyFlowchart(diagram, operation);
  else if (diagram.type === "sequence") result = applySequence(diagram, operation);
  else result = applyC4(diagram, operation);
  if (result) return result;
  throw new Error(`Operation ${operation.op} is not built yet for ${diagram.type} diagrams`);
}
