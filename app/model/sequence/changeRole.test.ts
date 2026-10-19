import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { run, sequenceOf, threeAndMessages } from "../../testing/sequenceBuilder";

// VO-044: a participant with messages changed to an Actor and back keeps its label, order and messages; each change
// is one history entry.

describe("changing a participant's role", () => {
  it("to Actor and back keeps its label, order and messages", () => {
    const start = run(threeAndMessages(), { op: "setLabel", itemId: 1, field: "label", text: "Browser" });
    const before = sequenceOf(start);

    const actor = run(start, { op: "changeType", itemId: 1, to: { kind: "role", role: "actor" } });
    expect(sequenceOf(actor).content.participants[0]).toEqual({ id: 1, role: "actor", label: "Browser" });
    expect(generate(actor.present).source).toContain("  actor p1 as Browser");

    const back = run(actor, { op: "changeType", itemId: 1, to: { kind: "role", role: "participant" } });
    expect(sequenceOf(back).content).toEqual(before.content);
  });

  it("is one history entry each way", () => {
    const start = threeAndMessages();
    const actor = run(start, { op: "changeType", itemId: 1, to: { kind: "role", role: "actor" } });
    const back = run(actor, { op: "changeType", itemId: 1, to: { kind: "role", role: "participant" } });

    expect(actor.past).toHaveLength(start.past.length + 1);
    expect(back.past).toHaveLength(start.past.length + 2);
  });
});
