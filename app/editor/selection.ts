import { CONNECTION_TYPES, FLOWCHART_SHAPES, shapeName } from "../model/flowchart/catalogue";
import { BOUNDARY_NAMES, DEPLOYMENT_NODE_NAME, DIRECTIONS, hasTechnology, DIRECTION_NAMES, ELEMENT_TYPES_BY_KIND, ELEMENT_TYPE_NAMES, familyOf } from "../model/c4/catalogue";
import { findItem, isContainer, parentOf, walkItems } from "../model/c4/tree";
import { MESSAGE_STYLE_NAMES, PARTICIPANT_ROLES, ROLE_NAMES } from "../model/sequence/catalogue";
import type { C4Diagram, Diagram, FlowchartDiagram, SequenceDiagram } from "../model/types";
import type { ActionOffer, Ends, ExtraField, SelectionKind, TypeOption } from "../rendering/shared/PropertiesPanel";
import type { MoveToOption } from "../rendering/shared/MoveToDialog";
import { targetList, type Target } from "../model/targets";
import { en } from "../text/en";
import { check } from "../validation/check";
import { rejectionMessage } from "../validation/messages";
import { fill } from "../text/fill";

/** What the Properties panel and the target dialogs need to know about the selected item of a diagram. */
export interface SelectionView {
  readonly kind: SelectionKind | null;
  /** The selected item's type as the panel names it (FR-013), or undefined when nothing is selected. */
  readonly typeName: string | undefined;
  /** The actions that apply to the selection, in the order the panel shows them; none when nothing is selected. */
  readonly actions: readonly ActionOffer[];
  /** The ends of a selected connection, message or relationship. */
  readonly ends?: Ends | undefined;
  /** The selected item's label or message text, or undefined when nothing is selected. */
  readonly label: string | undefined;
  /** The types the selected item may change to (its family). */
  readonly typeOptions: readonly TypeOption[];
  /** The items a connection or message may be attached to. */
  readonly targets: readonly Target[];
}

type Base = Omit<SelectionView, "actions">;

/** "From A to B", "Both ways between A and B" or "No direction", for the panel's Direction line. */
function directionOf(from: string, to: string, way: "one" | "both" | "none"): string {
  if (way === "none") return en.properties.directions.none;
  return fill(way === "one" ? en.properties.directions.oneWay : en.properties.directions.bothWays, { from, to });
}

/** The panel's view of a link's two ends: the target names, which tell equal labels apart, and its direction. */
function endsOf(targets: readonly Target[], link: { readonly from: number; readonly to: number }, labelOf: (id: number) => string, way: "one" | "both" | "none"): Ends {
  const nameOf = (id: number) => targets.find((target) => target.id === id)?.name ?? labelOf(id);
  return { from: nameOf(link.from), to: nameOf(link.to), direction: directionOf(labelOf(link.from), labelOf(link.to), way) };
}

const WAYS = new Map<string, "one" | "both">([["arrow", "one"], ["both", "both"]]);

function describeFlowchart(diagram: FlowchartDiagram, selection: number | null): Base {
  const { nodes, connections } = diagram.content;
  const node = nodes.find((candidate) => candidate.id === selection);
  const connection = connections.find((candidate) => candidate.id === selection);
  const typeOptions: TypeOption[] = node
    ? FLOWCHART_SHAPES.map((entry) => ({ name: entry.name, change: { kind: "shape", shape: entry.shape } }))
    : CONNECTION_TYPES.map((entry) => ({ name: entry.name, change: { kind: "connection", line: entry.line, ending: entry.ending } }));
  const targets = targetList(diagram);
  const labelOf = (id: number) => nodes.find((candidate) => candidate.id === id)?.label ?? "";
  if (node) return { kind: "node", label: node.label, typeOptions, targets, typeName: fill(en.properties.typeNames.node, { type: shapeName(node.shape) ?? node.shape }) };
  if (connection) {
    const type = CONNECTION_TYPES.find((entry) => entry.line === connection.line && entry.ending === connection.ending)?.name ?? connection.line;
    const way = WAYS.get(connection.ending) ?? "none";
    return { kind: "connection", label: connection.label, typeOptions, targets, typeName: fill(en.properties.typeNames.connection, { type }), ends: endsOf(targets, connection, labelOf, way) };
  }
  return { kind: null, label: undefined, typeOptions, targets, typeName: undefined };
}

function describeSequence(diagram: SequenceDiagram, selection: number | null): Base {
  const { participants, messages } = diagram.content;
  const participant = participants.find((candidate) => candidate.id === selection);
  const message = messages.find((candidate) => candidate.id === selection);
  const typeOptions: TypeOption[] = participant
    ? PARTICIPANT_ROLES.map((role) => ({ name: ROLE_NAMES.get(role) ?? role, change: { kind: "role", role } }))
    : [...MESSAGE_STYLE_NAMES].map(([style, name]) => ({ name, change: { kind: "style", style } }));
  const targets = targetList(diagram);
  const labelOf = (id: number) => participants.find((candidate) => candidate.id === id)?.label ?? "";
  if (participant) return { kind: "participant", label: participant.label, typeOptions, targets, typeName: ROLE_NAMES.get(participant.role) ?? participant.role };
  if (message) {
    const typeName = fill(en.properties.typeNames.message, { type: MESSAGE_STYLE_NAMES.get(message.style) ?? message.style });
    return { kind: "message", label: message.text, typeOptions, targets, typeName, ends: endsOf(targets, message, labelOf, "one") };
  }
  return { kind: null, label: undefined, typeOptions, targets, typeName: undefined };
}

function describeC4(diagram: C4Diagram, selection: number | null): Base {
  const { tree, relationships } = diagram.content;
  const item = selection === null ? undefined : findItem(tree, selection);
  const relationship = relationships.find((candidate) => candidate.id === selection);
  const targets = targetList(diagram);
  if (item?.item === "element") {
    const family = familyOf(item.elementType);
    const typeOptions: TypeOption[] = ELEMENT_TYPES_BY_KIND[diagram.kind]
      .filter((type) => familyOf(type) === family)
      .map((type) => ({ name: ELEMENT_TYPE_NAMES.get(type) ?? type, change: { kind: "elementType", elementType: type } }));
    return { kind: "node", label: item.label, typeOptions, targets, typeName: ELEMENT_TYPE_NAMES.get(item.elementType) ?? item.elementType };
  }
  if (item?.item === "boundary") return { kind: "boundary", label: item.label, typeOptions: [], targets, typeName: BOUNDARY_NAMES.get(item.boundaryType) ?? item.boundaryType };
  if (item) return { kind: "node", label: item.label, typeOptions: [], targets, typeName: DEPLOYMENT_NODE_NAME };
  if (relationship) {
    const typeOptions: TypeOption[] = DIRECTIONS.map((direction) => ({ name: DIRECTION_NAMES.get(direction) ?? direction, change: { kind: "direction", direction } }));
    const labelOf = (id: number) => findItem(tree, id)?.label ?? "";
    const ends = endsOf(targets, relationship, labelOf, relationship.direction === "one-way" ? "one" : "both");
    return { kind: "connection", label: relationship.label, typeOptions, targets, typeName: DIRECTION_NAMES.get(relationship.direction) ?? relationship.direction, ends };
  }
  return { kind: null, label: undefined, typeOptions: [], targets, typeName: undefined };
}

/** Where the selection would go one step earlier or later in its order, for the types that have one; null when it has none. */
function stepOf(diagram: Diagram, itemId: number, direction: "up" | "down"): number | undefined | null {
  if (diagram.type === "sequence") return steppedIndex(diagram, itemId, direction);
  if (diagram.type === "c4" && diagram.kind === "dynamic" && diagram.content.relationships.some((entry) => entry.id === itemId)) return steppedRelationshipIndex(diagram, itemId, direction);
  return null;
}

/** The actions that apply to the selection, each with the reason it cannot be used now when it cannot (FR-014, FR-016). */
function offersFor(diagram: Diagram, view: Base, selection: number | null): ActionOffer[] {
  const { kind } = view;
  if (kind === null || selection === null) return [];
  const offers: ActionOffer[] = [{ action: "rename" }];
  if (view.typeOptions.length > 0) offers.push({ action: "changeType" });
  if (kind === "node" || kind === "participant") offers.push({ action: "connect" });
  if (view.ends) {
    const refused = check(diagram, { op: "reverse", linkId: selection });
    offers.push({ action: "changeEndpoints" }, { action: "reverse", unavailable: refused && rejectionMessage(refused) });
  }
  if (diagram.type === "c4" && (kind === "node" || kind === "boundary")) offers.push({ action: "moveTo" });
  const up = stepOf(diagram, selection, "up");
  if (up !== null) {
    offers.push(
      { action: "moveUp", unavailable: up === undefined ? en.properties.alreadyFirst : undefined },
      { action: "moveDown", unavailable: stepOf(diagram, selection, "down") === undefined ? en.properties.alreadyLast : undefined },
    );
  }
  offers.push({ action: "delete" });
  return offers;
}

function describeBase(diagram: Diagram, selection: number | null): Base {
  if (diagram.type === "flowchart") return describeFlowchart(diagram, selection);
  if (diagram.type === "sequence") return describeSequence(diagram, selection);
  return describeC4(diagram, selection);
}

export function describeSelection(diagram: Diagram, selection: number | null): SelectionView {
  const view = describeBase(diagram, selection);
  return { ...view, actions: offersFor(diagram, view, selection) };
}

/** The field a label edit replaces: a message's `text`, and the `label` of everything else. */
export function labelFieldOf(diagram: Diagram, itemId: number): "label" | "text" {
  return diagram.type === "sequence" && diagram.content.messages.some((message) => message.id === itemId) ? "text" : "label";
}

/** Where a new participant goes: right after the selected participant, or at the right-hand end. */
export function participantInsertIndex(diagram: SequenceDiagram, selection: number | null): number | undefined {
  const index = diagram.content.participants.findIndex((participant) => participant.id === selection);
  return index === -1 ? undefined : index + 1;
}

/** Where a new message goes: right after the selected message, or at the bottom. */
export function messageInsertIndex(diagram: SequenceDiagram, selection: number | null): number | undefined {
  const index = diagram.content.messages.findIndex((message) => message.id === selection);
  return index === -1 ? undefined : index + 1;
}

/** The position a participant or message would take one step earlier or later, or undefined at the end of its order. */
export function steppedIndex(diagram: SequenceDiagram, itemId: number, direction: "up" | "down"): number | undefined {
  const { participants, messages } = diagram.content;
  const inParticipants = participants.some((participant) => participant.id === itemId);
  const list = inParticipants ? participants : messages;
  const index = list.findIndex((item) => item.id === itemId);
  const next = direction === "up" ? index - 1 : index + 1;
  return index === -1 || next < 0 || next >= list.length ? undefined : next;
}

/** The participant a new message starts from and goes to: the selected one, or the only one there is. */
export function defaultEnd(diagram: SequenceDiagram, selection: number | null): number | undefined {
  const { participants } = diagram.content;
  if (participants.some((participant) => participant.id === selection)) return selection ?? undefined;
  return participants.length === 1 ? participants[0]?.id : undefined;
}

/** What the Properties panel says while nothing is selected in this type of diagram. */
export function nothingSelected(diagram: Diagram): string {
  if (diagram.type === "sequence") return en.properties.sequenceNothingSelected;
  if (diagram.type === "c4") return en.properties.c4NothingSelected;
  return en.properties.nothingSelected;
}

/** The fields besides the label that the selected item has: a C4 element's description and, for types with one, technology. */
export function extraFieldsOf(diagram: Diagram, selection: number | null): readonly ExtraField[] {
  if (diagram.type !== "c4" || selection === null) return [];
  const item = findItem(diagram.content.tree, selection);
  if (item === undefined || item.item === "boundary") return [];
  const fields: ExtraField[] = [{ field: "description", name: en.properties.description, value: item.description }];
  if (item.item === "deployment-node" || hasTechnology(item.elementType)) fields.push({ field: "technology", name: en.properties.technology, value: item.technology });
  return fields;
}

/** The position a Dynamic relationship would take one step earlier or later, or undefined at the end of the order. */
export function steppedRelationshipIndex(diagram: C4Diagram, itemId: number, direction: "up" | "down"): number | undefined {
  const { relationships } = diagram.content;
  const index = relationships.findIndex((relationship) => relationship.id === itemId);
  const next = direction === "up" ? index - 1 : index + 1;
  return index === -1 || next < 0 || next >= relationships.length ? undefined : next;
}

/** Where the selected element, boundary or node may be moved to: the top level and every boundary or node but its own, its contents and where it already is. */
export function moveToOptions(diagram: C4Diagram, itemId: number): readonly MoveToOption[] {
  const { tree } = diagram.content;
  const item = findItem(tree, itemId);
  if (item === undefined) return [];
  const parent = parentOf(tree, itemId);
  const inside = new Set(walkItems([item]).map((own) => own.id));
  const places = walkItems(tree)
    .filter((candidate) => isContainer(candidate) && !inside.has(candidate.id) && candidate.id !== parent?.id)
    .map((candidate) => ({
      id: candidate.id,
      name: fill(en.properties.target, { label: candidate.label, type: candidate.item === "boundary" ? (BOUNDARY_NAMES.get(candidate.boundaryType) ?? candidate.boundaryType) : DEPLOYMENT_NODE_NAME, n: String(candidate.id) }),
    }));
  return parent === undefined ? places : [{ id: null, name: en.moveTo.topLevel }, ...places];
}
