import { BOUNDARY_TYPES_BY_KIND, C4_KINDS, ELEMENT_TYPES_BY_KIND, hasTechnology } from "../model/c4/catalogue";
import { CONNECTION_TYPES, FLOWCHART_SHAPES } from "../model/flowchart/catalogue";
import { MAX_X, MAX_Y, NODE_HEIGHT, NODE_WIDTH } from "../model/flowchart/freePosition";
import { MESSAGE_STYLES, PARTICIPANT_ROLES } from "../model/sequence/catalogue";
import type {
  BoundaryType,
  C4Content,
  C4Item,
  C4Kind,
  Connection,
  Direction,
  DiagramModel,
  ElementType,
  Ending,
  FlowchartShape,
  LineStyle,
  Message,
  MessageStyle,
  Node,
  Participant,
  ParticipantRole,
  Relationship,
} from "../model/types";
import { en } from "../text/en";
import { fill } from "../text/fill";
import { isVisible } from "./label";

/** The whole model checked and copied, or the first problem found, in words for the person who opened the file. */
export type DiagramCheck = { readonly ok: true; readonly model: DiagramModel } | { readonly ok: false; readonly problem: string };

type Obj = Readonly<Record<string, unknown>>;

class Invalid extends Error {}

const MAX_DEPTH = 50;

const isObj = (value: unknown): value is Obj => typeof value === "object" && value !== null && !Array.isArray(value);
const fail = (problem: string): never => {
  throw new Invalid(problem);
};
/** A property of a parsed object, ignoring anything inherited. */
const get = (object: Obj, key: string): unknown => (Object.hasOwn(object, key) ? Reflect.get(object, key) : undefined);
const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  allowed.find((candidate) => candidate === value);

type ItemKind = keyof typeof en.problems.items;
const describe = (kind: ItemKind, id: number): string => fill(en.problems.items[kind], { id: String(id) });

/** Ids must be positive safe integers, unique in the diagram and below the counter. */
class Ids {
  private readonly seen = new Set<number>();
  constructor(private readonly nextId: number) {}

  claim(raw: unknown, kind: ItemKind): number {
    const label = typeof raw === "number" ? describe(kind, raw) : en.problems.items[kind].replace(" {id}", "");
    if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < 1) return fail(fill(en.problems.badId, { item: label }));
    if (this.seen.has(raw)) return fail(fill(en.problems.duplicateId, { item: label }));
    if (raw >= this.nextId) return fail(fill(en.problems.idTooHigh, { item: label }));
    this.seen.add(raw);
    return raw;
  }
}

function listOf(content: Obj, key: string): readonly unknown[] {
  const value = get(content, key);
  return Array.isArray(value) ? (value as unknown[]) : fail(en.problems.badContent);
}

function visibleLabel(item: Obj, key: string, kind: ItemKind, id: number): string {
  const value = get(item, key);
  if (typeof value === "string" && isVisible(value)) return value;
  const sentence = kind === "message" ? en.problems.needsText : en.problems.needsLabel;
  return fail(fill(sentence, { item: describe(kind, id) }));
}

function optionalText(item: Obj, key: string, kind: ItemKind, id: number): string {
  const value = get(item, key);
  if (value === undefined) return "";
  return typeof value === "string" ? value : fail(fill(en.problems.notText, { item: describe(kind, id), field: key }));
}

function choice<T extends string>(item: Obj, key: string, allowed: readonly T[], kind: ItemKind, id: number, field = key): T {
  return oneOf(get(item, key), allowed) ?? fail(fill(en.problems.notOffered, { item: describe(kind, id), field }));
}

function endOf(item: Obj, key: string, valid: ReadonlySet<number>, kind: ItemKind, id: number, target: keyof typeof en.problems.targets): number {
  const value = get(item, key);
  if (typeof value === "number" && valid.has(value)) return value;
  return fail(fill(en.problems.dangling, { item: describe(kind, id), target: en.problems.targets[target] }));
}

function entries(value: unknown, kind: ItemKind): Obj {
  return isObj(value) ? value : fail(fill(en.problems.badContent, { item: kind }));
}

// Flowchart

function checkNodes(raw: readonly unknown[], ids: Ids): Node[] {
  const shapes = FLOWCHART_SHAPES.map((entry): FlowchartShape => entry.shape);
  const nodes = raw.map((entry): Node => {
    const item = entries(entry, "node");
    const id = ids.claim(get(item, "id"), "node");
    const shape = choice(item, "shape", shapes, "node", id);
    const label = visibleLabel(item, "label", "node", id);
    const x = get(item, "x");
    const y = get(item, "y");
    const inside = (v: unknown, limit: number): v is number => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= limit;
    if (!inside(x, MAX_X) || !inside(y, MAX_Y)) return fail(fill(en.problems.outOfBounds, { item: describe("node", id) }));
    return { id, shape, label, x, y };
  });
  checkNoOverlap(nodes);
  return nodes;
}

/** Footprints are bucketed by cell so that a file with many nodes is checked in near-linear time. */
function checkNoOverlap(nodes: readonly Node[]): void {
  const cells = new Map<string, Node[]>();
  const cellOf = (node: Node) => [Math.floor(node.x / NODE_WIDTH), Math.floor(node.y / NODE_HEIGHT)] as const;
  for (const node of nodes) {
    const [cx, cy] = cellOf(node);
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const near = cells.get(`${String(cx + dx)},${String(cy + dy)}`) ?? [];
        const hit = near.find((other) => Math.abs(other.x - node.x) < NODE_WIDTH && Math.abs(other.y - node.y) < NODE_HEIGHT);
        if (hit) fail(fill(en.problems.overlaps, { item: describe("node", node.id), other: describe("node", hit.id) }));
      }
    }
    const key = `${String(cx)},${String(cy)}`;
    cells.set(key, [...(cells.get(key) ?? []), node]);
  }
}

function checkConnections(raw: readonly unknown[], ids: Ids, nodeIds: ReadonlySet<number>): Connection[] {
  const lines = [...new Set(CONNECTION_TYPES.map((entry): LineStyle => entry.line))];
  const endings = [...new Set(CONNECTION_TYPES.map((entry): Ending => entry.ending))];
  return raw.map((entry): Connection => {
    const item = entries(entry, "connection");
    const id = ids.claim(get(item, "id"), "connection");
    return {
      id,
      from: endOf(item, "from", nodeIds, "connection", id, "node"),
      to: endOf(item, "to", nodeIds, "connection", id, "node"),
      line: choice(item, "line", lines, "connection", id),
      ending: choice(item, "ending", endings, "connection", id),
      label: optionalText(item, "label", "connection", id),
    };
  });
}

// Sequence

function checkParticipants(raw: readonly unknown[], ids: Ids): Participant[] {
  return raw.map((entry): Participant => {
    const item = entries(entry, "participant");
    const id = ids.claim(get(item, "id"), "participant");
    const role: ParticipantRole = choice(item, "role", PARTICIPANT_ROLES, "participant", id);
    return { id, role, label: visibleLabel(item, "label", "participant", id) };
  });
}

function checkMessages(raw: readonly unknown[], ids: Ids, participantIds: ReadonlySet<number>): Message[] {
  return raw.map((entry): Message => {
    const item = entries(entry, "message");
    const id = ids.claim(get(item, "id"), "message");
    const style: MessageStyle = choice(item, "style", MESSAGE_STYLES, "message", id);
    return {
      id,
      from: endOf(item, "from", participantIds, "message", id, "participant"),
      to: endOf(item, "to", participantIds, "message", id, "participant"),
      style,
      text: visibleLabel(item, "text", "message", id),
    };
  });
}

// C4

interface TreeContext {
  readonly kind: C4Kind;
  readonly ids: Ids;
  /** Ends a relationship may have: elements and, in Deployment, deployment nodes. */
  readonly ends: Set<number>;
}

function checkElement(item: Obj, id: number, context: TreeContext): C4Item {
  const elementType: ElementType = choice(item, "elementType", ELEMENT_TYPES_BY_KIND[context.kind], "element", id, "type");
  const technology = optionalText(item, "technology", "element", id);
  if (technology !== "" && !hasTechnology(elementType)) {
    return fail(fill(en.problems.notOffered, { item: describe("element", id), field: "technology" }));
  }
  context.ends.add(id);
  return {
    item: "element",
    id,
    elementType,
    label: visibleLabel(item, "label", "element", id),
    description: optionalText(item, "description", "element", id),
    technology,
  };
}

function checkTreeItem(entry: unknown, context: TreeContext, depth: number): C4Item {
  if (depth > MAX_DEPTH) return fail(en.problems.tooDeep);
  const item = entries(entry, "element");
  const type = get(item, "item");
  if (type === "element") return checkElement(item, context.ids.claim(get(item, "id"), "element"), context);
  const deployment = context.kind === "deployment";
  if (type === "boundary") {
    const id = context.ids.claim(get(item, "id"), "boundary");
    if (deployment) return fail(fill(en.problems.notAllowedHere, { item: describe("boundary", id), kind: context.kind }));
    const boundaryType: BoundaryType = choice(item, "boundaryType", BOUNDARY_TYPES_BY_KIND[context.kind], "boundary", id, "type");
    const label = visibleLabel(item, "label", "boundary", id);
    return { item: "boundary", id, boundaryType, label, children: checkChildren(item, context, depth, "boundary", id) };
  }
  if (type === "deployment-node") {
    const id = context.ids.claim(get(item, "id"), "deploymentNode");
    if (!deployment) return fail(fill(en.problems.notAllowedHere, { item: describe("deploymentNode", id), kind: context.kind }));
    context.ends.add(id);
    return {
      item: "deployment-node",
      id,
      label: visibleLabel(item, "label", "deploymentNode", id),
      description: optionalText(item, "description", "deploymentNode", id),
      technology: optionalText(item, "technology", "deploymentNode", id),
      children: checkChildren(item, context, depth, "deploymentNode", id),
    };
  }
  return fail(en.problems.badContent);
}

function checkChildren(item: Obj, context: TreeContext, depth: number, kind: ItemKind, id: number): C4Item[] {
  const children = get(item, "children");
  if (!Array.isArray(children)) return fail(fill(en.problems.misplaced, { item: describe(kind, id), kind: context.kind }));
  return (children as unknown[]).map((child) => checkTreeItem(child, context, depth + 1));
}

function checkRelationships(raw: readonly unknown[], ids: Ids, ends: ReadonlySet<number>, boundaryIds: ReadonlySet<number>): Relationship[] {
  return raw.map((entry): Relationship => {
    const item = entries(entry, "relationship");
    const id = ids.claim(get(item, "id"), "relationship");
    const direction: Direction = choice(item, "direction", ["one-way", "two-way"], "relationship", id);
    for (const key of ["from", "to"]) {
      const value = get(item, key);
      if (typeof value === "number" && boundaryIds.has(value)) fail(fill(en.problems.badEnd, { item: describe("relationship", id) }));
    }
    return {
      id,
      from: endOf(item, "from", ends, "relationship", id, "element"),
      to: endOf(item, "to", ends, "relationship", id, "element"),
      direction,
      label: visibleLabel(item, "label", "relationship", id),
      technology: optionalText(item, "technology", "relationship", id),
    };
  });
}

function collectBoundaryIds(items: readonly C4Item[], into = new Set<number>()): Set<number> {
  for (const item of items) {
    if (item.item === "boundary") into.add(item.id);
    if (item.item !== "element") collectBoundaryIds(item.children, into);
  }
  return into;
}

function checkC4Content(content: Obj, kind: C4Kind, ids: Ids): C4Content {
  const context: TreeContext = { kind, ids, ends: new Set() };
  const tree = listOf(content, "tree").map((entry) => checkTreeItem(entry, context, 1));
  const relationships = checkRelationships(listOf(content, "relationships"), ids, context.ends, collectBoundaryIds(tree));
  return { tree, relationships };
}

// Whole diagram

function checkFlowchartModel(content: Obj, ids: Ids): { nodes: Node[]; connections: Connection[] } {
  if (get(content, "nodes") === undefined || get(content, "connections") === undefined) return fail(en.problems.badContent);
  const nodes = checkNodes(listOf(content, "nodes"), ids);
  const connections = checkConnections(listOf(content, "connections"), ids, new Set(nodes.map((node) => node.id)));
  return { nodes, connections };
}

function checkSequenceModel(content: Obj, ids: Ids): { participants: Participant[]; messages: Message[] } {
  if (get(content, "participants") === undefined || get(content, "messages") === undefined) return fail(en.problems.badContent);
  const participants = checkParticipants(listOf(content, "participants"), ids);
  const messages = checkMessages(listOf(content, "messages"), ids, new Set(participants.map((participant) => participant.id)));
  return { participants, messages };
}

function checkModel(input: unknown): DiagramModel {
  if (!isObj(input)) return fail(en.problems.notObject);
  const name = get(input, "name");
  if (typeof name !== "string" || !isVisible(name)) return fail(en.problems.badName);
  const nextId = get(input, "nextId");
  if (typeof nextId !== "number" || !Number.isSafeInteger(nextId) || nextId < 1) return fail(en.problems.badNextId);
  const type = oneOf(get(input, "type"), ["flowchart", "sequence", "c4"] as const);
  if (type === undefined) return fail(en.problems.badType);
  const content = get(input, "content");
  if (!isObj(content)) return fail(en.problems.badContent);
  const ids = new Ids(nextId);
  const title = get(input, "title");

  if (type === "c4") {
    const kind = oneOf(get(input, "kind"), C4_KINDS);
    if (kind === undefined) return fail(en.problems.badKind);
    if (title !== undefined && typeof title !== "string") return fail(en.problems.badContent);
    return { name, type, kind, title: title ?? "", nextId, content: checkC4Content(content, kind, ids) };
  }
  if (get(input, "kind") !== undefined) return fail(en.problems.badKind);
  if (title !== undefined && title !== "") return fail(en.problems.badTitle);
  if (type === "flowchart") return { name, type, nextId, content: checkFlowchartModel(content, ids) };
  return { name, type, nextId, content: checkSequenceModel(content, ids) };
}

/**
 * Checks every invariant of data-model.md on untrusted data and builds a fresh model by copying only the
 * whitelisted fields of each entity, so unknown properties never reach the model, records or later files (DC-06).
 */
export function checkDiagram(input: unknown): DiagramCheck {
  try {
    return { ok: true, model: checkModel(input) };
  } catch (error) {
    if (error instanceof Invalid) return { ok: false, problem: error.message };
    throw error;
  }
}
