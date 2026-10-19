// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { MESSAGE_STYLES } from "../model/sequence/catalogue";
import type { Message, MessageStyle, Participant, SequenceDiagram } from "../model/types";
import { readSequence } from "../testing/mermaidReadback";
import { generate } from "./generate";

// VO-036: participants, actors and a message of each of the eight types are read back by Mermaid's parser as themselves.

// Mermaid's numeric line types for each message style.
const LINE_TYPE = new Map<MessageStyle, number>([
  ["solid-arrow", 0],
  ["dashed-arrow", 1],
  ["solid-open", 5],
  ["dashed-open", 6],
  ["solid-cross", 3],
  ["dashed-cross", 4],
  ["solid-async", 24],
  ["dashed-async", 25],
]);

const participants: Participant[] = [
  { id: 1, role: "participant", label: "Browser" },
  { id: 2, role: "actor", label: "Customer" },
  { id: 3, role: "participant", label: "Server" },
];
const messages: Message[] = MESSAGE_STYLES.map((style, index) => ({
  id: participants.length + index + 1,
  from: (index % 3) + 1,
  to: ((index + 1) % 3) + 1,
  style,
  text: `Message ${String(index + 1)}`,
}));
const diagram: SequenceDiagram = {
  id: "d1",
  name: "Untitled sequence diagram",
  type: "sequence",
  nextId: participants.length + messages.length + 1,
  changedAt: "",
  content: { participants, messages },
};

describe("a sequence diagram of participants, actors and every message type", () => {
  const { source } = generate(diagram);

  it("starts with the sequenceDiagram header", () => {
    expect(source.split("\n")[0]).toBe("sequenceDiagram");
  });

  it("is accepted by Mermaid's parser, which reports each participant or actor and its label in order", async () => {
    const read = await readSequence(source);

    expect(read.actors.map(({ id, label, type }) => [id, label, type])).toEqual(
      participants.map((participant) => [`p${String(participant.id)}`, participant.label, participant.role]),
    );
  });

  it("is read back with every message's ends, text and type in order", async () => {
    const read = await readSequence(source);

    expect(read.messages.map(({ from, to, text, type }) => [from, to, text, type])).toEqual(
      messages.map((message) => [`p${String(message.from)}`, `p${String(message.to)}`, message.text, LINE_TYPE.get(message.style)]),
    );
  });

  it("is the same text every time", () => {
    expect(generate(diagram).source).toBe(source);
  });
});
