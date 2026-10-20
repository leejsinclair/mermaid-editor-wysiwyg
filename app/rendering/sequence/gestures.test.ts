import { describe, expect, it } from "vitest";
import { insertIndexAt, participantAt } from "./gestures";
import type { SequenceLayout } from "../layout/sequenceLayout";

// VO-034 (FR-012): a message released at a height goes into the gap that height falls in.
describe("insertIndexAt", () => {
  const rows = [100, 172, 244];

  it("is 0 above the first message", () => {
    expect(insertIndexAt(20, rows)).toBe(0);
  });

  it("is the gap between each pair of messages", () => {
    expect(insertIndexAt(130, rows)).toBe(1);
    expect(insertIndexAt(210, rows)).toBe(2);
  });

  it("goes before a message when released on its upper half and after it on its lower half", () => {
    expect(insertIndexAt(172, rows)).toBe(1);
    expect(insertIndexAt(173, rows)).toBe(2);
  });

  it("is the end below the last message", () => {
    expect(insertIndexAt(500, rows)).toBe(3);
  });

  it("copes with no messages and with one", () => {
    expect(insertIndexAt(300, [])).toBe(0);
    expect(insertIndexAt(90, [100])).toBe(0);
    expect(insertIndexAt(110, [100])).toBe(1);
  });
});

describe("participantAt", () => {
  const layout: SequenceLayout = {
    width: 560,
    height: 400,
    lifelines: [
      { id: 1, label: "Actor", role: "actor", x: 120 },
      { id: 2, label: "Participant", role: "participant", x: 340 },
    ],
    rows: [],
  };

  it("uses each role's rendered header bounds", () => {
    expect(participantAt(layout, 160, 65, 28)).toBe(1);
    expect(participantAt(layout, 380, 55, 28)).toBeUndefined();
  });

  it("accepts the rendered lifeline strip below the headers only", () => {
    expect(participantAt(layout, 340, 60, 28)).toBe(2);
    expect(participantAt(layout, 340, layout.height + 1, 28)).toBeUndefined();
  });
});
