import { describe, expect, it } from "vitest";
import { commit, createHistory, redo, undo, type History } from "../history/history";
import { BOUNDARY_TYPES_BY_KIND, C4_KINDS, ELEMENT_TYPES_BY_KIND } from "../model/c4/catalogue";
import { walkItems } from "../model/c4/tree";
import { FLOWCHART_SHAPES } from "../model/flowchart/catalogue";
import { newDiagram } from "../model/newDiagram";
import type { Operation } from "../model/operations";
import { MESSAGE_STYLES, PARTICIPANT_ROLES } from "../model/sequence/catalogue";
import type { BoundaryType, C4Diagram, C4Kind, ElementType, FlowchartDiagram, SequenceDiagram } from "../model/types";
import { checkDiagram } from "./checkDiagram";

// VO-100 (DC-06): long seeded random sequences of valid and invalid operations are applied; after every accepted
// operation the diagram passes checkDiagram. Flowchart, Sequence and the five C4 kinds.

/** A small seeded generator (mulberry32), so a failure can be replayed from its seed. */
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHAPES = FLOWCHART_SHAPES.map((entry) => entry.shape);
const LINES = ["solid", "dotted", "thick"] as const;
const ENDINGS = ["arrow", "plain", "both"] as const;
const TEXTS = ["Label", "", "  ", "multi\nline", "​", "😀", "a\"b<c>", "%% x", "end"];
const COORDINATES = [0, 1, -1, 160, 400, 63.5, -1000, 1e6, 1e15, -1e15, 1e308, -1e308, Infinity, -Infinity, NaN];

function generator(next: () => number) {
  const pick = <T>(items: readonly T[]): T => items.at(Math.floor(next() * items.length)) as T;
  const id = (diagram: FlowchartDiagram) => {
    const known = [...diagram.content.nodes, ...diagram.content.connections].map((item) => item.id);
    // Mostly real ids, sometimes ones that do not exist.
    return next() < 0.8 && known.length > 0 ? pick(known) : Math.floor(next() * 40);
  };
  const node = (diagram: FlowchartDiagram) => (next() < 0.85 && diagram.content.nodes.length > 0 ? pick(diagram.content.nodes).id : Math.floor(next() * 40));
  const coordinate = () => (next() < 0.7 ? Math.round(next() * 1600 - 400) : pick(COORDINATES));

  return (diagram: FlowchartDiagram): Operation => {
    switch (Math.floor(next() * 11)) {
      case 0:
      case 1:
        return { op: "addNode", shape: next() < 0.95 ? pick(SHAPES) : ("blob" as never), position: { x: coordinate(), y: coordinate() } };
      case 2:
      case 3:
        return { op: "addConnection", from: node(diagram), to: node(diagram), line: pick(LINES), ending: pick(ENDINGS), label: pick(TEXTS) };
      case 4:
        return { op: "moveNode", id: node(diagram), position: { x: coordinate(), y: coordinate() } };
      case 5:
        return { op: "setLabel", itemId: id(diagram), field: "label", text: pick(TEXTS) };
      case 6:
        return { op: "deleteItem", itemId: id(diagram) };
      case 7:
        return { op: "changeType", itemId: node(diagram), to: { kind: "shape", shape: pick(SHAPES) } };
      case 8:
        return { op: "changeType", itemId: id(diagram), to: { kind: "connection", line: pick(LINES), ending: pick(ENDINGS) } };
      case 9:
        return { op: "moveEnd", linkId: id(diagram), end: next() < 0.5 ? "from" : "to", targetId: node(diagram) };
      default:
        return { op: "reverse", linkId: id(diagram) };
    }
  };
}

describe("every accepted operation leaves a diagram that checkDiagram accepts", () => {
  it.each(Array.from({ length: 25 }, (_, seed) => seed + 1))("with seed %i", (seed) => {
    const next = random(seed);
    const operation = generator(next);
    let history: History = createHistory(newDiagram("d", "flowchart"));
    let accepted = 0;

    for (let step = 0; step < 300; step += 1) {
      const roll = next();
      const before = history;
      if (roll < 0.06) history = undo(history);
      else if (roll < 0.1) history = redo(history);
      else {
        const op = operation(history.present as FlowchartDiagram);
        history = commit(history, op).history;
        if (history !== before) accepted += 1;
      }
      const checked = checkDiagram(history.present);
      expect(checked, `seed ${String(seed)}, step ${String(step)}: ${JSON.stringify(history.present.content)}`).toMatchObject({ ok: true });
    }
    expect(accepted).toBeGreaterThan(20);
  });
});

function sequenceGenerator(next: () => number) {
  const pick = <T>(items: readonly T[]): T => items.at(Math.floor(next() * items.length)) as T;
  const participant = (diagram: SequenceDiagram) =>
    next() < 0.85 && diagram.content.participants.length > 0 ? pick(diagram.content.participants).id : Math.floor(next() * 40);
  const message = (diagram: SequenceDiagram) => (next() < 0.85 && diagram.content.messages.length > 0 ? pick(diagram.content.messages).id : Math.floor(next() * 40));
  const item = (diagram: SequenceDiagram) => (next() < 0.5 ? participant(diagram) : message(diagram));
  const index = () => (next() < 0.8 ? Math.floor(next() * 8) : pick([-1, 100, 1.5, NaN, Infinity]));

  return (diagram: SequenceDiagram): Operation => {
    switch (Math.floor(next() * 11)) {
      case 0:
        return { op: "addParticipant", role: pick(PARTICIPANT_ROLES), index: index() };
      case 1:
      case 2:
        return { op: "addMessage", from: participant(diagram), to: participant(diagram), style: pick(MESSAGE_STYLES), text: pick(TEXTS), index: index() };
      case 3:
        return { op: "setLabel", itemId: item(diagram), field: next() < 0.5 ? "label" : "text", text: pick(TEXTS) };
      case 4:
        return { op: "deleteItem", itemId: item(diagram) };
      case 5:
        return { op: "reorder", itemId: item(diagram), toIndex: index() };
      case 6:
        return { op: "changeType", itemId: participant(diagram), to: { kind: "role", role: pick(PARTICIPANT_ROLES) } };
      case 7:
        return { op: "changeType", itemId: message(diagram), to: { kind: "style", style: pick(MESSAGE_STYLES) } };
      case 8:
        return { op: "moveEnd", linkId: message(diagram), end: next() < 0.5 ? "from" : "to", targetId: participant(diagram) };
      default:
        return { op: "reverse", linkId: message(diagram) };
    }
  };
}

describe("every accepted sequence operation leaves a diagram that checkDiagram accepts", () => {
  it.each(Array.from({ length: 25 }, (_, seed) => seed + 1))("with seed %i", (seed) => {
    const next = random(seed);
    const operation = sequenceGenerator(next);
    let history: History = createHistory(newDiagram("d", "sequence"));
    let accepted = 0;

    for (let step = 0; step < 300; step += 1) {
      const roll = next();
      const before = history;
      if (roll < 0.06) history = undo(history);
      else if (roll < 0.1) history = redo(history);
      else {
        history = commit(history, operation(history.present as SequenceDiagram)).history;
        if (history !== before) accepted += 1;
      }
      const checked = checkDiagram(history.present);
      expect(checked, `seed ${String(seed)}, step ${String(step)}: ${JSON.stringify(history.present.content)}`).toMatchObject({ ok: true });
    }
    expect(accepted).toBeGreaterThan(20);
  });
});

const ELEMENT_TYPES: readonly ElementType[] = ["person", "system", "system-db", "system-queue", "container", "container-db", "container-queue", "component", "component-db", "component-queue"].flatMap(
  (base) => [base as ElementType, `${base}-ext` as ElementType],
);
const CONTAINERS: readonly (BoundaryType | "deployment-node")[] = ["enterprise", "system", "container", "generic", "deployment-node"];
const FIELDS = ["label", "description", "technology", "text"] as const;

function c4Generator(next: () => number, kind: C4Kind) {
  const pick = <T>(items: readonly T[]): T => items.at(Math.floor(next() * items.length)) as T;
  const ids = (diagram: C4Diagram) => [...walkItems(diagram.content.tree).map((item) => item.id), ...diagram.content.relationships.map((relationship) => relationship.id)];
  const anyId = (diagram: C4Diagram) => (next() < 0.85 && ids(diagram).length > 0 ? pick(ids(diagram)) : Math.floor(next() * 40));
  const treeId = (diagram: C4Diagram) => {
    const items = walkItems(diagram.content.tree);
    return next() < 0.85 && items.length > 0 ? pick(items).id : Math.floor(next() * 40);
  };
  const relationshipId = (diagram: C4Diagram) => (next() < 0.85 && diagram.content.relationships.length > 0 ? pick(diagram.content.relationships).id : Math.floor(next() * 40));
  // Mostly what the kind offers, sometimes anything, so that both acceptance and refusal are exercised.
  const elementType = () => pick(next() < 0.8 ? ELEMENT_TYPES_BY_KIND[kind] : ELEMENT_TYPES);
  const offeredContainers: readonly (BoundaryType | "deployment-node")[] = kind === "deployment" ? ["deployment-node"] : BOUNDARY_TYPES_BY_KIND[kind];
  const container = () => pick(next() < 0.8 ? offeredContainers : CONTAINERS);
  const index = () => (next() < 0.7 ? Math.floor(next() * 6) : pick([-1, 100, 1.5, NaN]));
  const direction = () => (next() < 0.5 ? "one-way" : "two-way");
  const withParent = (diagram: C4Diagram) => (next() < 0.4 ? {} : { parentId: treeId(diagram) });
  const withIndex = () => (next() < 0.3 ? { index: index() } : {});

  const builders: readonly ((diagram: C4Diagram) => Operation)[] = [
    (diagram) => ({ op: "addElement", elementType: elementType(), ...withParent(diagram), ...withIndex() }),
    (diagram) => ({ op: "addElement", elementType: elementType(), ...withParent(diagram) }),
    (diagram) => ({ op: "addContainer", container: container(), ...withParent(diagram) }),
    (diagram) => ({ op: "addRelationship", from: treeId(diagram), to: treeId(diagram), direction: direction() }),
    (diagram) => ({ op: "addRelationship", from: treeId(diagram), to: treeId(diagram), direction: direction() }),
    (diagram) => ({ op: "setLabel", itemId: anyId(diagram), field: pick(FIELDS), text: pick(TEXTS) }),
    () => ({ op: "setTitle", text: pick(TEXTS) }),
    (diagram) => ({ op: "deleteItem", itemId: anyId(diagram) }),
    (diagram) => ({ op: "changeType", itemId: treeId(diagram), to: { kind: "elementType", elementType: elementType() } }),
    (diagram) => ({ op: "changeType", itemId: relationshipId(diagram), to: { kind: "direction", direction: direction() } }),
    (diagram) => ({ op: "moveEnd", linkId: relationshipId(diagram), end: next() < 0.5 ? "from" : "to", targetId: treeId(diagram) }),
    (diagram) => ({ op: "reverse", linkId: relationshipId(diagram) }),
    (diagram) => ({ op: "moveToParent", itemId: treeId(diagram), parentId: next() < 0.3 ? null : treeId(diagram), ...withIndex() }),
    (diagram) => ({ op: "reorder", itemId: relationshipId(diagram), toIndex: index() }),
  ];

  return (diagram: C4Diagram): Operation => {
    const build = pick(builders);
    return build(diagram);
  };
}

describe.each(C4_KINDS)("every accepted %s operation leaves a diagram that checkDiagram accepts", (kind) => {
  it.each(Array.from({ length: 25 }, (_, seed) => seed + 1))("with seed %i", (seed) => {
    const next = random(seed);
    const operation = c4Generator(next, kind);
    let history: History = createHistory(newDiagram("d", "c4", kind));
    let accepted = 0;

    for (let step = 0; step < 300; step += 1) {
      const roll = next();
      const before = history;
      if (roll < 0.06) history = undo(history);
      else if (roll < 0.1) history = redo(history);
      else {
        history = commit(history, operation(history.present as C4Diagram)).history;
        if (history !== before) accepted += 1;
      }
      const checked = checkDiagram(history.present);
      expect(checked, `seed ${String(seed)}, step ${String(step)}: ${JSON.stringify(history.present.content)}`).toMatchObject({ ok: true });
    }
    expect(accepted).toBeGreaterThan(20);
  });
});
