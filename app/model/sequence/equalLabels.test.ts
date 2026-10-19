// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { readSequence } from "../../testing/mermaidReadback";
import { newDiagram } from "../newDiagram";
import type { SequenceDiagram } from "../types";

// VO-039: two participants with the same label remain two participants in the diagram and in the source, each with
// its own messages.

describe("participants with equal labels", () => {
  const diagram: SequenceDiagram = {
    ...newDiagram("d1", "sequence"),
    nextId: 6,
    content: {
      participants: [
        { id: 1, role: "participant", label: "Service" },
        { id: 2, role: "participant", label: "Service" },
      ],
      messages: [
        { id: 3, from: 1, to: 2, style: "solid-arrow", text: "Forward" },
        { id: 4, from: 2, to: 1, style: "dashed-arrow", text: "Back" },
        { id: 5, from: 2, to: 2, style: "solid-arrow", text: "Own" },
      ],
    },
  } as SequenceDiagram;

  it("stay two participants in the diagram", () => {
    const participants = diagram.content.participants;

    expect(participants.map(({ id, label }) => [id, label])).toEqual([
      [1, "Service"],
      [2, "Service"],
    ]);
  });

  it("stay two participants in the source, each with its own messages", async () => {
    const read = await readSequence(generate(diagram).source);

    expect(read.actors.map(({ id, label }) => [id, label])).toEqual([
      ["p1", "Service"],
      ["p2", "Service"],
    ]);
    expect(read.messages.map(({ from, to, text }) => [from, to, text])).toEqual([
      ["p1", "p2", "Forward"],
      ["p2", "p1", "Back"],
      ["p2", "p2", "Own"],
    ]);
  });
});
