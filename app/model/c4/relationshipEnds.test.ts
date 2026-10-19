import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory, undo } from "../../history/history";
import { boundary, c4Diagram, c4Of, element, node, relationship } from "../../testing/c4Builder";
import { run } from "../../testing/run";
import type { C4Kind } from "../types";

// VO-061: a relationship, including a Dynamic one, has either end moved to another element and is reversed; it keeps its
// label, technology and number. Reverse on a two-way relationship, or from an element to itself, is refused. Its direction
// is changed in place (FR-040, FR-041).

/** Elements 1 to 3 and boundary 4; relationships 10 (1 to 2, "Reads", HTTPS), 11 (2 to 3, two-way) and 12 (3 to 3). */
function start(kind: C4Kind = "container") {
  return createHistory(
    c4Diagram(
      kind,
      [element(1, "person"), element(2, "container"), element(3, "container"), boundary(4, "generic", [])],
      [relationship(10, 1, 2, "one-way", "Reads"), relationship(11, 2, 3, "two-way"), relationship(12, 3, 3)],
    ),
  );
}

const first = (history: ReturnType<typeof start>) => c4Of(history).content.relationships[0];

describe("moving an end of a relationship", () => {
  it.each(["from", "to"] as const)("moves its %s end, keeping its label, technology, direction and position", (end) => {
    const before = start();

    const after = run(before, { op: "moveEnd", linkId: 10, end, targetId: 3 });

    expect(first(after)).toEqual({ ...first(before), [end]: 3 });
    expect(c4Of(after).content.relationships.map((relationship) => relationship.id)).toEqual([10, 11, 12]);
    expect(after.past).toHaveLength(1);
    expect(undo(after).present).toEqual(before.present);
  });

  it("keeps the number a Dynamic relationship has by position", () => {
    const after = run(start("dynamic"), { op: "moveEnd", linkId: 10, end: "to", targetId: 3 });

    expect(generate(after.present).source).toContain('RelIndex(1, e1, e3, "Reads", "Technology 10")');
  });

  it("can move an end to the element at the other end, making a relationship from an element to itself", () => {
    expect(first(run(start(), { op: "moveEnd", linkId: 10, end: "to", targetId: 1 }))).toMatchObject({ from: 1, to: 1 });
  });

  it("is not a change when the end is already there", () => {
    const history = start();

    const result = commit(history, { op: "moveEnd", linkId: 10, end: "to", targetId: 2 });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(history);
  });

  it.each([
    ["a relationship that does not exist", 99, 1, "unknownItem"],
    ["an end that does not exist", 10, 99, "unknownEndpoint"],
    ["a boundary", 10, 4, "endNotAllowed"],
  ] as const)("to %s is refused and changes nothing", (_name, linkId, targetId, reason) => {
    const history = start();

    const result = commit(history, { op: "moveEnd", linkId, end: "to", targetId });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason } });
    expect(result.history).toBe(history);
  });

  it("can go to a Deployment node in a Deployment diagram", () => {
    const history = createHistory(c4Diagram("deployment", [node(1, [element(2, "container")]), element(3, "container")], [relationship(10, 2, 3)]));

    expect(first(run(history, { op: "moveEnd", linkId: 10, end: "to", targetId: 1 }))).toMatchObject({ to: 1 });
  });
});

describe("reversing a relationship", () => {
  it("swaps its ends and keeps everything else, in one history entry", () => {
    const before = start("dynamic");

    const after = run(before, { op: "reverse", linkId: 10 });

    expect(first(after)).toEqual({ ...first(before), from: 2, to: 1 });
    expect(generate(after.present).source).toContain('RelIndex(1, e2, e1, "Reads", "Technology 10")');
    expect(after.past).toHaveLength(1);
  });

  it.each([
    ["a two-way relationship", 11, "reverseUndirected"],
    ["a relationship from an element to itself", 12, "reverseSelf"],
    ["one that does not exist", 99, "unknownItem"],
  ] as const)("is refused for %s", (_name, linkId, reason) => {
    const history = start();

    const result = commit(history, { op: "reverse", linkId });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason } });
    expect(result.history).toBe(history);
  });
});

describe("changing a relationship between one-way and two-way", () => {
  it("keeps its label, technology, ends and position, in one history entry each way", () => {
    const before = start("dynamic");

    const both = run(before, { op: "changeType", itemId: 10, to: { kind: "direction", direction: "two-way" } });
    const back = run(both, { op: "changeType", itemId: 10, to: { kind: "direction", direction: "one-way" } });

    expect(first(both)).toEqual({ ...first(before), direction: "two-way" });
    expect(generate(both.present).source).toContain('BiRel(e1, e2, "Reads", "Technology 10")');
    expect(c4Of(back)).toEqual(c4Of(before));
    expect([both.past.length, back.past.length]).toEqual([1, 2]);
  });

  it("is refused for an element, or a relationship that does not exist", () => {
    const history = start();

    expect(commit(history, { op: "changeType", itemId: 1, to: { kind: "direction", direction: "two-way" } }).outcome).toMatchObject({ rejection: { reason: "notOfferedInKind" } });
    expect(commit(history, { op: "changeType", itemId: 99, to: { kind: "direction", direction: "two-way" } }).outcome).toMatchObject({ rejection: { reason: "unknownItem" } });
  });
});
