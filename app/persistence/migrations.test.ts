import { describe, expect, it } from "vitest";
import { fromRecord, parseFile } from "./codec";

// VO-089 (EC-12): a stored record and a file at an older format version are upgraded, step by step, to a diagram
// identical in meaning. The synthetic version 0 had no item counter; version 1 added it.

const content = {
  nodes: [
    { id: 1, shape: "rectangle", label: "A", x: 0, y: 0 },
    { id: 4, shape: "circle", label: "B", x: 400, y: 0 },
  ],
  connections: [{ id: 6, from: 1, to: 4, line: "solid", ending: "arrow", label: "" }],
};

const v0 = { name: "Old", type: "flowchart", content };
const v1 = { ...v0, nextId: 7 };

describe("a file at format version 0", () => {
  it("is upgraded to the same diagram as the current version, with the counter derived", () => {
    const old = parseFile(JSON.stringify({ format: "mermaid-editor-wysiwyg", formatVersion: 0, diagram: v0 }));
    const current = parseFile(JSON.stringify({ format: "mermaid-editor-wysiwyg", formatVersion: 1, diagram: v1 }));

    expect(old).toEqual({ ok: true, model: v1 });
    expect(old).toEqual(current);
  });

  it("is still refused when it is damaged, after the upgrade", () => {
    const damaged = { ...v0, content: { ...content, connections: [{ ...content.connections[0], to: 99 }] } };

    const result = parseFile(JSON.stringify({ format: "mermaid-editor-wysiwyg", formatVersion: 0, diagram: damaged }));

    expect(result).toMatchObject({ ok: false, reason: "invalidDiagram" });
  });
});

describe("a stored record at format version 0", () => {
  it("is upgraded to a diagram identical in meaning, keeping its id and last-changed time", () => {
    const record = { id: "d1", name: "Old", type: "flowchart", changedAt: "2026-01-01T00:00:00.000Z", formatVersion: 0, model: v0 };

    expect(fromRecord(record)).toEqual({ ok: true, diagram: { ...v1, id: "d1", changedAt: "2026-01-01T00:00:00.000Z" } });
  });
});

describe("the current version", () => {
  it("is not altered: a missing counter at version 1 is still a problem", () => {
    const result = parseFile(JSON.stringify({ format: "mermaid-editor-wysiwyg", formatVersion: 1, diagram: v0 }));

    expect(result).toMatchObject({ ok: false, reason: "invalidDiagram" });
  });
});
