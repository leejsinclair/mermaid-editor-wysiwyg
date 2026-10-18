import { describe, expect, it } from "vitest";
import { commit } from "../../history/history";
import { run, sequenceOf, threeAndMessages } from "../../testing/sequenceBuilder";
import { sequenceLayout } from "./sequenceLayout";

// VO-094: lifelines run left to right in declaration order and messages top to bottom in order, self-messages loop on
// one lifeline, and no free-position operation exists for Sequence.

describe("sequenceLayout", () => {
  const layout = sequenceLayout(sequenceOf(threeAndMessages()).content);

  it("puts lifelines left to right in declaration order, evenly spaced", () => {
    expect(layout.lifelines.map((lifeline) => lifeline.id)).toEqual([1, 2, 3]);
    const xs = layout.lifelines.map((lifeline) => lifeline.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    expect(new Set(xs).size).toBe(3);
    const gaps = xs.slice(1).map((x, index) => x - (xs[index] ?? 0));
    expect(new Set(gaps).size).toBe(1);
  });

  it("puts messages top to bottom in message order", () => {
    expect(layout.rows.map((row) => row.id)).toEqual([4, 5, 6]);
    const ys = layout.rows.map((row) => row.y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
    expect(new Set(ys).size).toBe(3);
  });

  it("starts each message on its sender's lifeline and ends it on its receiver's", () => {
    const x = (id: number) => layout.lifelines.find((lifeline) => lifeline.id === id)?.x;

    expect(layout.rows.map((row) => [row.fromX, row.toX])).toEqual([
      [x(1), x(2)],
      [x(2), x(3)],
      [x(3), x(3)],
    ]);
  });

  it("marks a message from a participant to itself as a loop on that one lifeline", () => {
    expect(layout.rows.map((row) => row.loop)).toEqual([false, false, true]);
    expect(layout.rows[2]?.fromX).toBe(layout.rows[2]?.toX);
  });

  it("follows a reordered diagram: moving a participant moves its lifeline and its messages' ends", () => {
    const moved = sequenceLayout(sequenceOf(run(threeAndMessages(), { op: "reorder", itemId: 3, toIndex: 0 })).content);

    expect(moved.lifelines.map((lifeline) => lifeline.id)).toEqual([3, 1, 2]);
    expect(moved.rows[2]?.fromX).toBe(moved.lifelines[0]?.x);
  });

  it("is tall enough for every message and wide enough for every lifeline", () => {
    expect(layout.height).toBeGreaterThan(Math.max(...layout.rows.map((row) => row.y)));
    expect(layout.width).toBeGreaterThan(Math.max(...layout.lifelines.map((lifeline) => lifeline.x)));
  });

  it("is a pure function of the content", () => {
    expect(sequenceLayout(sequenceOf(threeAndMessages()).content)).toEqual(layout);
  });
});

describe("free positions", () => {
  it("do not exist for a sequence diagram: moving a node is refused and changes nothing", () => {
    const before = threeAndMessages();

    const result = commit(before, { op: "moveNode", id: 1, position: { x: 10, y: 10 } });

    expect(result.outcome.committed).toBe(false);
    expect(result.history).toBe(before);
  });

  it("carry no position in the model: participants and messages hold no coordinates", () => {
    const { participants, messages } = sequenceOf(threeAndMessages()).content;

    for (const item of [...participants, ...messages]) {
      expect(item).not.toHaveProperty("x");
      expect(item).not.toHaveProperty("y");
    }
  });
});
