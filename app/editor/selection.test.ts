import { describe, expect, it } from "vitest";
import { addConnection, addNode } from "../model/flowchart/apply";
import { newDiagram } from "../model/newDiagram";
import { addMessage, addParticipant } from "../model/sequence/apply";
import type { FlowchartDiagram, SequenceDiagram } from "../model/types";
import { boundary, c4Diagram, element, relationship } from "../testing/c4Builder";
import { describeSelection } from "./selection";

// VO-006, VO-007, VO-008 (FR-010, FR-013, FR-014, US2-AS1 to AS3): the Properties panel names the selected element's type
// and offers only the actions that apply to it; with nothing selected it offers no element action at all.

const actionsOf = (view: ReturnType<typeof describeSelection>) => view.actions.map((offer) => offer.action);

function flowchart(): FlowchartDiagram {
  let diagram = newDiagram("f", "flowchart") as FlowchartDiagram;
  diagram = addNode(diagram, "rectangle", { x: 0, y: 0 });
  diagram = addNode(diagram, "circle", { x: 400, y: 0 });
  const [a, b] = diagram.content.nodes;
  return addConnection(diagram, a?.id ?? 0, b?.id ?? 0, "solid", "arrow");
}

function sequence(): SequenceDiagram {
  let diagram = newDiagram("s", "sequence") as SequenceDiagram;
  diagram = addParticipant(diagram, "participant");
  diagram = addParticipant(diagram, "actor");
  const [a, b] = diagram.content.participants;
  diagram = addMessage(diagram, a?.id ?? 0, b?.id ?? 0, "solid-arrow", "Hello");
  return addMessage(diagram, b?.id ?? 0, a?.id ?? 0, "dashed-arrow", "Back");
}

describe("with nothing selected", () => {
  it("offers no element action and names no type, in every diagram type", () => {
    for (const diagram of [flowchart(), sequence(), c4Diagram("context", [element(1, "person")])]) {
      const view = describeSelection(diagram, null);
      expect(view.actions).toEqual([]);
      expect(view.typeName).toBeUndefined();
    }
  });
});

describe("a flowchart", () => {
  it("names a selected node's shape and offers rename, change type, connect and delete only", () => {
    const diagram = flowchart();
    const view = describeSelection(diagram, diagram.content.nodes[0]?.id ?? null);
    expect(view.typeName).toBe("Rectangle node");
    expect(actionsOf(view)).toEqual(["rename", "changeType", "connect", "delete"]);
  });

  it("names a selected connection's type and shows its source, destination and direction", () => {
    const diagram = flowchart();
    const view = describeSelection(diagram, diagram.content.connections[0]?.id ?? null);
    expect(view.typeName).toBe("Solid arrow connection");
    expect(actionsOf(view)).toEqual(["rename", "changeType", "changeEndpoints", "reverse", "delete"]);
    expect(view.ends).toEqual({ from: "Rectangle (Rectangle 1)", to: "Circle (Circle 1)", direction: "From Rectangle to Circle" });
    expect(view.actions.every((offer) => offer.unavailable === undefined)).toBe(true);
  });

  it("disables Reverse with its reason for a self-connection and for a line with no direction", () => {
    let diagram = flowchart();
    const a = diagram.content.nodes[0]?.id ?? 0;
    diagram = addConnection(diagram, a, a, "solid", "arrow");
    const loop = diagram.content.connections[1]?.id ?? null;
    expect(describeSelection(diagram, loop).actions.find((offer) => offer.action === "reverse")?.unavailable).toMatch(/starts and ends at the same item/);

    diagram = addConnection(diagram, a, diagram.content.nodes[1]?.id ?? 0, "solid", "plain");
    const line = describeSelection(diagram, diagram.content.connections[2]?.id ?? null);
    expect(line.actions.find((offer) => offer.action === "reverse")?.unavailable).toMatch(/no single direction/);
    expect(line.ends?.direction).toBe("No direction");
  });
});

describe("a sequence diagram", () => {
  it("offers a participant rename, change type, connect, move and delete, and disables moving past either end", () => {
    const diagram = sequence();
    const first = describeSelection(diagram, diagram.content.participants[0]?.id ?? null);
    expect(first.typeName).toBe("Participant");
    expect(actionsOf(first)).toEqual(["rename", "changeType", "connect", "moveUp", "moveDown", "delete"]);
    expect(first.actions.find((offer) => offer.action === "moveUp")?.unavailable).toBeDefined();
    expect(first.actions.find((offer) => offer.action === "moveDown")?.unavailable).toBeUndefined();
  });

  it("offers a message rename, change type, change endpoints, reverse, move and delete", () => {
    const diagram = sequence();
    const view = describeSelection(diagram, diagram.content.messages[1]?.id ?? null);
    expect(view.typeName).toBe("Dashed arrow message");
    expect(actionsOf(view)).toEqual(["rename", "changeType", "changeEndpoints", "reverse", "moveUp", "moveDown", "delete"]);
    expect(view.actions.find((offer) => offer.action === "moveDown")?.unavailable).toBeDefined();
  });
});

describe("a C4 diagram", () => {
  const diagram = c4Diagram("container", [element(1, "person", "Ann"), boundary(2, "system", [element(3, "container", "App")])], [relationship(4, 1, 3)]);

  it("offers an element rename, change type, connect, move to and delete", () => {
    const view = describeSelection(diagram, 1);
    expect(view.typeName).toBe("Person");
    expect(actionsOf(view)).toEqual(["rename", "changeType", "connect", "moveTo", "delete"]);
  });

  it("offers a boundary rename, move to and delete, and no type change", () => {
    const view = describeSelection(diagram, 2);
    expect(view.typeName).toBe("System boundary");
    expect(actionsOf(view)).toEqual(["rename", "moveTo", "delete"]);
  });

  it("offers a relationship change endpoints and reverse, and moving only in a Dynamic diagram", () => {
    const view = describeSelection(diagram, 4);
    expect(view.typeName).toBe("One-way relationship");
    expect(actionsOf(view)).toEqual(["rename", "changeType", "changeEndpoints", "reverse", "delete"]);
    const dynamic = c4Diagram("dynamic", [element(1, "person", "Ann"), element(3, "container", "App")], [relationship(4, 1, 3)]);
    expect(actionsOf(describeSelection(dynamic, 4))).toEqual(["rename", "changeType", "changeEndpoints", "reverse", "moveUp", "moveDown", "delete"]);
  });
});
