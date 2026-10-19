import type { MessageStyle, ParticipantRole, SequenceContent } from "../../model/types";

// Where a sequence diagram's parts sit on the canvas. Pure: it depends only on the order of participants and
// messages, so there are no positions in the model and nothing to move freely (FR-003, FR-029).

export const LIFELINE_SPACING = 220;
export const LEFT_MARGIN = 120;
export const HEADER_HEIGHT = 80;
export const ROW_SPACING = 72;
export const BOTTOM_MARGIN = 80;

export interface Lifeline {
  readonly id: number;
  readonly label: string;
  readonly role: ParticipantRole;
  /** Horizontal centre of the lifeline. */
  readonly x: number;
}

export interface MessageRow {
  readonly id: number;
  readonly text: string;
  readonly style: MessageStyle;
  readonly y: number;
  readonly fromX: number;
  readonly toX: number;
  /** A message from a participant to itself: drawn as a loop on that one lifeline. */
  readonly loop: boolean;
}

export interface SequenceLayout {
  readonly width: number;
  readonly height: number;
  readonly lifelines: readonly Lifeline[];
  readonly rows: readonly MessageRow[];
}

/** Lifelines left to right in declaration order, messages top to bottom in order. */
export function sequenceLayout(content: SequenceContent): SequenceLayout {
  const lifelines = content.participants.map((participant, index) => ({
    id: participant.id,
    label: participant.label,
    role: participant.role,
    x: LEFT_MARGIN + index * LIFELINE_SPACING,
  }));
  const xOf = new Map(lifelines.map((lifeline) => [lifeline.id, lifeline.x]));
  const rows = content.messages.map((message, index) => {
    const fromX = xOf.get(message.from) ?? LEFT_MARGIN;
    const toX = xOf.get(message.to) ?? LEFT_MARGIN;
    return {
      id: message.id,
      text: message.text,
      style: message.style,
      y: HEADER_HEIGHT + (index + 1) * ROW_SPACING,
      fromX,
      toX,
      loop: message.from === message.to,
    };
  });
  return {
    width: LEFT_MARGIN * 2 + Math.max(0, lifelines.length - 1) * LIFELINE_SPACING,
    height: HEADER_HEIGHT + (rows.length + 1) * ROW_SPACING + BOTTOM_MARGIN,
    lifelines,
    rows,
  };
}
