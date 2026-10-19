import { describe, expect, it } from "vitest";
import { C4_KINDS } from "../model/c4/catalogue";
import { addConnection, addNode } from "../model/flowchart/apply";
import { newDiagram } from "../model/newDiagram";
import { addMessage, addParticipant, reorder } from "../model/sequence/apply";
import type { Diagram, FlowchartDiagram, SequenceDiagram } from "../model/types";
import { fullDiagram } from "../testing/c4Builder";
import { fromRecord, parseFile, toFile, toRecord } from "./codec";

// VO-076 (FR-052): a diagram written to the stored form and to the file form reads back identical, and neither
// form holds Mermaid source or undo history. Flowchart, Sequence and the five C4 kinds.

function flowchart(): FlowchartDiagram {
  let diagram = { ...newDiagram("abc", "flowchart"), name: "Orders ✓", changedAt: "2026-10-18T10:00:00.000Z" } as FlowchartDiagram;
  diagram = addNode(diagram, "rectangle", { x: -40, y: 12.5 });
  diagram = addNode(diagram, "hexagon", { x: 400, y: 300 });
  return addConnection(diagram, 1, 2, "thick", "both", "multi\nline \"quoted\"");
}

const walk = (value: unknown, found: string[] = []): string[] => {
  if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      found.push(key);
      walk(child, found);
    }
  }
  return found;
};

describe("the stored form", () => {
  it("reads back the same diagram, id and last-changed time included", () => {
    const diagram = flowchart();

    const result = fromRecord(toRecord(diagram));

    expect(result).toEqual({ ok: true, diagram });
  });

  it("holds the fields the saved list needs, the format version and the model, and no source or history", () => {
    const record = toRecord(flowchart());

    expect(record).toMatchObject({ id: "abc", name: "Orders ✓", type: "flowchart", changedAt: "2026-10-18T10:00:00.000Z", formatVersion: 1 });
    expect(record.kind).toBeUndefined();
    expect(walk(record)).not.toEqual(expect.arrayContaining(["source", "history", "past", "future"]));
  });

  it("survives a trip through JSON, as IndexedDB's structured clone would make it", () => {
    const diagram = flowchart();

    expect(fromRecord(JSON.parse(JSON.stringify(toRecord(diagram))))).toEqual({ ok: true, diagram });
  });

  it("refuses a record that is damaged, saying why", () => {
    const record = { ...toRecord(flowchart()), model: { name: "x", type: "flowchart", nextId: 1, content: {} } };

    expect(fromRecord(record)).toMatchObject({ ok: false });
  });

  it("refuses something that is not a record", () => {
    expect(fromRecord(null)).toMatchObject({ ok: false });
    expect(fromRecord({ id: 5 })).toMatchObject({ ok: false });
  });
});

describe("the file form", () => {
  it("is the editor's format without id and last-changed time, and reads back as the same diagram", () => {
    const diagram = flowchart();

    const file = toFile(diagram);
    const parsed = parseFile(JSON.stringify(file));

    expect(file).toMatchObject({ format: "mermaid-editor-wysiwyg", formatVersion: 1 });
    expect(file.diagram).not.toHaveProperty("changedAt");
    expect(file.diagram).not.toHaveProperty("id");
    expect(parsed).toEqual({ ok: true, model: { name: diagram.name, type: "flowchart", nextId: diagram.nextId, content: diagram.content } });
  });

  it("holds no Mermaid source or undo history", () => {
    expect(walk(toFile(flowchart()))).not.toEqual(expect.arrayContaining(["source", "history", "past", "future"]));
    expect(JSON.stringify(toFile(flowchart()))).not.toContain("flowchart TD");
  });

  it("keeps every other diagram type's model as it is", () => {
    const sequence = newDiagram("s", "sequence");
    const c4 = newDiagram("c", "c4", "deployment");

    for (const diagram of [sequence, c4] as Diagram[]) {
      const parsed = parseFile(JSON.stringify(toFile(diagram)));
      expect(parsed.ok && parsed.model.name).toBe(diagram.name);
    }
  });
});

/** Three participants (two with the same label), messages in a chosen order, a self-message and every role. */
function sequence(): SequenceDiagram {
  let diagram = { ...newDiagram("seq", "sequence"), name: "Login ✓", changedAt: "2026-10-18T11:00:00.000Z" } as SequenceDiagram;
  diagram = addParticipant(diagram, "actor");
  diagram = addParticipant(diagram, "participant");
  diagram = addParticipant(diagram, "participant", 0);
  diagram = {
    ...diagram,
    content: { ...diagram.content, participants: diagram.content.participants.map((participant) => ({ ...participant, label: participant.id === 3 ? "Participant" : "Same" })) },
  };
  diagram = addMessage(diagram, 1, 2, "solid-arrow", "first\nline \"two\"");
  diagram = addMessage(diagram, 2, 2, "dashed-cross", "self");
  diagram = addMessage(diagram, 3, 1, "solid-async", "inserted first", 0);
  return reorder(diagram, 4, 2);
}

describe("a sequence diagram", () => {
  it("reads back from the stored form with its participant order, message order, ids and counter", () => {
    const diagram = sequence();

    const result = fromRecord(JSON.parse(JSON.stringify(toRecord(diagram))));

    expect(result).toEqual({ ok: true, diagram });
    expect(result.ok && result.diagram.type === "sequence" && result.diagram.content.participants.map((participant) => participant.id)).toEqual([3, 1, 2]);
    expect(result.ok && result.diagram.type === "sequence" && result.diagram.content.messages.map((message) => message.id)).toEqual([6, 5, 4]);
  });

  it("reads back from the file form without id or last-changed time", () => {
    const diagram = sequence();

    const parsed = parseFile(JSON.stringify(toFile(diagram)));

    expect(parsed).toEqual({ ok: true, model: { name: diagram.name, type: "sequence", nextId: diagram.nextId, content: diagram.content } });
  });

  it("holds no Mermaid source or undo history in either form", () => {
    for (const stored of [toRecord(sequence()), toFile(sequence())]) {
      expect(walk(stored)).not.toEqual(expect.arrayContaining(["source", "history", "past", "future"]));
      expect(JSON.stringify(stored)).not.toContain("sequenceDiagram");
    }
  });

  it("is stored with its type and no C4 kind for the saved list", () => {
    expect(toRecord(sequence())).toMatchObject({ id: "seq", type: "sequence", name: "Login ✓", formatVersion: 1 });
    expect(toRecord(sequence()).kind).toBeUndefined();
  });
});

describe.each(C4_KINDS)("a %s diagram", (kind) => {
  const diagram = (): Diagram => ({ ...fullDiagram(kind), id: "c4id", name: "Everything ✓", changedAt: "2026-10-18T11:00:00.000Z" });

  it("is stored with its type and kind for the saved list, and reads back identical", () => {
    expect(toRecord(diagram())).toMatchObject({ id: "c4id", type: "c4", kind, name: "Everything ✓", formatVersion: 1 });
    expect(fromRecord(JSON.parse(JSON.stringify(toRecord(diagram()))))).toEqual({ ok: true, diagram: diagram() });
  });

  it("reads back from the file form with its tree, nesting, relationships, order and title, but no id or last-changed time", () => {
    const parsed = parseFile(JSON.stringify(toFile(diagram())));

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const model = Object.fromEntries(Object.entries(diagram()).filter(([key]) => key !== "id" && key !== "changedAt"));
    expect(parsed.model).toEqual(model);
    expect(JSON.stringify(toFile(diagram()))).not.toContain("c4id");
  });

  it("holds no Mermaid source or undo history in either form", () => {
    for (const form of [toRecord(diagram()), toFile(diagram())]) expect(walk(form)).not.toEqual(expect.arrayContaining(["source", "history", "past", "future"]));
  });
});
