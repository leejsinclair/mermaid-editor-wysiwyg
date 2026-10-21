// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { parseLocated } from "../editor/mermaidParser";
import { snapshotFlowchart, snapshotSequence } from "../editor/mermaidSnapshot";
import type { ReadDeps } from "./outcome";
import { readDocument } from "./readDocument";

// Feature 006 (FR-006, FR-007): a `%%{ … }%%` directive may span lines, and the parser never sees a second diagram that
// the report says was not imported. Mermaid's own parser judges the text, as it does for every import.

const realDeps: ReadDeps = { parse: parseLocated, snapshotFlowchart, snapshotSequence };

const directiveEntries = (outcome: Awaited<ReturnType<typeof readDocument>>) =>
  outcome.kind === "ready" ? outcome.report.filter((entry) => entry.construct === "directive") : [];

describe("directives", () => {
  // VO-011 (FR-006, US3-AS1, EC-04)
  it.each([
    ["three lines", '%%{init: {\n  "theme": "dark"\n}}%%\nflowchart TD\n  A --> B'],
    ["one line", '%%{init: {"theme": "dark"}}%%\nflowchart TD\n  A --> B'],
  ])("imports a flowchart behind a directive on %s, reporting the directive once on line 1", async (_how, text) => {
    const outcome = await readDocument(text, realDeps);
    expect(outcome.kind).toBe("ready");
    if (outcome.kind !== "ready") return;
    expect(outcome.diagram.type).toBe("flowchart");
    expect(directiveEntries(outcome)).toEqual([expect.objectContaining({ line: 1, category: "ignored" })]);
    expect(outcome.report.filter((entry) => entry.line > 1 && entry.line < 4)).toEqual([]);
  });

  // VO-013 (FR-006, US3-AS4)
  it("reports a directive that is never closed on its first line, taking no type from the text inside it", async () => {
    const outcome = await readDocument("%%{init: {\nflowchart TD\n  A --> B", realDeps);
    expect(outcome).toMatchObject({ kind: "invalid", line: 1 });
    expect(outcome.kind === "invalid" ? outcome.message : "").toContain("never closed");
  });
});


describe("a second diagram header", () => {
  // VO-014 (FR-007, US3-AS3, EC-08)
  it("imports only the first diagram, and the parser never sees the second", async () => {
    const outcome = await readDocument("flowchart TD\n  A --> B\nflowchart LR\n  C --> D --> E", realDeps);
    expect(outcome.kind).toBe("ready");
    if (outcome.kind !== "ready" || outcome.diagram.type !== "flowchart") return;
    expect(outcome.diagram.content.nodes.map((node) => node.label)).toEqual(["A", "B"]);
    expect(outcome.report).toContainEqual(expect.objectContaining({ line: 3, category: "ignored" }));
  });

  it("does not take a directive line that starts with a diagram word for a header", async () => {
    const outcome = await readDocument("%%{init: {\nflowchart: { curve: 'basis' }\n}}%%\nflowchart TD\n  A --> B", realDeps);
    expect(outcome.kind).toBe("ready");
    if (outcome.kind !== "ready" || outcome.diagram.type !== "flowchart") return;
    expect(outcome.diagram.content.nodes.map((node) => node.label)).toEqual(["A", "B"]);
    expect(outcome.report.filter((entry) => entry.construct === "mermaid block")).toEqual([]);
  });
});

// VO-015 (FR-007, EC-05, DC-02): further Markdown blocks are still listed as ignored, and a C4 block holding two
// different kinds is still refused (005 EC-06) even though the parser now reads only the first diagram.
describe("blocks and kinds around a second header", () => {
  it("imports the first diagram of a Markdown file's first block and lists the second header and both further blocks", async () => {
    const text = [
      "# Notes",
      "```mermaid",
      "flowchart TD",
      "  A --> B",
      "flowchart LR",
      "  C --> D",
      "```",
      "```mermaid",
      "sequenceDiagram",
      "```",
      "```mermaid",
      "flowchart TD",
      "```",
    ].join("\n");
    const outcome = await readDocument(text, realDeps);
    expect(outcome.kind).toBe("ready");
    if (outcome.kind !== "ready" || outcome.diagram.type !== "flowchart") return;
    expect(outcome.diagram.content.nodes.map((node) => node.label)).toEqual(["A", "B"]);
    expect(outcome.report.filter((entry) => entry.construct === "mermaid block").map((entry) => entry.line)).toEqual([5, 8, 11]);
  });

  it("still refuses a C4 block that holds two different kinds, naming both", async () => {
    const outcome = await readDocument('C4Context\n  Person(a, "A")\nC4Container\n  Container(b, "B", "T")', realDeps);
    expect(outcome).toEqual({ kind: "refused", reason: "kindsMixed", kinds: ["context", "container"] });
  });
});
