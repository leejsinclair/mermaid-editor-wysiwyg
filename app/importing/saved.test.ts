// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { parseLocated } from "../editor/mermaidParser";
import { snapshotFlowchart, snapshotSequence } from "../editor/mermaidSnapshot";
import type { Diagram } from "../model/types";
import { CURRENT_FORMAT_VERSION } from "../persistence/migrations";
import { fromRecord, toFile, toRecord } from "../persistence/codec";
import { openFile } from "../persistence/openFile";
import type { ReadDeps } from "./outcome";
import { readDocument } from "./readDocument";

// VO-035 (FR-011, SC-006, DC-01): an imported diagram is saved and opened like any other: it passes the same checks,
// carries the current format version, and equals what was imported.

const deps: ReadDeps = { parse: parseLocated, snapshotFlowchart, snapshotSequence };

const documents: readonly (readonly [string, string])[] = [
  ["flowchart", "flowchart LR\n  A[Start] --> B{Ok?}\n  B -->|yes| C\n  B -->|no| A"],
  ["sequence", "sequenceDiagram\n  participant A as Alice\n  actor B\n  A->>B: Hi\n  B-->>A: Hello"],
  ["C4 container", 'C4Container\n  title Shop\n  Person(user, "User")\n  System_Boundary(sys, "Shop") {\n    Container(web, "Web", "React", "UI")\n  }\n  Rel(user, web, "Browses", "HTTPS")'],
];

/** The diagram as it would be stored: given an id and a change time, as the library does on save. */
function stored(diagram: Diagram): Diagram {
  return { ...diagram, id: "stored-1", changedAt: "2026-10-20T10:00:00.000Z" };
}

async function imported(text: string): Promise<Diagram> {
  const outcome = await readDocument(text, deps);
  expect(outcome.kind).toBe("ready");
  if (outcome.kind !== "ready") throw new Error("the document did not import");
  return outcome.diagram;
}

describe("an imported diagram, saved and opened again", () => {
  it.each(documents)("is written as a file and opened again unchanged (%s)", async (_name, text) => {
    const diagram = await imported(text);
    const body = JSON.stringify(toFile(diagram));
    const opened = await openFile({ size: new TextEncoder().encode(body).byteLength, text: () => Promise.resolve(body) });
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    expect(opened.model).toEqual(toFile(diagram).diagram);
    expect(JSON.parse(body)).toMatchObject({ formatVersion: CURRENT_FORMAT_VERSION });
  });

  it.each(documents)("is saved as a record and loaded again unchanged (%s)", async (_name, text) => {
    const diagram = stored(await imported(text));
    const record = toRecord(diagram);
    expect(record.formatVersion).toBe(CURRENT_FORMAT_VERSION);
    const loaded = fromRecord(JSON.parse(JSON.stringify(record)));
    expect(loaded).toEqual({ ok: true, diagram });
  });
});
