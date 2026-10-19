import { en } from "../../text/en";
import type { MessageStyle, ParticipantRole } from "../types";

export const PARTICIPANT_ROLES: readonly ParticipantRole[] = ["participant", "actor"];

/** The label a new participant or actor starts with. */
export const ROLE_NAMES: ReadonlyMap<ParticipantRole, string> = new Map([
  ["participant", en.sequence.roles.participant],
  ["actor", en.sequence.roles.actor],
]);

/** The eight message types and the name each shows in the toolbox and as default text (FR-007). */
export const MESSAGE_STYLE_NAMES: ReadonlyMap<MessageStyle, string> = new Map([
  ["solid-arrow", en.sequence.messageStyles.solidArrow],
  ["dashed-arrow", en.sequence.messageStyles.dashedArrow],
  ["solid-open", en.sequence.messageStyles.solidOpen],
  ["dashed-open", en.sequence.messageStyles.dashedOpen],
  ["solid-cross", en.sequence.messageStyles.solidCross],
  ["dashed-cross", en.sequence.messageStyles.dashedCross],
  ["solid-async", en.sequence.messageStyles.solidAsync],
  ["dashed-async", en.sequence.messageStyles.dashedAsync],
]);

export const MESSAGE_STYLES: readonly MessageStyle[] = [...MESSAGE_STYLE_NAMES.keys()];
