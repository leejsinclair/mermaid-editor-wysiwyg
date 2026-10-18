import { describe, expect, it } from "vitest";
import { commit } from "../../history/history";
import { run, sequenceOf, threeAndMessages } from "../../testing/sequenceBuilder";

// VO-040: deleting a participant removes it and exactly its messages, self-messages included; deleting one message
// leaves both participants and every other message unchanged.

describe("deleting a participant", () => {
  it("removes it and exactly the messages it sends or receives, including its self-messages", () => {
    const after = sequenceOf(run(threeAndMessages(), { op: "deleteItem", itemId: 3 }));

    expect(after.content.participants.map((participant) => participant.id)).toEqual([1, 2]);
    expect(after.content.messages.map((message) => message.text)).toEqual(["One"]);
  });

  it("in the middle keeps the other participants in order and their messages", () => {
    const after = sequenceOf(run(threeAndMessages(), { op: "deleteItem", itemId: 2 }));

    expect(after.content.participants.map((participant) => participant.id)).toEqual([1, 3]);
    expect(after.content.messages.map((message) => message.text)).toEqual(["Three"]);
  });

  it("is one history entry, and never reuses the freed ids", () => {
    const before = threeAndMessages();
    const after = run(before, { op: "deleteItem", itemId: 1 });

    expect(after.past).toHaveLength(before.past.length + 1);
    expect(sequenceOf(after).nextId).toBe(sequenceOf(before).nextId);
  });
});

describe("deleting one message", () => {
  it("leaves both participants and every other message unchanged", () => {
    const before = sequenceOf(threeAndMessages());
    const after = sequenceOf(run(threeAndMessages(), { op: "deleteItem", itemId: 5 }));

    expect(after.content.participants).toEqual(before.content.participants);
    expect(after.content.messages).toEqual(before.content.messages.filter((message) => message.id !== 5));
  });

  it("is refused for an item the diagram does not hold", () => {
    const result = commit(threeAndMessages(), { op: "deleteItem", itemId: 99 });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "unknownItem" } });
  });
});
