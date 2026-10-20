import { describe, expect, it } from "vitest";
import { insertIndexAt } from "./gestures";

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
