import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "../model/limits";
import type { ReadDeps } from "./outcome";
import { readDocument } from "./readDocument";

// VO-041 (FR-016, EC-08): a document over the size limit is refused before anything else is read; a C4 document nested
// deeper than the editor allows is refused. Each refusal states its limit and yields no diagram.

/** Dependencies that must not be called: a refusal made before parsing never reaches them. */
const untouched: ReadDeps = {
  parse: () => Promise.reject(new Error("parse must not run for a refused document")),
  snapshotFlowchart: () => Promise.reject(new Error("snapshot must not run for a refused document")),
  snapshotSequence: () => Promise.reject(new Error("snapshot must not run for a refused document")),
};

/** Dependencies for a document Mermaid accepts. */
const accepting: ReadDeps = {
  parse: () => Promise.resolve({ ok: true }),
  snapshotFlowchart: () => Promise.reject(new Error("no flowchart in this test")),
  snapshotSequence: () => Promise.reject(new Error("no sequence in this test")),
};

describe("readDocument: limits", () => {
  it("refuses text over the file limit before anything is read", async () => {
    const outcome = await readDocument("a".repeat(MAX_FILE_BYTES + 1), untouched);
    expect(outcome).toEqual({ kind: "refused", reason: "tooLarge", limit: MAX_FILE_BYTES });
  });

  it("refuses a C4 document nested deeper than the editor allows, naming the limit", async () => {
    const depth = 51;
    const opens = Array.from({ length: depth }, (_, index) => `  Boundary(b${String(index)}, "B${String(index)}") {`);
    const closes = Array.from({ length: depth }, () => "  }");
    const text = ["C4Context", ...opens, ...closes].join("\n");
    const outcome = await readDocument(text, accepting);
    expect(outcome).toEqual({ kind: "refused", reason: "tooDeep", limit: 50 });
  });
});

// VO-033 (FR-011): the same text gives the same ids and the same diagram every time, and every id is unique.

const flowchartText = "flowchart LR\n  A[Start] --> B{Ok?}\n  B -->|yes| C\n  B -->|no| A";

const flowchartDeps: ReadDeps = {
  parse: () => Promise.resolve({ ok: true }),
  snapshotFlowchart: () =>
    Promise.resolve({
      direction: "LR",
      vertices: [
        { key: "A", text: "Start", shape: "square" },
        { key: "B", text: "Ok?", shape: "diamond" },
        { key: "C", text: "C", shape: "" },
      ],
      edges: [
        { from: "A", to: "B", text: "", arrow: "arrow_point", stroke: "normal" },
        { from: "B", to: "C", text: "yes", arrow: "arrow_point", stroke: "normal" },
        { from: "B", to: "A", text: "no", arrow: "arrow_point", stroke: "normal" },
      ],
      subgraphs: [],
    }),
  snapshotSequence: () => Promise.reject(new Error("no sequence in this test")),
};

describe("readDocument: determinism", () => {
  it("gives identical diagrams and unique ids when the same text is read twice", async () => {
    const first = await readDocument(flowchartText, flowchartDeps);
    const second = await readDocument(flowchartText, flowchartDeps);
    expect(second).toEqual(first);
    expect(first.kind).toBe("ready");
    if (first.kind !== "ready" || first.diagram.type !== "flowchart") return;
    const { nodes, connections } = first.diagram.content;
    const ids = [...nodes.map((node) => node.id), ...connections.map((connection) => connection.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// VO-037 (FR-012): a Markdown file with several Mermaid blocks imports the first; each further block is in the report as
// ignored, with the line its fence is on and its first line.

describe("ignored blocks", () => {
  it("lists each further Mermaid block in the report as ignored, with its starting line and first line", async () => {
    const markdown = [
      "# Doc",
      "",
      "```mermaid",
      "flowchart TD",
      "  A --> B",
      "```",
      "",
      "```mermaid",
      "sequenceDiagram",
      "  Alice->>Bob: Hi",
      "```",
    ].join("\n");
    const outcome = await readDocument(markdown, flowchartDeps);
    expect(outcome.kind).toBe("ready");
    if (outcome.kind !== "ready") return;
    const ignored = outcome.report.filter((entry) => entry.category === "ignored");
    expect(ignored.map((entry) => [entry.line, entry.construct])).toEqual([[8, "mermaid block"]]);
    expect(ignored[0]?.reason).toContain("sequenceDiagram");
  });
});

// VO-042 (FR-016, EC-06): a document of an unsupported type is reduced to that type's name; a C4 document whose kind cannot
// be found, and one that mixes kinds, is refused before parsing, naming the kinds found.
describe("readDocument: C4 kinds and unsupported types", () => {
  it("reduces a document of an unsupported type to the type it names", async () => {
    expect(await readDocument("classDiagram\n  class Animal", accepting)).toEqual({ kind: "unsupported", found: "classDiagram" });
  });

  it("refuses a C4 document whose kind cannot be found, before parsing", async () => {
    expect(await readDocument("C4Diagram\n  title Test", untouched)).toEqual({ kind: "refused", reason: "kindUndetected" });
  });

  it("refuses a C4 document that mixes kinds, naming the kinds found in order", async () => {
    const mixed = 'C4Context\n  title A\n  Person(a, "A")\nC4Container\n  Container(b, "B")';
    expect(await readDocument(mixed, untouched)).toEqual({ kind: "refused", reason: "kindsMixed", kinds: ["context", "container"] });
  });
});
