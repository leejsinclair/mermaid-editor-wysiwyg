// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { snapshotSequence, type SequenceSnapshot } from "./mermaidSnapshot";

// VO-010 (FR-005): Mermaid's own reading of each sequence arrow and actor form, captured as plain data.
// The numbers asserted are the line types Mermaid reports, so a Mermaid upgrade that changes one fails this test.

const OPERATORS: readonly (readonly [string, number])[] = [
  ["->>", 0],
  ["-->>", 1],
  ["->", 5],
  ["-->", 6],
  ["-x", 3],
  ["--x", 4],
  ["-)", 24],
  ["--)", 25],
];

// Mermaid's line types for messages. Activations (17, 18), notes, blocks and numbering are steps but not messages.
const MESSAGE_TYPES: readonly number[] = [0, 1, 3, 4, 5, 6, 24, 25];

/** The message steps of a snapshot, in order. */
function messagesOf(snapshot: SequenceSnapshot) {
  return snapshot.steps.filter((step) => MESSAGE_TYPES.includes(step.type));
}

describe("snapshotSequence: arrows", () => {
  it.each(OPERATORS)("reads the arrow %s as Mermaid's line type %i", async (operator, type) => {
    const snapshot = await snapshotSequence(`sequenceDiagram\n  Alice${operator}Bob: a`);
    expect(messagesOf(snapshot)).toEqual([{ type, from: "Alice", to: "Bob", text: "a" }]);
  });
});

describe("snapshotSequence: participants", () => {
  it("reads participants, actors, aliases and implicit participants in order, with their roles", async () => {
    const snapshot = await snapshotSequence(
      "sequenceDiagram\n  participant A as Alice\n  actor B\n  Bob->>A: x\n  A->>A: self\n  Carl->>Bob: y",
    );
    expect(snapshot.actors).toEqual([
      { key: "A", label: "Alice", role: "participant" },
      { key: "B", label: "B", role: "actor" },
      { key: "Bob", label: "Bob", role: "participant" },
      { key: "Carl", label: "Carl", role: "participant" },
    ]);
  });

  it("reads a self-message as a message from and to the same participant, in order", async () => {
    const snapshot = await snapshotSequence("sequenceDiagram\n  Alice->>Alice: think\n  Alice->>Bob: say");
    expect(messagesOf(snapshot).map((step) => [step.from, step.to, step.text])).toEqual([
      ["Alice", "Alice", "think"],
      ["Alice", "Bob", "say"],
    ]);
  });

  it("keeps participants with equal labels as separate participants", async () => {
    const snapshot = await snapshotSequence("sequenceDiagram\n  participant X as Bob\n  participant Y as Bob\n  X->>Y: hi");
    expect(snapshot.actors.map((actor) => [actor.key, actor.label])).toEqual([
      ["X", "Bob"],
      ["Y", "Bob"],
    ]);
  });

  it("reads a message that activates its receiver as a message", async () => {
    const snapshot = await snapshotSequence("sequenceDiagram\n  Alice->>+Bob: hi");
    expect(messagesOf(snapshot)).toEqual([{ type: 0, from: "Alice", to: "Bob", text: "hi" }]);
  });
});
