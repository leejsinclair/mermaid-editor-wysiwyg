import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, type History } from "../../history/history";
import { c4Of, emptyC4 } from "../../testing/c4Builder";
import { run } from "../../testing/run";

// VO-050: relationships are created one-way and two-way between elements, and in Deployment between nodes; they start
// with the label "Uses" and no technology; a blank label is refused and the previous one kept; a boundary is refused as
// an end.

function elements(): History {
  return run(emptyC4("container"), { op: "addElement", elementType: "person" }, { op: "addElement", elementType: "container" }, { op: "addContainer", container: "system" });
}

describe("adding a relationship", () => {
  it("creates it one-way or two-way with the label Uses and an empty technology", () => {
    const history = run(elements(), { op: "addRelationship", from: 1, to: 2, direction: "one-way" }, { op: "addRelationship", from: 2, to: 1, direction: "two-way" });

    expect(c4Of(history).content.relationships).toEqual([
      { id: 4, from: 1, to: 2, direction: "one-way", label: "Uses", technology: "" },
      { id: 5, from: 2, to: 1, direction: "two-way", label: "Uses", technology: "" },
    ]);
    expect(generate(history.present).source).toContain('Rel(e1, e2, "Uses")\n  BiRel(e2, e1, "Uses")');
  });

  it("allows a relationship from an element to itself", () => {
    expect(commit(elements(), { op: "addRelationship", from: 2, to: 2, direction: "one-way" }).outcome).toEqual({ committed: true });
  });

  it("refuses an end that does not exist", () => {
    const history = elements();

    for (const [from, to] of [
      [99, 1],
      [1, 99],
    ] as const) {
      const result = commit(history, { op: "addRelationship", from, to, direction: "one-way" });
      expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "unknownEndpoint" } });
      expect(result.history).toBe(history);
    }
  });

  it("refuses a boundary as either end, in a diagram with elements", () => {
    const history = elements();

    for (const [from, to] of [
      [3, 1],
      [1, 3],
    ] as const) {
      const result = commit(history, { op: "addRelationship", from, to, direction: "one-way" });
      expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "endNotAllowed" } });
      expect(result.history).toBe(history);
    }
  });
});

describe("a Deployment diagram", () => {
  const nodes = () => run(emptyC4("deployment"), { op: "addContainer", container: "deployment-node" }, { op: "addContainer", container: "deployment-node" }, { op: "addElement", elementType: "container", parentId: 1 });

  it("relates nodes and Containers", () => {
    const history = run(nodes(), { op: "addRelationship", from: 1, to: 2, direction: "one-way" }, { op: "addRelationship", from: 3, to: 2, direction: "two-way" });

    expect(c4Of(history).content.relationships.map((relationship) => [relationship.from, relationship.to, relationship.direction])).toEqual([
      [1, 2, "one-way"],
      [3, 2, "two-way"],
    ]);
    expect(generate(history.present).source).toContain('Rel(d1, d2, "Uses")\n  BiRel(e3, d2, "Uses")');
  });
});

describe("a relationship's label and technology", () => {
  const related = () => run(elements(), { op: "addRelationship", from: 1, to: 2, direction: "one-way" });

  it("are edited, the technology to empty as well, each in one history entry", () => {
    const start = related();

    const edited = run(start, { op: "setLabel", itemId: 4, field: "label", text: "Reads" }, { op: "setLabel", itemId: 4, field: "technology", text: "HTTPS" });
    const cleared = run(edited, { op: "setLabel", itemId: 4, field: "technology", text: "" });

    expect(c4Of(edited).content.relationships[0]).toMatchObject({ label: "Reads", technology: "HTTPS" });
    expect(generate(edited.present).source).toContain('Rel(e1, e2, "Reads", "HTTPS")');
    expect(c4Of(cleared).content.relationships[0]?.technology).toBe("");
    expect(cleared.past).toHaveLength(start.past.length + 3);
  });

  it.each(["", "  ", "\n"])("refuse the blank label %j and keep the previous one", (text) => {
    const start = related();

    const result = commit(start, { op: "setLabel", itemId: 4, field: "label", text });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "blankRelationshipLabel" } });
    expect(result.history).toBe(start);
    expect(c4Of(result.history).content.relationships[0]?.label).toBe("Uses");
  });

  it("refuse a description, which a relationship does not have", () => {
    expect(commit(related(), { op: "setLabel", itemId: 4, field: "description", text: "x" }).outcome).toMatchObject({ rejection: { reason: "noSuchField" } });
  });
});
