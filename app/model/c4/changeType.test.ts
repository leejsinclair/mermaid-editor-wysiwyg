import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory, undo } from "../../history/history";
import { boundary, c4Diagram, c4Of, element, node, relationship } from "../../testing/c4Builder";
import { run } from "../../testing/run";
import type { C4Kind, ElementType } from "../types";
import { ELEMENT_TYPES_BY_KIND } from "./catalogue";

// VO-060: a C4 element changes type only within its family and only to a type the kind offers, keeping everything
// else, in one history entry; a boundary or Deployment node type never changes (EC-17).

/** A System (3) with a description and two relationships, inside boundary 2, in a Container diagram. */
function start(kind: C4Kind = "container", type: ElementType = "system") {
  return createHistory(
    c4Diagram(
      kind,
      [element(1, "person"), boundary(2, "system", [element(3, type, "Billing")]), element(4, "container")],
      [relationship(10, 1, 3), relationship(11, 3, 4)],
    ),
  );
}

describe("changing an element's type within its family", () => {
  it("keeps the label, description, relationships and membership, in one history entry", () => {
    const before = start("context");

    const after = run(before, { op: "changeType", itemId: 3, to: { kind: "elementType", elementType: "system-db-ext" } });

    const outer = c4Of(after).content.tree[1];
    expect(outer?.item === "boundary" && outer.children[0]).toEqual({ item: "element", id: 3, elementType: "system-db-ext", label: "Billing", description: "Description 3", technology: "" });
    expect(c4Of(after).content.relationships).toEqual(c4Of(before).content.relationships);
    expect(after.past).toHaveLength(1);
    expect(generate(after.present).source).toContain('SystemDb_Ext(e3, "Billing", "Description 3")');
    expect(undo(after).present).toEqual(before.present);
  });

  it("keeps a Container's technology when it becomes a database or a queue", () => {
    const history = run(
      createHistory(c4Diagram("container", [element(1, "container", "Orders", { technology: "Java" })])),
      { op: "changeType", itemId: 1, to: { kind: "elementType", elementType: "container-queue-ext" } },
    );

    expect(c4Of(history).content.tree[0]).toMatchObject({ elementType: "container-queue-ext", label: "Orders", technology: "Java" });
  });

  it("moves between the external and internal variants of a Person", () => {
    const history = run(start(), { op: "changeType", itemId: 1, to: { kind: "elementType", elementType: "person-ext" } });

    expect(c4Of(history).content.tree[0]).toMatchObject({ elementType: "person-ext" });
  });

  it.each(["context", "container", "component", "dynamic"] as const)("is accepted in %s for every type of the family the kind offers", (kind) => {
    const types = ELEMENT_TYPES_BY_KIND[kind].filter((type) => type.startsWith("system") || type.startsWith("container") || type.startsWith("component"));
    for (const family of ["system", "container", "component"]) {
      const members = types.filter((type) => type.startsWith(family));
      for (const to of members) {
        const from = members.find((candidate) => candidate !== to);
        if (from === undefined) continue;
        const history = createHistory(c4Diagram(kind, [element(1, from)]));
        expect(commit(history, { op: "changeType", itemId: 1, to: { kind: "elementType", elementType: to } }).outcome).toEqual({ committed: true });
      }
    }
  });

  it("is not a change when the type is the one it already has", () => {
    const history = start();

    const result = commit(history, { op: "changeType", itemId: 3, to: { kind: "elementType", elementType: "system" } });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(history);
  });
});

describe("a change that is refused", () => {
  const refused = (history: ReturnType<typeof start>, itemId: number, to: ElementType) => commit(history, { op: "changeType", itemId, to: { kind: "elementType", elementType: to } });

  it("to another family is crossFamily, naming both types", () => {
    const history = start();

    const result = refused(history, 3, "person");

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "crossFamily", details: { from: "System", to: "Person" } } });
    expect(result.history).toBe(history);
    expect(refused(history, 4, "component").outcome).toMatchObject({ rejection: { reason: "crossFamily", details: { from: "Container", to: "Component" } } });
    expect(refused(history, 1, "system").outcome).toMatchObject({ rejection: { reason: "crossFamily" } });
  });

  it.each([
    ["container", "system", "system-db"],
    ["container", "system", "system-queue-ext"],
    ["component", "container", "container-db"],
    ["component", "container", "container-queue"],
    ["dynamic", "container-ext", "container-db-ext"],
  ] as const)("to a type %s does not offer (%s to %s) is notOfferedInKind", (kind, from, to) => {
    const history = start(kind, from);

    const result = refused(history, 3, to);

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "notOfferedInKind", details: { kind } } });
    expect(result.history).toBe(history);
  });

  it("of a boundary or a Deployment node is typeFixed", () => {
    const boundaries = start();
    const deployment = createHistory(c4Diagram("deployment", [node(1, [element(2, "container")])]));

    expect(commit(boundaries, { op: "changeType", itemId: 2, to: { kind: "elementType", elementType: "system" } }).outcome).toMatchObject({ rejection: { reason: "typeFixed" } });
    expect(commit(deployment, { op: "changeType", itemId: 1, to: { kind: "elementType", elementType: "container" } }).outcome).toMatchObject({ rejection: { reason: "typeFixed" } });
  });

  it("of an item that does not exist is unknownItem", () => {
    expect(refused(start(), 99, "system-db").outcome).toMatchObject({ rejection: { reason: "unknownItem" } });
  });
});
