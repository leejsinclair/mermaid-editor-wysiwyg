import { describe, expect, it } from "vitest";
import { C4_KINDS, ELEMENT_TYPES_BY_KIND } from "../model/c4/catalogue";
import { fullDiagram } from "../testing/c4Builder";
import { parseFile, toFile, type FileRefusalReason } from "./codec";

// VO-083 (FR-050, DC-04, DC-06): an invalid file is refused with its explanation and yields no diagram. Valid
// files of every type and C4 kind open exactly; unknown properties never reach the model.

const flowchart = () => ({
  name: "Orders",
  type: "flowchart",
  nextId: 6,
  content: {
    nodes: [
      { id: 1, shape: "rectangle", label: "Start", x: 0, y: 0 },
      { id: 2, shape: "circle", label: "End", x: 400, y: 0 },
    ],
    connections: [{ id: 3, from: 1, to: 2, line: "solid", ending: "arrow", label: "go" }],
  },
});

const sequence = () => ({
  name: "Login",
  type: "sequence",
  nextId: 5,
  content: {
    participants: [
      { id: 1, role: "actor", label: "User" },
      { id: 2, role: "participant", label: "Server" },
    ],
    messages: [{ id: 3, from: 1, to: 2, style: "solid-arrow", text: "log in" }],
  },
});

const element = (id: number, elementType: string, label = "Thing") => ({ item: "element", id, elementType, label, description: "", technology: "" });

const c4 = (kind: string, tree: unknown[], relationships: unknown[] = []) => ({
  name: "Context",
  type: "c4",
  kind,
  title: "",
  nextId: 20,
  content: { tree, relationships },
});

const wrap = (diagram: unknown, header: Record<string, unknown> = {}) =>
  JSON.stringify({ format: "mermaid-editor-wysiwyg", formatVersion: 1, diagram, ...header });

function refused(text: string, reason: FileRefusalReason, problem?: string) {
  const result = parseFile(text);
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.reason).toBe(reason);
  if (problem !== undefined) expect(result.message).toContain(problem);
  expect(result.message).toMatch(/Nothing was opened\.$/);
}

describe("valid files", () => {
  it("opens a flowchart, a sequence diagram and C4 diagrams of each kind", () => {
    const valid = [
      flowchart(),
      sequence(),
      c4("context", [
        { item: "boundary", id: 1, boundaryType: "enterprise", label: "Org", children: [element(2, "person"), element(3, "system-db-ext")] },
      ], [{ id: 4, from: 2, to: 3, direction: "one-way", label: "Uses", technology: "" }]),
      c4("container", [element(1, "container-queue", "Queue")]),
      c4("component", [{ item: "boundary", id: 1, boundaryType: "container", label: "B", children: [element(2, "component")] }]),
      c4("dynamic", [element(1, "person"), element(2, "system")], [{ id: 3, from: 1, to: 2, direction: "two-way", label: "Calls", technology: "" }]),
      c4("deployment", [{ item: "deployment-node", id: 1, label: "Server", description: "", technology: "", children: [element(2, "container")] }]),
    ];

    for (const diagram of valid) {
      const result = parseFile(wrap(diagram));
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.model).toMatchObject({ name: diagram.name, type: diagram.type });
    }
  });

  it("reads a sequence diagram back exactly, keeping the order of participants and messages, and drops unknown properties", () => {
    const base = sequence();
    const reversed = {
      ...base,
      nextId: 8,
      content: {
        participants: [...base.content.participants].reverse(),
        messages: [...base.content.messages, { id: 5, from: 2, to: 2, style: "dashed-async", text: "again" }, { id: 6, from: 2, to: 1, style: "dashed-open", text: "back" }].reverse(),
      },
    };
    const withExtras = { ...reversed, source: "sequenceDiagram", history: [1] };
    withExtras.content.participants[0] = { ...withExtras.content.participants[0], onclick: "alert(1)" } as never;

    const result = parseFile(wrap(withExtras));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.model).toEqual({ ...reversed, content: { participants: [{ id: 2, role: "participant", label: "Server" }, { id: 1, role: "actor", label: "User" }], messages: reversed.content.messages } });
  });

  it("opens a sequence diagram whose participants share a label, and one with a self-message", () => {
    const shared = { ...sequence(), content: { participants: [{ id: 1, role: "participant", label: "Same" }, { id: 2, role: "actor", label: "Same" }], messages: [{ id: 3, from: 2, to: 2, style: "solid-cross", text: "self" }] } };

    expect(parseFile(wrap(shared)).ok).toBe(true);
  });

  it("reads a flowchart back exactly and drops unknown properties", () => {
    const withExtras = { ...flowchart(), source: "flowchart TD", history: [1, 2] };
    withExtras.content.nodes[0] = { ...withExtras.content.nodes[0], onclick: "alert(1)" } as never;

    const result = parseFile(wrap(withExtras));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.model).toEqual(flowchart());
  });
});

describe("files that are not diagram files", () => {
  it.each(["", "not json", "{", "[1, 2"])("refuses %j as notJson", (text) => {
    refused(text, "notJson");
  });

  it.each(["[]", "null", "7", '"text"', "{}", '{"format":"other","formatVersion":1,"diagram":{}}'])("refuses %s as notEditorFile", (text) => {
    refused(text, "notEditorFile");
  });

  it.each([1.5, "1", -1, null])("refuses the format version %j as notEditorFile", (formatVersion) => {
    refused(wrap(flowchart(), { formatVersion }), "notEditorFile");
  });

  it("refuses a newer format version as newerVersion", () => {
    refused(wrap(flowchart(), { formatVersion: 2 }), "newerVersion", "newer version");
  });
});

describe("files that hold an invalid diagram", () => {
  const dangling = flowchart();
  dangling.content.connections[0] = { ...dangling.content.connections[0], to: 99 } as never;

  const CASES: readonly (readonly [string, unknown, string])[] = [
    ["a missing diagram", undefined, "diagram is missing"],
    ["a blank name", { ...flowchart(), name: " \n" }, "name needs at least one visible character"],
    ["an unknown type", { ...flowchart(), type: "gantt" }, "type is not one this editor supports"],
    ["an unsupported C4 kind", c4("system-landscape", []), "C4 kind"],
    ["a kind on a flowchart", { ...flowchart(), kind: "context" }, "C4 kind"],
    ["a title on a flowchart", { ...flowchart(), title: "T" }, "only a C4 diagram can have a title"],
    ["content that does not match the type", { ...flowchart(), content: sequence().content }, "does not match its type"],
    ["a bad item counter", { ...flowchart(), nextId: 0 }, "item counter"],
    ["a connection to a node that does not exist", dangling, "Connection 3 refers to a node that does not exist"],
    ["a duplicate id", { ...flowchart(), content: { ...flowchart().content, connections: [{ ...flowchart().content.connections[0], id: 2 }] } }, "uses an id that is already taken"],
    ["an id not below the counter", { ...flowchart(), nextId: 3 }, "not below the item counter"],
    ["a string id", { ...flowchart(), content: { ...flowchart().content, nodes: [{ ...flowchart().content.nodes[0], id: "1" }] } }, "id that is not a positive whole number"],
    ["a blank node label", { ...flowchart(), content: { ...flowchart().content, nodes: [{ ...flowchart().content.nodes[0], label: "  " }] } }, "Node 1 needs a label"],
    ["an unknown shape", { ...flowchart(), content: { ...flowchart().content, nodes: [{ ...flowchart().content.nodes[0], shape: "blob" }] } }, "Node 1 has a shape that is not offered here"],
    ["overlapping nodes", { ...flowchart(), content: { ...flowchart().content, nodes: [{ ...flowchart().content.nodes[0] }, { ...flowchart().content.nodes[1], x: 10, y: 10 }] } }, "overlaps"],
    ["a coordinate of 1e308", { ...flowchart(), content: { ...flowchart().content, nodes: [{ ...flowchart().content.nodes[0], x: 1e308 }, flowchart().content.nodes[1]] } }, "outside the supported canvas"],
    ["a coordinate that is not a number", { ...flowchart(), content: { ...flowchart().content, nodes: [{ ...flowchart().content.nodes[0], y: "0" }, flowchart().content.nodes[1]] } }, "outside the supported canvas"],
    ["a message to a participant that does not exist", { ...sequence(), content: { ...sequence().content, messages: [{ ...sequence().content.messages[0], to: 77 }] } }, "Message 3 refers to a participant that does not exist"],
    ["blank message text", { ...sequence(), content: { ...sequence().content, messages: [{ ...sequence().content.messages[0], text: "" }] } }, "Message 3 needs text"],
    ["an unknown message style", { ...sequence(), content: { ...sequence().content, messages: [{ ...sequence().content.messages[0], style: "wavy" }] } }, "Message 3 has a style that is not offered here"],
    ["a message from a participant that does not exist", { ...sequence(), content: { ...sequence().content, messages: [{ ...sequence().content.messages[0], from: 77 }] } }, "Message 3 refers to a participant that does not exist"],
    ["a blank participant label", { ...sequence(), content: { ...sequence().content, participants: [{ id: 1, role: "actor", label: "\u200b" }, sequence().content.participants[1]] } }, "Participant 1 needs a label"],
    ["an unknown participant role", { ...sequence(), content: { ...sequence().content, participants: [{ id: 1, role: "boundary", label: "User" }, sequence().content.participants[1]] } }, "Participant 1 has a role that is not offered here"],
    ["a message id equal to a participant id", { ...sequence(), content: { ...sequence().content, messages: [{ ...sequence().content.messages[0], id: 2 }] } }, "uses an id that is already taken"],
    ["an element type the kind does not offer", c4("context", [element(1, "container")]), "Element 1 has a type that is not offered here"],
    ["a boundary the kind does not offer", c4("component", [{ item: "boundary", id: 1, boundaryType: "enterprise", label: "B", children: [] }]), "Boundary 1 has a type that is not offered here"],
    ["a boundary in a Deployment diagram", c4("deployment", [{ item: "boundary", id: 1, boundaryType: "generic", label: "B", children: [] }]), "Boundary 1 is not allowed in a deployment diagram"],
    ["a deployment node outside a Deployment diagram", c4("container", [{ item: "deployment-node", id: 1, label: "N", description: "", technology: "", children: [] }]), "Deployment node 1 is not allowed in a container diagram"],
    ["the same element in two boundaries (a nesting that is not a tree)", c4("context", [
      { item: "boundary", id: 1, boundaryType: "generic", label: "A", children: [element(3, "person")] },
      { item: "boundary", id: 2, boundaryType: "generic", label: "B", children: [element(3, "person")] },
    ]), "uses an id that is already taken"],
    ["a relationship ending at a boundary", c4("context", [
      { item: "boundary", id: 1, boundaryType: "generic", label: "A", children: [] },
      element(2, "person"),
    ], [{ id: 3, from: 1, to: 2, direction: "one-way", label: "Uses", technology: "" }]), "Relationship 3 starts or ends at something that cannot be an end"],
    ["a relationship to an element that does not exist", c4("context", [element(1, "person")], [{ id: 3, from: 1, to: 50, direction: "one-way", label: "Uses", technology: "" }]), "Relationship 3 refers to an element that does not exist"],
    ["a blank relationship label", c4("context", [element(1, "person"), element(2, "person")], [{ id: 3, from: 1, to: 2, direction: "one-way", label: " ", technology: "" }]), "Relationship 3 needs a label"],
    ["technology on a type that has none", c4("context", [{ ...element(1, "person"), technology: "Java" }]), "Element 1 has a technology that is not offered here"],
  ];

  it.each(CASES)("refuses %s as invalidDiagram", (_name, diagram, problem) => {
    refused(wrap(diagram), "invalidDiagram", problem);
  });

  it("explains the first problem found in the contract's wording", () => {
    const result = parseFile(wrap(CASES[17]?.[1]));

    expect(result).toMatchObject({
      ok: false,
      reason: "invalidDiagram",
      message: "This file is damaged: Message 3 refers to a participant that does not exist. Nothing was opened.",
    });
  });

  it("refuses a deeply nested tree without overflowing the stack", () => {
    let item: unknown = element(100, "person");
    for (let id = 99; id > 0; id -= 1) item = { item: "boundary", id, boundaryType: "generic", label: "B", children: [item] };
    const deep = { ...c4("context", [item]), nextId: 200 };

    refused(wrap(deep), "invalidDiagram", "nests items too deeply");
  });
});

interface C4File {
  diagram: { nextId: number; content: { tree: { id: number; children?: unknown[] }[]; relationships: unknown[] } };
}

const ALL_TYPES = ["person", "system", "system-db", "system-queue", "container", "container-db", "container-queue", "component", "component-db", "component-queue"] as const;

describe.each(C4_KINDS)("a %s file", (kind) => {
  const everything = () => JSON.parse(JSON.stringify(toFile(fullDiagram(kind)))) as C4File;

  it("holding everything the kind offers opens exactly", () => {
    const result = parseFile(JSON.stringify(everything()));

    expect(result.ok && result.model).toMatchObject({ type: "c4", kind, title: fullDiagram(kind).title, content: fullDiagram(kind).content });
  });

  it("drops properties the model does not have, at every level", () => {
    const file = everything();
    const addNoise = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(addNoise);
      if (typeof value !== "object" || value === null) return value;
      return { ...Object.fromEntries(Object.entries(value).map(([key, child]) => [key, addNoise(child)])), extra: "<script>" };
    };

    const result = parseFile(JSON.stringify(addNoise(file)));

    expect(result.ok && result.model).toMatchObject({ content: fullDiagram(kind).content });
    expect(result.ok && JSON.stringify(result.model)).not.toContain("<script>");
  });

  it("is refused when a container holds an item with its own id, which no tree can", () => {
    const file = everything();
    const container = file.diagram.content.tree.find((item) => item.children !== undefined);
    if (container?.children === undefined) throw new Error("The diagram holds no boundary or node");
    container.children = [{ ...container }, ...container.children];

    refused(JSON.stringify(file), "invalidDiagram", "uses an id that is already taken");
  });

  it("is refused when it holds an element type the kind does not offer", () => {
    const offered: readonly string[] = ELEMENT_TYPES_BY_KIND[kind];
    const missing = ALL_TYPES.find((type) => !offered.includes(type));
    if (missing === undefined) throw new Error("Every type is offered");
    const file = everything();
    file.diagram.content = { tree: [element(99, missing)], relationships: [] };
    file.diagram.nextId = 200;

    refused(JSON.stringify(file), "invalidDiagram", "that is not offered here");
  });
});
