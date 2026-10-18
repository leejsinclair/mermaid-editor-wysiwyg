import { CONNECTION_TYPES, FLOWCHART_SHAPES, shapeName } from "../model/flowchart/catalogue";
import { BOUNDARY_NAMES, DEPLOYMENT_NODE_NAME, DIRECTIONS, hasTechnology, DIRECTION_NAMES, ELEMENT_TYPES_BY_KIND, ELEMENT_TYPE_NAMES, familyOf } from "../model/c4/catalogue";
import { findItem, isContainer, parentOf, walkItems } from "../model/c4/tree";
import { MESSAGE_STYLE_NAMES, PARTICIPANT_ROLES, ROLE_NAMES } from "../model/sequence/catalogue";
import type { C4Diagram, Diagram, FlowchartDiagram, SequenceDiagram } from "../model/types";
import type { ExtraField, SelectionKind, TypeOption } from "../rendering/shared/PropertiesPanel";
import type { MoveToOption } from "../rendering/shared/MoveToDialog";
import type { Target } from "../rendering/shared/TargetDialog";
import { en } from "../text/en";
import { fill } from "../text/fill";

/** What the Properties panel and the target dialogs need to know about the selected item of a diagram. */
export interface SelectionView {
  readonly kind: SelectionKind | null;
  /** The selected item's label or message text, or undefined when nothing is selected. */
  readonly label: string | undefined;
  /** The types the selected item may change to (its family). */
  readonly typeOptions: readonly TypeOption[];
  /** The items a connection or message may be attached to. */
  readonly targets: readonly Target[];
}

function describeFlowchart(diagram: FlowchartDiagram, selection: number | null): SelectionView {
  const node = diagram.content.nodes.find((candidate) => candidate.id === selection);
  const connection = diagram.content.connections.find((candidate) => candidate.id === selection);
  const typeOptions: TypeOption[] = node
    ? FLOWCHART_SHAPES.map((entry) => ({ name: entry.name, change: { kind: "shape", shape: entry.shape } }))
    : CONNECTION_TYPES.map((entry) => ({ name: entry.name, change: { kind: "connection", line: entry.line, ending: entry.ending } }));
  let kind: SelectionKind | null = null;
  if (node) kind = "node";
  else if (connection) kind = "connection";
  return {
    kind,
    label: (node ?? connection)?.label,
    typeOptions,
    targets: diagram.content.nodes.map((candidate) => ({
      id: candidate.id,
      name: fill(en.properties.target, { label: candidate.label, type: shapeName(candidate.shape) ?? candidate.shape, n: String(candidate.id) }),
    })),
  };
}

function describeSequence(diagram: SequenceDiagram, selection: number | null): SelectionView {
  const participant = diagram.content.participants.find((candidate) => candidate.id === selection);
  const message = diagram.content.messages.find((candidate) => candidate.id === selection);
  const typeOptions: TypeOption[] = participant
    ? PARTICIPANT_ROLES.map((role) => ({ name: ROLE_NAMES.get(role) ?? role, change: { kind: "role", role } }))
    : [...MESSAGE_STYLE_NAMES].map(([style, name]) => ({ name, change: { kind: "style", style } }));
  let kind: SelectionKind | null = null;
  if (participant) kind = "participant";
  else if (message) kind = "message";
  return {
    kind,
    label: participant?.label ?? message?.text,
    typeOptions,
    targets: diagram.content.participants.map((candidate) => ({
      id: candidate.id,
      name: fill(en.properties.target, { label: candidate.label, type: ROLE_NAMES.get(candidate.role) ?? candidate.role, n: String(candidate.id) }),
    })),
  };
}

function describeC4(diagram: C4Diagram, selection: number | null): SelectionView {
  const { tree, relationships } = diagram.content;
  const item = selection === null ? undefined : findItem(tree, selection);
  const relationship = relationships.find((candidate) => candidate.id === selection);
  let typeOptions: TypeOption[] = [];
  if (item?.item === "element") {
    const family = familyOf(item.elementType);
    typeOptions = ELEMENT_TYPES_BY_KIND[diagram.kind]
      .filter((type) => familyOf(type) === family)
      .map((type) => ({ name: ELEMENT_TYPE_NAMES.get(type) ?? type, change: { kind: "elementType", elementType: type } }));
  } else if (relationship) {
    typeOptions = DIRECTIONS.map((direction) => ({ name: DIRECTION_NAMES.get(direction) ?? direction, change: { kind: "direction", direction } }));
  }
  let kind: SelectionKind | null = null;
  if (item?.item === "boundary") kind = "boundary";
  else if (item) kind = "node";
  else if (relationship) kind = "connection";
  return {
    kind,
    label: (item ?? relationship)?.label,
    typeOptions,
    targets: walkItems(tree)
      .filter((candidate) => candidate.item !== "boundary")
      .map((candidate) => ({
        id: candidate.id,
        name: fill(en.properties.target, { label: candidate.label, type: candidate.item === "element" ? (ELEMENT_TYPE_NAMES.get(candidate.elementType) ?? candidate.elementType) : "Deployment node", n: String(candidate.id) }),
      })),
  };
}


export function describeSelection(diagram: Diagram, selection: number | null): SelectionView {
  if (diagram.type === "flowchart") return describeFlowchart(diagram, selection);
  if (diagram.type === "sequence") return describeSequence(diagram, selection);
  return describeC4(diagram, selection);
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

const THINGS = new Map<string, string>(Object.entries(en.properties.things));
const SEQUENCE_THINGS = new Map<string, string>(Object.entries(en.properties.sequenceThings));
const C4_THINGS = new Map<string, string>(Object.entries(en.properties.c4Things));

/** What the Properties panel calls the things of this type of diagram, and says while nothing is selected. */
export function wording(diagram: Diagram): { readonly things: ReadonlyMap<string, string>; readonly nothingSelected: string } {
  if (diagram.type === "sequence") return { things: SEQUENCE_THINGS, nothingSelected: en.properties.sequenceNothingSelected };
  if (diagram.type === "c4") return { things: C4_THINGS, nothingSelected: en.properties.c4NothingSelected };
  return { things: THINGS, nothingSelected: en.properties.nothingSelected };
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
