import { beforeEach, describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, type History } from "../../history/history";
import { c4Of, emptyC4 } from "../../testing/c4Builder";
import { run } from "../../testing/run";
import type { Element } from "../types";

// VO-049: a C4 element's label, description and technology are edited, including to empty; the label is required, the
// description and technology are optional, and a technology is accepted only where the type has one.

const elementOf = (history: Parameters<typeof c4Of>[0], id: number) => c4Of(history).content.tree.find((item): item is Element => item.item === "element" && item.id === id);

describe("adding an element", () => {
  it("labels it with its type's name and leaves its description and technology empty", () => {
    const history = run(emptyC4("container"), { op: "addElement", elementType: "container-db" }, { op: "addElement", elementType: "person-ext" });

    expect(c4Of(history).content.tree).toEqual([
      { item: "element", id: 1, elementType: "container-db", label: "Container database", description: "", technology: "" },
      { item: "element", id: 2, elementType: "person-ext", label: "External person", description: "", technology: "" },
    ]);
  });

  it("refuses a type the kind does not offer, naming the kind", () => {
    const history = emptyC4("container");

    const result = commit(history, { op: "addElement", elementType: "system-db" });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "notOfferedInKind", details: { kind: "container" } } });
    expect(result.history).toBe(history);
  });

  it("refuses a Person in a Deployment diagram, which offers only Containers and nodes", () => {
    expect(commit(emptyC4("deployment"), { op: "addElement", elementType: "person" }).outcome).toMatchObject({ committed: false, rejection: { reason: "notOfferedInKind" } });
  });

  it("refuses a parent that does not exist", () => {
    expect(commit(emptyC4("context"), { op: "addElement", elementType: "person", parentId: 99 }).outcome).toMatchObject({ committed: false, rejection: { reason: "unknownItem" } });
  });
});

describe("editing an element's text", () => {
  let start: History;
  beforeEach(() => {
    start = run(emptyC4("component"), { op: "addElement", elementType: "component-db" }, { op: "addElement", elementType: "person" });
  });

  it("replaces the label, description and technology, each in one history entry", () => {
    const edited = run(
      start,
      { op: "setLabel", itemId: 1, field: "label", text: "Orders" },
      { op: "setLabel", itemId: 1, field: "description", text: "Stores orders" },
      { op: "setLabel", itemId: 1, field: "technology", text: "Postgres" },
    );

    expect(elementOf(edited, 1)).toMatchObject({ label: "Orders", description: "Stores orders", technology: "Postgres" });
    expect(edited.past).toHaveLength(start.past.length + 3);
    expect(generate(edited.present).source).toContain('ComponentDb(e1, "Orders", "Postgres", "Stores orders")');
  });

  it("accepts an empty description and an empty technology", () => {
    const filled = run(start, { op: "setLabel", itemId: 1, field: "description", text: "d" }, { op: "setLabel", itemId: 1, field: "technology", text: "t" });

    const cleared = run(filled, { op: "setLabel", itemId: 1, field: "description", text: "" }, { op: "setLabel", itemId: 1, field: "technology", text: "" });

    expect(elementOf(cleared, 1)).toMatchObject({ description: "", technology: "" });
    expect(generate(cleared.present).source).toContain('ComponentDb(e1, "Component database")');
  });

  it.each(["", "   ", " \n\t", "​"])("refuses the blank label %j and keeps the previous one", (text) => {
    const result = commit(start, { op: "setLabel", itemId: 1, field: "label", text });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "blankLabel" } });
    expect(result.history).toBe(start);
  });

  it("refuses a technology for a Person, which has none", () => {
    const result = commit(start, { op: "setLabel", itemId: 2, field: "technology", text: "x" });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "noSuchField" } });
    expect(result.history).toBe(start);
  });

  it("refuses a field an element does not have, and an item that does not exist", () => {
    expect(commit(start, { op: "setLabel", itemId: 1, field: "text", text: "x" }).outcome).toMatchObject({ rejection: { reason: "noSuchField" } });
    expect(commit(start, { op: "setLabel", itemId: 99, field: "label", text: "x" }).outcome).toMatchObject({ rejection: { reason: "unknownItem" } });
  });

  it("is not a change when the text is what it already is", () => {
    const result = commit(start, { op: "setLabel", itemId: 1, field: "description", text: "" });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(start);
  });
});
