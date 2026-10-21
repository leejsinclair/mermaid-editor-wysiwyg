import type { Message, MessageStyle, Participant } from "../model/types";
import { en } from "../text/en";
import { fill } from "../text/fill";
import { decodeLabel } from "./decode";
import type { SequenceSnapshot } from "./snapshots";

export interface ReadSequence {
  readonly participants: readonly Participant[];
  readonly messages: readonly Message[];
  readonly nextId: number;
}

// Mermaid's numeric line types for messages (research R1, pinned by VO-010) and the editor's style for each.
const MESSAGE_STYLES: ReadonlyMap<number, MessageStyle> = new Map<number, MessageStyle>([
  [0, "solid-arrow"],
  [1, "dashed-arrow"],
  [5, "solid-open"],
  [6, "dashed-open"],
  [3, "solid-cross"],
  [4, "dashed-cross"],
  [24, "solid-async"],
  [25, "dashed-async"],
]);

export function readSequence(snapshot: SequenceSnapshot): ReadSequence {
  const ids = new Map<string, number>();
  const participants: Participant[] = snapshot.actors.map((actor, index) => {
    const id = index + 1;
    ids.set(actor.key, id);
    return { id, role: actor.role, label: decodeLabel(actor.label).text };
  });

  let next = participants.length + 1;
  const messages: Message[] = [];
  for (const step of snapshot.steps) {
    const style = MESSAGE_STYLES.get(step.type);
    if (style === undefined || step.from === undefined || step.to === undefined) continue;
    // A message with no visible text keeps the default text a new message gets (research R7).
    const visible = decodeLabel(step.text).text;
    messages.push({
      id: next,
      from: ids.get(step.from) ?? 0,
      to: ids.get(step.to) ?? 0,
      style,
      text: visible.trim() === "" ? fill(en.problems.items.message, { id: String(next) }) : visible,
    });
    next += 1;
  }
  return { participants, messages, nextId: next };
}
