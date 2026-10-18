import { describe, expect, it } from "vitest";
import { commit, createHistory } from "../../history/history";
import { newDiagram } from "../newDiagram";
import type { SequenceDiagram } from "../types";

// VO-038: in a diagram with exactly one participant, a message from it to itself is created.

describe("a message from a participant to itself", () => {
  it("is created when the diagram has exactly one participant", () => {
    const one = commit(createHistory(newDiagram("d1", "sequence")), { op: "addParticipant", role: "participant" }).history;

    const { history, outcome } = commit(one, { op: "addMessage", from: 1, to: 1, style: "solid-arrow", text: "Think" });

    expect(outcome).toEqual({ committed: true });
    const messages = (history.present as SequenceDiagram).content.messages;
    expect(messages.map(({ from, to, text }) => [from, to, text])).toEqual([[1, 1, "Think"]]);
  });

  it("is created with every message type", () => {
    let history = commit(createHistory(newDiagram("d1", "sequence")), { op: "addParticipant", role: "actor" }).history;
    for (const style of ["dashed-arrow", "solid-open", "dashed-open", "solid-cross", "dashed-cross", "solid-async", "dashed-async"] as const) {
      const result = commit(history, { op: "addMessage", from: 1, to: 1, style, text: style });
      expect(result.outcome).toEqual({ committed: true });
      history = result.history;
    }

    expect((history.present as SequenceDiagram).content.messages).toHaveLength(7);
  });
});
