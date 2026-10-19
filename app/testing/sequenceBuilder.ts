// Test support: builds sequence diagrams and applies operations, checking each one is accepted unless told otherwise.
import { createHistory, type History } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import type { SequenceDiagram } from "../model/types";
import { run } from "./run";

export { run };

export const sequenceOf = (history: History): SequenceDiagram => history.present as SequenceDiagram;

/** Participants 1 (participant), 2 (actor) and 3 (participant), and messages 4 (1 to 2), 5 (2 to 3), 6 (3 to 3). */
export function threeAndMessages(): History {
  return run(
    createHistory(newDiagram("d1", "sequence")),
    { op: "addParticipant", role: "participant" },
    { op: "addParticipant", role: "actor" },
    { op: "addParticipant", role: "participant" },
    { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "One" },
    { op: "addMessage", from: 2, to: 3, style: "dashed-arrow", text: "Two" },
    { op: "addMessage", from: 3, to: 3, style: "solid-open", text: "Three" },
  );
}
