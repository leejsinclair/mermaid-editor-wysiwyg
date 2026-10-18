import type { LabelField } from "../operations";
import type { Message, MessageStyle, ParticipantRole, SequenceDiagram } from "../types";
import { ROLE_NAMES } from "./catalogue";

/** Inserts at `index` when it is a position in the list, and at the end otherwise. */
function insertAt<T>(items: readonly T[], item: T, index: number | undefined): readonly T[] {
  const at = index === undefined ? items.length : Math.min(Math.max(index, 0), items.length);
  return [...items.slice(0, at), item, ...items.slice(at)];
}

/** Adds a participant or actor, labelled with its role name, at `index` or at the right-hand end. */
export function addParticipant(diagram: SequenceDiagram, role: ParticipantRole, index?: number): SequenceDiagram {
  const participant = { id: diagram.nextId, role, label: ROLE_NAMES.get(role) ?? role };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, participants: insertAt(diagram.content.participants, participant, index) },
  };
}

/** Adds a message between two participants (possibly the same one) at `index` or after the last message. */
export function addMessage(
  diagram: SequenceDiagram,
  from: number,
  to: number,
  style: MessageStyle,
  text: string,
  index?: number,
): SequenceDiagram {
  const message: Message = { id: diagram.nextId, from, to, style, text };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, messages: insertAt(diagram.content.messages, message, index) },
  };
}

const withMessages = (diagram: SequenceDiagram, messages: readonly Message[]): SequenceDiagram => ({
  ...diagram,
  content: { ...diagram.content, messages },
});

const withParticipants = (diagram: SequenceDiagram, participants: SequenceDiagram["content"]["participants"]): SequenceDiagram => ({
  ...diagram,
  content: { ...diagram.content, participants },
});

/** Replaces a participant's `label` or a message's `text`; the same diagram comes back when nothing changes. */
export function setLabel(diagram: SequenceDiagram, itemId: number, field: LabelField, text: string): SequenceDiagram {
  const { participants, messages } = diagram.content;
  const participant = participants.find((candidate) => candidate.id === itemId);
  if (participant) {
    if (field !== "label" || participant.label === text) return diagram;
    return withParticipants(diagram, participants.map((candidate) => (candidate === participant ? { ...participant, label: text } : candidate)));
  }
  const message = messages.find((candidate) => candidate.id === itemId);
  if (!message || field !== "text" || message.text === text) return diagram;
  return withMessages(diagram, messages.map((candidate) => (candidate === message ? { ...message, text } : candidate)));
}

/** Deletes a participant with every message it sends or receives (self-messages included), or a single message. */
export function deleteItem(diagram: SequenceDiagram, itemId: number): SequenceDiagram {
  const { participants, messages } = diagram.content;
  if (participants.some((participant) => participant.id === itemId)) {
    return {
      ...diagram,
      content: {
        participants: participants.filter((participant) => participant.id !== itemId),
        messages: messages.filter((message) => message.from !== itemId && message.to !== itemId),
      },
    };
  }
  return withMessages(diagram, messages.filter((message) => message.id !== itemId));
}

function moveWithin<T extends { readonly id: number }>(items: readonly T[], itemId: number, toIndex: number): readonly T[] | undefined {
  const from = items.findIndex((item) => item.id === itemId);
  const item = items[from];
  if (item === undefined || from === toIndex) return undefined;
  return insertAt(items.filter((candidate) => candidate !== item), item, toIndex);
}

/** Moves a participant (left to right) or a message (top to bottom) to a position; unchanged when it is already there. */
export function reorder(diagram: SequenceDiagram, itemId: number, toIndex: number): SequenceDiagram {
  const participants = moveWithin(diagram.content.participants, itemId, toIndex);
  if (participants) return withParticipants(diagram, participants);
  const messages = moveWithin(diagram.content.messages, itemId, toIndex);
  return messages ? withMessages(diagram, messages) : diagram;
}

/** Changes a participant's role, keeping its label, place and messages. */
export function changeRole(diagram: SequenceDiagram, itemId: number, role: ParticipantRole): SequenceDiagram {
  const { participants } = diagram.content;
  const participant = participants.find((candidate) => candidate.id === itemId);
  if (!participant || participant.role === role) return diagram;
  return withParticipants(diagram, participants.map((candidate) => (candidate === participant ? { ...participant, role } : candidate)));
}

function updateMessage(diagram: SequenceDiagram, messageId: number, change: (message: Message) => Message): SequenceDiagram {
  const { messages } = diagram.content;
  const message = messages.find((candidate) => candidate.id === messageId);
  if (!message) return diagram;
  const changed = change(message);
  return changed === message ? diagram : withMessages(diagram, messages.map((candidate) => (candidate === message ? changed : candidate)));
}

/** Changes a message's type, keeping its text, ends and place. */
export function changeStyle(diagram: SequenceDiagram, messageId: number, style: MessageStyle): SequenceDiagram {
  return updateMessage(diagram, messageId, (message) => (message.style === style ? message : { ...message, style }));
}

/** Moves one end of a message to another participant. */
export function moveEnd(diagram: SequenceDiagram, messageId: number, end: "from" | "to", targetId: number): SequenceDiagram {
  return updateMessage(diagram, messageId, (message) => (message[end] === targetId ? message : { ...message, [end]: targetId }));
}

/** Swaps a message's sender and receiver. */
export function reverse(diagram: SequenceDiagram, messageId: number): SequenceDiagram {
  return updateMessage(diagram, messageId, (message) => ({ ...message, from: message.to, to: message.from }));
}
