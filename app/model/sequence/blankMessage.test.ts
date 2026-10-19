import { describe, expect, it } from "vitest";
import { commit } from "../../history/history";
import { run, sequenceOf, threeAndMessages } from "../../testing/sequenceBuilder";

// VO-043: a message with empty or blank text is rejected with blankMessage, whether added or edited; no message is
// added and the existing text is kept.

const BLANK = ["", " ", "   ", "\n", "\t \n", "​", "​ ​"];

describe("adding a message with blank text", () => {
  it.each(BLANK)("%j is rejected with blankMessage and adds no message", (text) => {
    const before = threeAndMessages();
    const result = commit(before, { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankMessage" } });
    expect(sequenceOf(result.history).content.messages).toHaveLength(3);
    expect(result.history).toBe(before);
  });
});

describe("changing a message's text to blank", () => {
  it.each(BLANK)("%j is rejected with blankMessage and the existing text is kept", (text) => {
    const before = threeAndMessages();
    const result = commit(before, { op: "setLabel", itemId: 4, field: "text", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankMessage" } });
    expect(sequenceOf(result.history).content.messages[0]?.text).toBe("One");
  });
});

describe("a message's text", () => {
  it("is replaced by visible text in one history entry", () => {
    const before = threeAndMessages();
    const after = run(before, { op: "setLabel", itemId: 4, field: "text", text: "Hello" });

    expect(sequenceOf(after).content.messages[0]?.text).toBe("Hello");
    expect(after.past).toHaveLength(before.past.length + 1);
  });
});

describe("a participant's label", () => {
  it("is required too: a blank label is rejected with blankLabel and the label is kept", () => {
    const result = commit(threeAndMessages(), { op: "setLabel", itemId: 1, field: "label", text: " " });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankLabel" } });
    expect(sequenceOf(result.history).content.participants[0]?.label).toBe("Participant");
  });

  it("is replaced by visible text", () => {
    const after = run(threeAndMessages(), { op: "setLabel", itemId: 1, field: "label", text: "Browser" });

    expect(sequenceOf(after).content.participants[0]?.label).toBe("Browser");
  });

  it("is refused when the field does not belong to the item", () => {
    expect(commit(threeAndMessages(), { op: "setLabel", itemId: 1, field: "text", text: "x" }).outcome).toEqual({
      committed: false,
      rejection: { reason: "noSuchField" },
    });
  });
});
