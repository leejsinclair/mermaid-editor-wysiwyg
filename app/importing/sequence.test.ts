import { describe, expect, it } from "vitest";
import { readSequence } from "./sequence";
import type { SequenceSnapshot } from "./snapshots";

// VO-009 (FR-005): a sequence snapshot becomes participants and messages in order, with the same role, label, ends,
// style and text. Steps that are not messages are left out here and reported in US2.

const snapshot: SequenceSnapshot = {
  actors: [
    { key: "A", label: "Alice", role: "participant" },
    { key: "B", label: "B", role: "actor" },
    { key: "X", label: "Bob", role: "participant" },
    { key: "Y", label: "Bob", role: "participant" },
  ],
  steps: [
    { type: 0, from: "A", to: "B", text: "solid" },
    { type: 1, from: "B", to: "A", text: "dashed" },
    { type: 5, from: "A", to: "X", text: "open" },
    { type: 6, from: "X", to: "A", text: "dashed open" },
    { type: 3, from: "A", to: "Y", text: "cross" },
    { type: 4, from: "Y", to: "A", text: "dashed cross" },
    { type: 24, from: "A", to: "A", text: "self async" },
    { type: 25, from: "B", to: "X", text: "dashed async" },
    { type: 2, text: "a note is not a message" },
  ],
};

describe("readSequence", () => {
  it("keeps participants in order with their role and label, and equal labels distinct", () => {
    const result = readSequence(snapshot);
    expect(result.participants).toEqual([
      { id: 1, role: "participant", label: "Alice" },
      { id: 2, role: "actor", label: "B" },
      { id: 3, role: "participant", label: "Bob" },
      { id: 4, role: "participant", label: "Bob" },
    ]);
  });

  it("keeps messages in order with their ends, style and text", () => {
    const result = readSequence(snapshot);
    expect(result.messages.map((message) => [message.from, message.to, message.style, message.text])).toEqual([
      [1, 2, "solid-arrow", "solid"],
      [2, 1, "dashed-arrow", "dashed"],
      [1, 3, "solid-open", "open"],
      [3, 1, "dashed-open", "dashed open"],
      [1, 4, "solid-cross", "cross"],
      [4, 1, "dashed-cross", "dashed cross"],
      [1, 1, "solid-async", "self async"],
      [2, 3, "dashed-async", "dashed async"],
    ]);
  });

  it("gives participants then messages ids from 1 upward, and sets nextId after the last", () => {
    const result = readSequence(snapshot);
    expect(result.messages.map((message) => message.id)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.nextId).toBe(13);
  });
});
