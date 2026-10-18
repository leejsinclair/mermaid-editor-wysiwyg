import type { Message, MessageStyle, Participant, SequenceDiagram } from "../model/types";
import { escapeLabel } from "./escape";

// Mermaid's arrow operator for each message type (contracts/mermaid-output.md).
const OPERATORS = new Map<MessageStyle, string>([
  ["solid-arrow", "->>"],
  ["dashed-arrow", "-->>"],
  ["solid-open", "->"],
  ["dashed-open", "-->"],
  ["solid-cross", "-x"],
  ["dashed-cross", "--x"],
  ["solid-async", "-)"],
  ["dashed-async", "--)"],
]);

/** Aliases come from ids, never from labels, so participants with equal labels stay distinct. */
const alias = (id: number) => `p${String(id)}`;

const participantLine = (participant: Participant) => `  ${participant.role} ${alias(participant.id)} as ${escapeLabel(participant.label)}`;

function messageLine(message: Message): string {
  const operator = OPERATORS.get(message.style) ?? "->>";
  return `  ${alias(message.from)}${operator}${alias(message.to)}: ${escapeLabel(message.text)}`;
}

/** The header, then every participant in left-to-right order, then every message in top-to-bottom order. */
export function generateSequence(diagram: SequenceDiagram): string {
  return [
    "sequenceDiagram",
    ...diagram.content.participants.map(participantLine),
    ...diagram.content.messages.map(messageLine),
  ].join("\n");
}
