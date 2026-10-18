import { describe, expect, it } from "vitest";
import { commit } from "../../history/history";
import { run, sequenceOf, threeAndMessages } from "../../testing/sequenceBuilder";
import { MESSAGE_STYLES } from "./catalogue";

// VO-045: a message's type changed to each other type, and its sender and receiver moved to other participants, keeps
// its text and order position; each change is one history entry. Reversing a self-message is refused.

const first = (history = threeAndMessages()) => sequenceOf(history).content.messages[0];

describe("changing a message's type", () => {
  it.each(MESSAGE_STYLES.filter((style) => style !== "solid-arrow"))("to %s keeps its text and position", (style) => {
    const before = threeAndMessages();
    const after = run(before, { op: "changeType", itemId: 4, to: { kind: "style", style } });

    expect(first(after)).toEqual({ ...first(before), style });
    expect(sequenceOf(after).content.messages.map((message) => message.id)).toEqual([4, 5, 6]);
    expect(after.past).toHaveLength(before.past.length + 1);
  });
});

describe("moving a message's ends", () => {
  it("moves the sender to another participant, keeping text, type and position", () => {
    const after = run(threeAndMessages(), { op: "moveEnd", linkId: 4, end: "from", targetId: 3 });

    expect(first(after)).toMatchObject({ id: 4, from: 3, to: 2, text: "One", style: "solid-arrow" });
  });

  it("moves the receiver, even onto the sender (a self-message)", () => {
    const after = run(threeAndMessages(), { op: "moveEnd", linkId: 4, end: "to", targetId: 1 });

    expect(first(after)).toMatchObject({ id: 4, from: 1, to: 1 });
  });

  it("is refused for a participant the diagram does not hold", () => {
    expect(commit(threeAndMessages(), { op: "moveEnd", linkId: 4, end: "to", targetId: 99 }).outcome).toEqual({
      committed: false,
      rejection: { reason: "unknownEndpoint" },
    });
  });
});

describe("reversing a message", () => {
  it("swaps sender and receiver, keeping text, type and position", () => {
    const after = run(threeAndMessages(), { op: "reverse", linkId: 4 });

    expect(first(after)).toMatchObject({ id: 4, from: 2, to: 1, text: "One" });
    expect(sequenceOf(after).content.messages.map((message) => message.id)).toEqual([4, 5, 6]);
  });

  it("is refused for a self-message with reverseSelf", () => {
    const result = commit(threeAndMessages(), { op: "reverse", linkId: 6 });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "reverseSelf" } });
  });

  it("is refused for an item that is not a message", () => {
    expect(commit(threeAndMessages(), { op: "reverse", linkId: 1 }).outcome).toEqual({ committed: false, rejection: { reason: "unknownItem" } });
  });
});
