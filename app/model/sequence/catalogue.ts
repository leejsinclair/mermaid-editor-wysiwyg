import type { MessageStyle, ParticipantRole } from "../types";

export const PARTICIPANT_ROLES: readonly ParticipantRole[] = ["participant", "actor"];

/** The label a new participant or actor starts with. */
export const ROLE_NAMES: ReadonlyMap<ParticipantRole, string> = new Map([
  ["participant", "Participant"],
  ["actor", "Actor"],
]);

/** The eight message types and the name each shows in the toolbox and as default text (FR-007). */
export const MESSAGE_STYLE_NAMES: ReadonlyMap<MessageStyle, string> = new Map([
  ["solid-arrow", "Solid arrow"],
  ["dashed-arrow", "Dashed arrow"],
  ["solid-open", "Solid open arrow"],
  ["dashed-open", "Dashed open arrow"],
  ["solid-cross", "Solid cross"],
  ["dashed-cross", "Dashed cross"],
  ["solid-async", "Solid async arrow"],
  ["dashed-async", "Dashed async arrow"],
]);

export const MESSAGE_STYLES: readonly MessageStyle[] = [...MESSAGE_STYLE_NAMES.keys()];
