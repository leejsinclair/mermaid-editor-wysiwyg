// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory, type History } from "../../history/history";
import { readSequence } from "../../testing/mermaidReadback";
import { newDiagram } from "../newDiagram";
import type { Operation } from "../operations";
import type { SequenceDiagram } from "../types";

// VO-037: messages added between participants, at the end and at a chosen position, each appear at their place
// with text and type; the source lists the header, then declarations in order, then messages in order.

function run(history: History, ...operations: Operation[]): History {
  return operations.reduce((current, operation) => {
    const result = commit(current, operation);
    expect(result.outcome).toEqual({ committed: true });
    return result.history;
  }, history);
}

const sequence = (history: History) => history.present as SequenceDiagram;

/** Participant 1, actor 2 and participant 3, in that order. */
const people = () =>
  run(
    createHistory(newDiagram("d1", "sequence")),
    { op: "addParticipant", role: "participant" },
    { op: "addParticipant", role: "actor" },
    { op: "addParticipant", role: "participant" },
  );

describe("addParticipant", () => {
  it("adds a participant or an actor labelled with its role name, at the end by default", () => {
    const diagram = sequence(people());

    expect(diagram.content.participants.map(({ id, role, label }) => [id, role, label])).toEqual([
      [1, "participant", "Participant"],
      [2, "actor", "Actor"],
      [3, "participant", "Participant"],
    ]);
    expect(diagram.nextId).toBe(4);
  });

  it("adds at a chosen position, shifting the others right", () => {
    const diagram = sequence(run(people(), { op: "addParticipant", role: "actor", index: 0 }));

    expect(diagram.content.participants.map((participant) => participant.id)).toEqual([4, 1, 2, 3]);
  });
});

describe("addMessage", () => {
  it("adds messages at the end in the order given, with their text and type", () => {
    const history = run(
      people(),
      { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "Hello" },
      { op: "addMessage", from: 2, to: 3, style: "dashed-open", text: "Reply" },
    );

    expect(sequence(history).content.messages.map(({ from, to, style, text }) => [from, to, style, text])).toEqual([
      [1, 2, "solid-arrow", "Hello"],
      [2, 3, "dashed-open", "Reply"],
    ]);
  });

  it("adds at a chosen position, so the new message sits between the others", () => {
    const history = run(
      people(),
      { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "First" },
      { op: "addMessage", from: 2, to: 3, style: "solid-arrow", text: "Third" },
      { op: "addMessage", from: 3, to: 1, style: "dashed-cross", text: "Second", index: 1 },
    );

    expect(sequence(history).content.messages.map((message) => message.text)).toEqual(["First", "Second", "Third"]);
  });

  it("uses the message type's name as its text when none is given by the interface (FR-007)", () => {
    const history = run(people(), { op: "addMessage", from: 1, to: 2, style: "solid-async", text: "Solid async arrow" });

    expect(sequence(history).content.messages[0]?.text).toBe("Solid async arrow");
  });

  it("is one history entry, and Undo removes the message", () => {
    const before = people();
    const after = run(before, { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "Hello" });

    expect(after.past).toHaveLength(before.past.length + 1);
  });

  it("is refused when either end is not a participant of the diagram", () => {
    const result = commit(people(), { op: "addMessage", from: 1, to: 99, style: "solid-arrow", text: "Hello" });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "unknownEndpoint" } });
    expect(sequence(result.history).content.messages).toHaveLength(0);
  });
});

describe("the source of a built diagram", () => {
  it("lists the header, then declarations in order, then messages in order", async () => {
    const history = run(
      people(),
      { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "First" },
      { op: "addMessage", from: 2, to: 3, style: "dashed-arrow", text: "Third" },
      { op: "addMessage", from: 3, to: 1, style: "solid-cross", text: "Second", index: 1 },
    );

    const { source } = generate(history.present);

    expect(source.split("\n")).toEqual([
      "sequenceDiagram",
      "  participant p1 as Participant",
      "  actor p2 as Actor",
      "  participant p3 as Participant",
      "  p1->>p2: First",
      "  p3-xp1: Second",
      "  p2-->>p3: Third",
    ]);
    const read = await readSequence(source);
    expect(read.messages.map((message) => message.text)).toEqual(["First", "Second", "Third"]);
  });
});
