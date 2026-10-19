import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit } from "../../history/history";
import { run, sequenceOf, threeAndMessages } from "../../testing/sequenceBuilder";

// VO-041: participants and messages moved to new positions change order in the diagram and the source together,
// each move one history entry; an index out of range is rejected with outOfRange.

const participantIds = (history = threeAndMessages()) => sequenceOf(history).content.participants.map((participant) => participant.id);
const messageTexts = (history = threeAndMessages()) => sequenceOf(history).content.messages.map((message) => message.text);

describe("reordering participants", () => {
  it("moves a participant right and left", () => {
    expect(participantIds(run(threeAndMessages(), { op: "reorder", itemId: 1, toIndex: 2 }))).toEqual([2, 3, 1]);
    expect(participantIds(run(threeAndMessages(), { op: "reorder", itemId: 3, toIndex: 0 }))).toEqual([3, 1, 2]);
  });

  it("changes the declaration order in the source with it", () => {
    const { source } = generate(run(threeAndMessages(), { op: "reorder", itemId: 3, toIndex: 0 }).present);

    expect(source.split("\n").slice(1, 4)).toEqual(["  participant p3 as Participant", "  participant p1 as Participant", "  actor p2 as Actor"]);
  });
});

describe("reordering messages", () => {
  it("moves a message earlier and later", () => {
    expect(messageTexts(run(threeAndMessages(), { op: "reorder", itemId: 6, toIndex: 0 }))).toEqual(["Three", "One", "Two"]);
    expect(messageTexts(run(threeAndMessages(), { op: "reorder", itemId: 4, toIndex: 2 }))).toEqual(["Two", "Three", "One"]);
  });

  it("changes the message order in the source with it", () => {
    const { source } = generate(run(threeAndMessages(), { op: "reorder", itemId: 6, toIndex: 0 }).present);

    expect(source.split("\n").slice(4)).toEqual(["  p3->p3: Three", "  p1->>p2: One", "  p2-->>p3: Two"]);
  });
});

describe("each move", () => {
  it("is one history entry", () => {
    const before = threeAndMessages();

    expect(run(before, { op: "reorder", itemId: 1, toIndex: 2 }).past).toHaveLength(before.past.length + 1);
  });

  it("to the position the item already holds changes nothing", () => {
    const before = threeAndMessages();
    const result = commit(before, { op: "reorder", itemId: 2, toIndex: 1 });

    expect(result.history).toBe(before);
  });

  it.each([-1, 3, 100])("to index %i is rejected with outOfRange and changes nothing", (toIndex) => {
    const before = threeAndMessages();
    const result = commit(before, { op: "reorder", itemId: 1, toIndex });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "outOfRange" } });
    expect(result.history).toBe(before);
  });

  it("of an item the diagram does not hold is rejected with unknownItem", () => {
    expect(commit(threeAndMessages(), { op: "reorder", itemId: 99, toIndex: 0 }).outcome).toEqual({
      committed: false,
      rejection: { reason: "unknownItem" },
    });
  });
});
