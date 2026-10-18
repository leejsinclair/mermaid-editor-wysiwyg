import { describe, expect, it } from "vitest";
import { commit, createHistory } from "../history/history";
import { addNode } from "../model/flowchart/apply";
import { C4_KINDS } from "../model/c4/catalogue";
import { newDiagram } from "../model/newDiagram";
import type { FlowchartDiagram } from "../model/types";
import { c4Of, emptyC4 } from "../testing/c4Builder";
import { run } from "../testing/run";
import { isVisible } from "./label";

// VO-019 (EC-04): a required label must hold a visible character. Flowchart node labels, participant labels, message
// text, diagram names, and the labels of C4 elements, boundaries, Deployment nodes and relationships.

const BLANK = [
  ["empty", ""],
  ["spaces only", "   "],
  ["line breaks only", "\n\n\r\n"],
  ["white space of every kind", " \t\n\u00a0\u2028"],
  ["zero-width characters only", "\u200b\u200d\ufeff"],
] as const;

describe("isVisible", () => {
  it.each(BLANK)("is false for a label that is %s", (_name, text) => {
    expect(isVisible(text)).toBe(false);
  });

  it("is true when at least one character shows", () => {
    expect(isVisible("A")).toBe(true);
    expect(isVisible("  padded  ")).toBe(true);
    expect(isVisible("\u200bx")).toBe(true);
  });
});

describe("renaming a flowchart node", () => {
  const start = (): FlowchartDiagram =>
    addNode(newDiagram("d1", "flowchart") as FlowchartDiagram, "rectangle", { x: 0, y: 0 });

  it.each(BLANK)("rejects a label that is %s with blankLabel and keeps the previous label", (_name, text) => {
    const history = createHistory(start());

    const result = commit(history, { op: "setLabel", itemId: 1, field: "label", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankLabel" } });
    expect(result.history).toBe(history);
    expect(result.history.present).toEqual(start());
  });

  it("accepts a multi-line label", () => {
    const result = commit(createHistory(start()), { op: "setLabel", itemId: 1, field: "label", text: "first\nsecond" });

    expect(result.outcome).toEqual({ committed: true });
    expect(result.history.present.content).toMatchObject({ nodes: [{ label: "first\nsecond" }] });
  });

  it("accepts a label of 10 000 characters", () => {
    const text = "x".repeat(10_000);

    const result = commit(createHistory(start()), { op: "setLabel", itemId: 1, field: "label", text });

    expect(result.outcome).toEqual({ committed: true });
    expect(result.history.present.content).toMatchObject({ nodes: [{ label: text }] });
  });
});

describe("a sequence participant label and message text", () => {
  const start = () => {
    let history = createHistory(newDiagram("d1", "sequence"));
    history = commit(history, { op: "addParticipant", role: "participant" }).history;
    history = commit(history, { op: "addParticipant", role: "actor" }).history;
    return commit(history, { op: "addMessage", from: 1, to: 2, style: "solid-arrow", text: "Hello" }).history;
  };

  it.each(BLANK)("rejects a participant label that is %s with blankLabel and keeps the previous label", (_name, text) => {
    const history = start();

    const result = commit(history, { op: "setLabel", itemId: 1, field: "label", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankLabel" } });
    expect(result.history).toBe(history);
  });

  it.each(BLANK)("rejects message text that is %s with blankMessage and keeps the previous text", (_name, text) => {
    const history = start();

    const result = commit(history, { op: "setLabel", itemId: 3, field: "text", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankMessage" } });
    expect(result.history).toBe(history);
  });

  it("accepts multi-line text and text of 10 000 characters", () => {
    for (const text of ["first\nsecond", "x".repeat(10_000)]) {
      const result = commit(start(), { op: "setLabel", itemId: 3, field: "text", text });

      expect(result.outcome).toEqual({ committed: true });
    }
  });
});

describe.each(C4_KINDS)("a required label in a %s diagram", (kind) => {
  const start = () => {
    const parts =
      kind === "deployment"
        ? [{ op: "addContainer", container: "deployment-node" } as const, { op: "addElement", elementType: "container", parentId: 1 } as const]
        : [{ op: "addContainer", container: kind === "context" ? "enterprise" : "generic" } as const, { op: "addElement", elementType: "person", parentId: 1 } as const];
    if (kind === "deployment") return run(emptyC4(kind), ...parts, { op: "addRelationship", from: 1, to: 2, direction: "one-way" });
    return run(emptyC4(kind), ...parts, { op: "addElement", elementType: "person" }, { op: "addRelationship", from: 2, to: 3, direction: "one-way" });
  };
  const ITEMS = [
    ["the container (boundary or node)", 1, "blankLabel"],
    ["the element", 2, "blankLabel"],
  ] as const;

  it.each(BLANK.flatMap((blank) => ITEMS.map((item) => [blank, item] as const)))("rejects %j as the label of %j and keeps the previous one", ([, text], [, itemId, reason]) => {
    const history = start();

    const result = commit(history, { op: "setLabel", itemId, field: "label", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason } });
    expect(result.history).toBe(history);
  });

  it.each(BLANK)("rejects a relationship label that is %s with blankRelationshipLabel", (_name, text) => {
    const history = start();
    const relationshipId = c4Of(history).content.relationships[0]?.id ?? 0;

    const result = commit(history, { op: "setLabel", itemId: relationshipId, field: "label", text });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankRelationshipLabel" } });
    expect(result.history).toBe(history);
  });

  it("accepts a multi-line label and one of 10 000 characters", () => {
    const text = `first\nsecond${"x".repeat(10_000)}`;

    const history = run(start(), { op: "setLabel", itemId: 2, field: "label", text });

    expect(JSON.stringify(c4Of(history).content.tree)).toContain(JSON.stringify(text).slice(1, -1));
  });

  it.each(BLANK.filter(([, text]) => text !== ""))("accepts %s as the optional description and title", (_name, text) => {
    const history = run(start(), { op: "setTitle", text }, { op: "setLabel", itemId: 2, field: "description", text });

    expect(c4Of(history).title).toBe(text);
  });
});
