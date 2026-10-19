import { describe, expect, it } from "vitest";
import { C4_KINDS, ELEMENT_TYPES_BY_KIND, familyOf } from "./c4/catalogue";
import { apply } from "./apply";
import { addConnection, addNode } from "./flowchart/apply";
import { newDiagram } from "./newDiagram";
import { addMessage, addParticipant } from "./sequence/apply";
import type { C4Diagram, Diagram, FlowchartDiagram, SequenceDiagram } from "./types";
import { c4Diagram, element, relationship } from "../testing/c4Builder";

// VO-096 (SC-016): changing an item's type within its family, or moving a relationship's end, in a diagram with many
// relationships adds, removes or reattaches no other relationship.

/** The links of a diagram: connections, messages or relationships, in order. */
function links(diagram: Diagram): readonly { readonly id: number }[] {
  if (diagram.type === "flowchart") return diagram.content.connections;
  if (diagram.type === "sequence") return diagram.content.messages;
  return diagram.content.relationships;
}

/** Every link except the one given must be exactly as it was, in the same order. */
function expectOthersUntouched(before: Diagram, after: Diagram, except?: number): void {
  const others = (diagram: Diagram) => links(diagram).filter((link) => link.id !== except);
  expect(others(after)).toEqual(others(before));
  expect(links(after).map((link) => link.id)).toEqual(links(before).map((link) => link.id));
}

function flowchart(): FlowchartDiagram {
  let diagram = newDiagram("f", "flowchart") as FlowchartDiagram;
  for (let index = 0; index < 6; index += 1) diagram = addNode(diagram, "rectangle", { x: index * 200, y: 0 });
  const nodes = diagram.content.nodes.map((node) => node.id);
  for (let index = 0; index < 12; index += 1) {
    diagram = addConnection(diagram, nodes[index % 6] ?? 0, nodes[(index * 5 + 1) % 6] ?? 0, index % 3 === 0 ? "solid" : "dotted", index % 2 === 0 ? "arrow" : "plain", `link ${String(index)}`);
  }
  return diagram;
}

function sequence(): SequenceDiagram {
  let diagram = newDiagram("s", "sequence") as SequenceDiagram;
  for (let index = 0; index < 5; index += 1) diagram = addParticipant(diagram, index % 2 === 0 ? "participant" : "actor");
  const participants = diagram.content.participants.map((participant) => participant.id);
  for (let index = 0; index < 12; index += 1) {
    diagram = addMessage(diagram, participants[index % 5] ?? 0, participants[(index * 3 + 1) % 5] ?? 0, index % 2 === 0 ? "solid-arrow" : "dashed-open", `message ${String(index)}`);
  }
  return diagram;
}

function c4(kind: (typeof C4_KINDS)[number]): C4Diagram {
  const type = ELEMENT_TYPES_BY_KIND[kind][0] ?? "system";
  const tree = Array.from({ length: 6 }, (_, index) => element(index + 1, type));
  const rels = Array.from({ length: 12 }, (_, index) => relationship(100 + index, (index % 6) + 1, ((index * 5 + 1) % 6) + 1, index % 2 === 0 ? "one-way" : "two-way"));
  return c4Diagram(kind, tree, rels);
}

describe("a flowchart with many connections", () => {
  it("changes a node's shape without touching a connection", () => {
    const before = flowchart();
    const node = before.content.nodes[2];
    const after = apply(before, { op: "changeType", itemId: node?.id ?? 0, to: { kind: "shape", shape: "hexagon" } });
    expect((after as FlowchartDiagram).content.nodes[2]?.shape).toBe("hexagon");
    expectOthersUntouched(before, after);
  });

  it("changes a connection's type and moves a connection's end, touching only that connection", () => {
    const before = flowchart();
    const target = before.content.connections[5];
    const changed = apply(before, { op: "changeType", itemId: target?.id ?? 0, to: { kind: "connection", line: "thick", ending: "both" } });
    expectOthersUntouched(before, changed, target?.id);
    const moved = apply(before, { op: "moveEnd", linkId: target?.id ?? 0, end: "to", targetId: before.content.nodes[0]?.id ?? 0 });
    expectOthersUntouched(before, moved, target?.id);
  });
});

describe("a sequence diagram with many messages", () => {
  it("changes a participant's role without touching a message", () => {
    const before = sequence();
    const after = apply(before, { op: "changeType", itemId: before.content.participants[1]?.id ?? 0, to: { kind: "role", role: "participant" } });
    expectOthersUntouched(before, after);
  });

  it("changes a message's style and moves a message's end, touching only that message", () => {
    const before = sequence();
    const target = before.content.messages[4];
    const changed = apply(before, { op: "changeType", itemId: target?.id ?? 0, to: { kind: "style", style: "solid-cross" } });
    expectOthersUntouched(before, changed, target?.id);
    const moved = apply(before, { op: "moveEnd", linkId: target?.id ?? 0, end: "from", targetId: before.content.participants[0]?.id ?? 0 });
    expectOthersUntouched(before, moved, target?.id);
  });
});

describe.each(C4_KINDS)("a %s diagram with many relationships", (kind) => {
  it("changes an element's type within its family without touching a relationship", () => {
    const before = c4(kind);
    const first = ELEMENT_TYPES_BY_KIND[kind][0] ?? "system";
    const sibling = ELEMENT_TYPES_BY_KIND[kind].find((type) => type !== first && familyOf(type) === familyOf(first));
    if (sibling === undefined) return;
    const after = apply(before, { op: "changeType", itemId: 3, to: { kind: "elementType", elementType: sibling } });
    expect(after).not.toBe(before);
    expectOthersUntouched(before, after);
  });

  it("changes a relationship's direction and moves a relationship's end, touching only that relationship", () => {
    const before = c4(kind);
    const changed = apply(before, { op: "changeType", itemId: 104, to: { kind: "direction", direction: "two-way" } });
    expectOthersUntouched(before, changed, 104);
    const moved = apply(before, { op: "moveEnd", linkId: 104, end: "to", targetId: 6 });
    expectOthersUntouched(before, moved, 104);
  });
});
