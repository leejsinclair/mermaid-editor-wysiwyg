import { describe, expect, it } from "vitest";
import { C4_KINDS } from "../model/c4/catalogue";
import { addConnection, addNode } from "../model/flowchart/apply";
import { newDiagram } from "../model/newDiagram";
import type { Operation } from "../model/operations";
import type { C4Kind, FlowchartDiagram } from "../model/types";
import { en } from "../text/en";
import { rejectionMessage } from "../validation/messages";
import { REJECTION_REASONS } from "../validation/reasons";
import { commit, createHistory, type History } from "./history";

// VO-024 (FR-009): an invalid operation is rejected with its fixed explanation, the diagram is identical to
// before, and no history entry is added. Flowchart, Sequence and the five C4 kinds.

function diagram(): FlowchartDiagram {
  let result = addNode(addNode(newDiagram("d1", "flowchart") as FlowchartDiagram, "rectangle", { x: 0, y: 0 }), "circle", { x: 400, y: 0 });
  result = addConnection(result, 1, 2, "solid", "arrow", "keep");
  return result;
}

const CASES: readonly (readonly [string, Operation, string])[] = [
  ["a label of an item that does not exist", { op: "setLabel", itemId: 99, field: "label", text: "x" }, "unknownItem"],
  ["a delete of an item that does not exist", { op: "deleteItem", itemId: 99 }, "unknownItem"],
  ["a connection from a node that does not exist", { op: "addConnection", from: 99, to: 1, line: "solid", ending: "arrow" }, "unknownEndpoint"],
  ["a connection to a node that does not exist", { op: "addConnection", from: 1, to: 99, line: "solid", ending: "arrow" }, "unknownEndpoint"],
  ["a node of an unknown shape", { op: "addNode", shape: "blob" as never, position: { x: 0, y: 0 } }, "unknownShape"],
  ["a blank node label", { op: "setLabel", itemId: 1, field: "label", text: "  \n " }, "blankLabel"],
  ["a field a flowchart node does not have", { op: "setLabel", itemId: 1, field: "description" as never, text: "x" }, "noSuchField"],
];

function sequence() {
  const operations: Operation[] = [
    { op: "addParticipant", role: "participant" },
    { op: "addParticipant", role: "actor" },
    { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "keep" },
  ];
  return operations.reduce((history, operation) => commit(history, operation).history, createHistory(newDiagram("d2", "sequence")));
}

const SEQUENCE_CASES: readonly (readonly [string, Operation, string])[] = [
  ["a message from a participant that does not exist", { op: "addMessage", from: 99, to: 1, style: "solid-arrow", text: "x" }, "unknownEndpoint"],
  ["a message to a participant that does not exist", { op: "addMessage", from: 1, to: 99, style: "solid-arrow", text: "x" }, "unknownEndpoint"],
  ["a message with blank text", { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: " \n" }, "blankMessage"],
  ["blank text for an existing message", { op: "setLabel", itemId: 3, field: "text", text: "" }, "blankMessage"],
  ["a blank participant label", { op: "setLabel", itemId: 1, field: "label", text: " " }, "blankLabel"],
  ["a field a participant does not have", { op: "setLabel", itemId: 1, field: "text", text: "x" }, "noSuchField"],
  ["a move to a position past the last", { op: "reorder", itemId: 1, toIndex: 2 }, "outOfRange"],
  ["a reorder of an item that does not exist", { op: "reorder", itemId: 99, toIndex: 0 }, "unknownItem"],
  ["a delete of an item that does not exist", { op: "deleteItem", itemId: 99 }, "unknownItem"],
  ["moving a message end to a participant that does not exist", { op: "moveEnd", linkId: 3, end: "to", targetId: 99 }, "unknownEndpoint"],
];

describe("rejected sequence operations", () => {
  it.each(SEQUENCE_CASES)("%s is rejected with its fixed explanation and leaves the history untouched", (_name, operation, reason) => {
    const history = sequence();

    const result = commit(history, operation);

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason } });
    expect(result.history).toBe(history);
    expect(result.history.past).toHaveLength(3);
  });

  it("refuses to reverse a message from a participant to itself", () => {
    const history = commit(sequence(), { op: "addMessage", from: 1, to: 1, style: "solid-arrow", text: "self" }).history;

    const result = commit(history, { op: "reverse", linkId: 4 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "reverseSelf" } });
    expect(result.history).toBe(history);
  });
});

describe("rejected operations", () => {
  it.each(CASES)("%s is rejected with its fixed explanation and leaves the history untouched", (_name, operation, reason) => {
    const history = createHistory(diagram());

    const result = commit(history, operation);

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason } });
    expect(result.history).toBe(history);
    expect(result.history.past).toHaveLength(0);
    expect(result.history.present).toEqual(diagram());
  });
});

describe("rejectionMessage", () => {
  it("gives every reason its catalogue sentence", () => {
    for (const reason of REJECTION_REASONS) {
      expect(rejectionMessage({ reason }).length).toBeGreaterThan(0);
    }
    expect(rejectionMessage({ reason: "blankLabel" })).toBe(en.rejections.blankLabel);
    expect(rejectionMessage({ reason: "unknownEndpoint" })).toBe(en.rejections.unknownEndpoint);
  });

  it("fills the values a sentence names", () => {
    expect(rejectionMessage({ reason: "crossFamily", details: { from: "Rectangle", to: "Person" } })).toBe(
      "A Rectangle can only be changed to another type in its family. Delete it and add a Person instead.",
    );
  });
});

/** Container 1 holding element 2, and element 3 at the top level; in Deployment the container is a node and the elements Containers. */
function c4(kind: C4Kind): History {
  const type = kind === "deployment" ? "container" : "person";
  const operations: Operation[] = [
    { op: "addContainer", container: kind === "deployment" ? "deployment-node" : "generic" },
    { op: "addElement", elementType: type, parentId: 1 },
    { op: "addElement", elementType: type },
  ];
  return operations.reduce((history, operation) => commit(history, operation).history, createHistory(newDiagram("d3", "c4", kind)));
}

function c4Cases(kind: C4Kind): readonly (readonly [string, Operation, string])[] {
  const deployment = kind === "deployment";
  const type = deployment ? "container" : "person";
  return [
    ["a relationship from an item that does not exist", { op: "addRelationship", from: 99, to: 2, direction: "one-way" }, "unknownEndpoint"],
    ["a relationship to an item that does not exist", { op: "addRelationship", from: 2, to: 99, direction: "two-way" }, "unknownEndpoint"],
    ...(deployment ? [] : ([["a relationship that ends at a boundary", { op: "addRelationship", from: 3, to: 1, direction: "one-way" }, "endNotAllowed"]] as const)),
    ["a blank element label", { op: "setLabel", itemId: 2, field: "label", text: " " }, "blankLabel"],
    ["a blank container label", { op: "setLabel", itemId: 1, field: "label", text: "\n" }, "blankLabel"],
    ["a message's field for an element", { op: "setLabel", itemId: 2, field: "text", text: "x" }, "noSuchField"],
    ...(deployment ? [] : ([["a technology for a person", { op: "setLabel", itemId: 3, field: "technology", text: "x" }, "noSuchField"]] as const)),
    ["an element of a type the kind does not offer", { op: "addElement", elementType: kind === "context" ? "container" : "system-queue-ext" }, "notOfferedInKind"],
    ["an element inside an element", { op: "addElement", elementType: type, parentId: 3 }, "parentNotAllowed"],
    ["a move into an item that does not exist", { op: "moveToParent", itemId: 2, parentId: 99 }, "unknownItem"],
    ["a container moved inside itself", { op: "moveToParent", itemId: 1, parentId: 1 }, "nestingCycle"],
    ["a change of a container's type", { op: "changeType", itemId: 1, to: { kind: "elementType", elementType: type } }, "typeFixed"],
    ["a change to another family", { op: "changeType", itemId: 2, to: { kind: "elementType", elementType: deployment ? "component" : "system" } }, "crossFamily"],
    ["a reorder of an element", { op: "reorder", itemId: 2, toIndex: 0 }, kind === "dynamic" ? "unknownItem" : "notOfferedInKind"],
    ["a delete of an item that does not exist", { op: "deleteItem", itemId: 99 }, "unknownItem"],
  ];
}

describe.each(C4_KINDS)("rejected operations in a %s diagram", (kind) => {
  it.each(c4Cases(kind))("%s is rejected with its fixed explanation and leaves the history untouched", (_name, operation, reason) => {
    const history = c4(kind);

    const result = commit(history, operation);

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason } });
    expect(result.history).toBe(history);
    expect(result.history.past).toHaveLength(3);
  });
});
