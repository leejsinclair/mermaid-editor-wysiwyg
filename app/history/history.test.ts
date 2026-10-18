import { describe, expect, it } from "vitest";
import { generate } from "../generation/generate";
import { C4_KINDS } from "../model/c4/catalogue";
import { newDiagram } from "../model/newDiagram";
import type { Operation } from "../model/operations";
import type { C4Kind, Diagram } from "../model/types";
import { canRedo, canUndo, commit, createHistory, redo, undo, type History } from "./history";

// VO-029: every operation kind is committed in sequence, undone back to the start, then redone; at every step the
// diagram equals the state at that point and the source equals the source for it. Flowchart, Sequence and the five C4
// kinds.

/** Ids: nodes 1 to 3, then connections 4 and 5. */
const FLOWCHART_OPERATIONS: readonly Operation[] = [
  { op: "addNode", shape: "rectangle", position: { x: 0, y: 0 } },
  { op: "addNode", shape: "circle", position: { x: 400, y: 0 } },
  { op: "addNode", shape: "diamond", position: { x: 800, y: 0 } },
  { op: "addConnection", from: 1, to: 2, line: "solid", ending: "arrow" },
  { op: "addConnection", from: 2, to: 3, line: "dotted", ending: "arrow", label: "next" },
  { op: "moveNode", id: 3, position: { x: 800, y: 300 } },
  { op: "setLabel", itemId: 1, field: "label", text: "Start" },
  { op: "setLabel", itemId: 5, field: "label", text: "then" },
  { op: "changeType", itemId: 2, to: { kind: "shape", shape: "hexagon" } },
  { op: "changeType", itemId: 4, to: { kind: "connection", line: "thick", ending: "arrow" } },
  { op: "moveEnd", linkId: 5, end: "to", targetId: 1 },
  { op: "reverse", linkId: 4 },
  { op: "deleteItem", itemId: 4 },
  { op: "deleteItem", itemId: 3 },
];

/** Ids: participants 1 to 3, then messages 4 to 6. */
const SEQUENCE_OPERATIONS: readonly Operation[] = [
  { op: "addParticipant", role: "participant" },
  { op: "addParticipant", role: "actor" },
  { op: "addParticipant", role: "participant", index: 0 },
  { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "One" },
  { op: "addMessage", from: 2, to: 3, style: "dashed-cross", text: "Two" },
  { op: "addMessage", from: 3, to: 3, style: "solid-async", text: "Three", index: 0 },
  { op: "setLabel", itemId: 1, field: "label", text: "Browser" },
  { op: "setLabel", itemId: 5, field: "text", text: "Reply" },
  { op: "changeType", itemId: 1, to: { kind: "role", role: "actor" } },
  { op: "changeType", itemId: 5, to: { kind: "style", style: "dashed-open" } },
  { op: "moveEnd", linkId: 5, end: "to", targetId: 1 },
  { op: "reverse", linkId: 4 },
  { op: "reorder", itemId: 3, toIndex: 2 },
  { op: "reorder", itemId: 6, toIndex: 2 },
  { op: "deleteItem", itemId: 4 },
  { op: "deleteItem", itemId: 2 },
];

/** Ids: container 1, elements 2 to 4, relationships 5 and 6; Dynamic also reorders. */
const c4Operations = (kind: C4Kind): readonly Operation[] => [
  { op: "addContainer", container: "generic" },
  { op: "addElement", elementType: "person" },
  { op: "addElement", elementType: "system", parentId: 1 },
  { op: "addElement", elementType: "person" },
  { op: "addRelationship", from: 2, to: 3, direction: "one-way" },
  { op: "addRelationship", from: 3, to: 4, direction: "two-way" },
  { op: "setLabel", itemId: 2, field: "label", text: "Customer" },
  { op: "setLabel", itemId: 3, field: "description", text: "Billing" },
  { op: "setLabel", itemId: 5, field: "label", text: "Calls" },
  { op: "setLabel", itemId: 6, field: "technology", text: "gRPC" },
  { op: "changeType", itemId: 3, to: { kind: "elementType", elementType: "system-ext" } },
  { op: "moveEnd", linkId: 5, end: "to", targetId: 4 },
  { op: "reverse", linkId: 5 },
  { op: "changeType", itemId: 5, to: { kind: "direction", direction: "two-way" } },
  { op: "moveToParent", itemId: 2, parentId: 1 },
  { op: "setTitle", text: "A title" },
  ...(kind === "dynamic" ? ([{ op: "reorder", itemId: 6, toIndex: 0 }] as const) : []),
  { op: "deleteItem", itemId: 6 },
  { op: "deleteItem", itemId: 1 },
];

/** Ids: nodes 1 and 2, Containers 3 and 4, relationships 5 and 6. */
const DEPLOYMENT_OPERATIONS: readonly Operation[] = [
  { op: "addContainer", container: "deployment-node" },
  { op: "addContainer", container: "deployment-node", parentId: 1 },
  { op: "addElement", elementType: "container", parentId: 2 },
  { op: "addElement", elementType: "container" },
  { op: "addRelationship", from: 3, to: 4, direction: "one-way" },
  { op: "addRelationship", from: 2, to: 4, direction: "two-way" },
  { op: "setLabel", itemId: 1, field: "label", text: "Cloud" },
  { op: "setLabel", itemId: 2, field: "technology", text: "Kubernetes" },
  { op: "setLabel", itemId: 3, field: "technology", text: "Java" },
  { op: "moveEnd", linkId: 5, end: "to", targetId: 2 },
  { op: "reverse", linkId: 5 },
  { op: "moveToParent", itemId: 4, parentId: 1 },
  { op: "setTitle", text: "A title" },
  { op: "deleteItem", itemId: 2 },
  { op: "deleteItem", itemId: 1 },
];

interface Scenario {
  readonly name: string;
  readonly fresh: () => Diagram;
  readonly operations: readonly Operation[];
}

const SCENARIOS: readonly Scenario[] = [
  { name: "flowchart", fresh: () => newDiagram("d1", "flowchart"), operations: FLOWCHART_OPERATIONS },
  { name: "sequence", fresh: () => newDiagram("d1", "sequence"), operations: SEQUENCE_OPERATIONS },
  ...C4_KINDS.map((kind): Scenario => ({ name: `C4 ${kind}`, fresh: () => newDiagram("d1", "c4", kind), operations: kind === "deployment" ? DEPLOYMENT_OPERATIONS : c4Operations(kind) })),
];

function build({ fresh, operations }: Scenario): { history: History; states: Diagram[] } {
  let history = createHistory(fresh());
  const states = [history.present];
  for (const operation of operations) {
    const result = commit(history, operation);
    expect(result.outcome, JSON.stringify(operation)).toEqual({ committed: true });
    history = result.history;
    states.push(history.present);
  }
  return { history, states };
}

describe.each(SCENARIOS)("undo and redo of a $name diagram", (scenario) => {
  it("undo walks back through every state, and redo forward again in the original order", () => {
    const { history: full, states } = build(scenario);
    let history = full;
    const stateAt = (step: number): Diagram => {
      const state = states[step];
      if (!state) throw new Error(`No state ${String(step)}`);
      return state;
    };

    for (let step = states.length - 1; step > 0; step -= 1) {
      expect(history.present).toEqual(stateAt(step));
      expect(generate(history.present).source).toBe(generate(stateAt(step)).source);
      expect(canUndo(history)).toBe(true);
      history = undo(history);
    }
    expect(history.present).toEqual(stateAt(0));
    expect(canUndo(history)).toBe(false);

    for (let step = 1; step < states.length; step += 1) {
      expect(canRedo(history)).toBe(true);
      history = redo(history);
      expect(history.present).toEqual(stateAt(step));
      expect(generate(history.present).source).toBe(generate(stateAt(step)).source);
    }
    expect(canRedo(history)).toBe(false);
  });

  it("returns the same reference when there is nothing to undo or redo", () => {
    const fresh = createHistory(scenario.fresh());

    expect(undo(fresh)).toBe(fresh);
    expect(redo(fresh)).toBe(fresh);
    expect(canUndo(fresh)).toBe(false);
    expect(canRedo(fresh)).toBe(false);
  });
});
