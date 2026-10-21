import { describe, expect, it } from "vitest";
import { detectType, splitDocument } from "./document";

// VO-005 (FR-002, US1-AS5): the diagram type is read from the first significant line, after blank lines,
// comments, front matter and directives.

describe("detectType", () => {
  it("reads flowchart and graph headers", () => {
    expect(detectType("flowchart TD\n  A --> B")).toEqual({ type: "flowchart" });
    expect(detectType("graph LR\n  A --> B")).toEqual({ type: "flowchart" });
  });

  it("reads the sequence header", () => {
    expect(detectType("sequenceDiagram\n  Alice->>Bob: Hi")).toEqual({ type: "sequence" });
  });

  it("reads each C4 header as its kind", () => {
    expect(detectType("C4Context\n  title x")).toEqual({ type: "c4", kind: "context" });
    expect(detectType("C4Container\n  title x")).toEqual({ type: "c4", kind: "container" });
    expect(detectType("C4Component\n  title x")).toEqual({ type: "c4", kind: "component" });
    expect(detectType("C4Dynamic\n  title x")).toEqual({ type: "c4", kind: "dynamic" });
    expect(detectType("C4Deployment\n  title x")).toEqual({ type: "c4", kind: "deployment" });
  });

  it("skips blank lines and %% comments before the header", () => {
    expect(detectType("\n\n%% a comment\n\n  flowchart TD\n  A --> B")).toEqual({ type: "flowchart" });
  });

  it("skips a front-matter block before the header", () => {
    expect(detectType("---\ntitle: Login\n---\nsequenceDiagram\n  A->>B: x")).toEqual({ type: "sequence" });
  });

  it("skips a %%{init}%% directive before the header", () => {
    expect(detectType('%%{init: {"theme": "dark"}}%%\nflowchart LR\n  A --> B')).toEqual({ type: "flowchart" });
  });

  it("reports an unsupported header by its word", () => {
    expect(detectType("classDiagram\n  class A")).toEqual({ type: "unsupported", found: "classDiagram" });
  });

  it("finds nothing in empty text or text with only blank lines", () => {
    expect(detectType("")).toEqual({ type: "none" });
    expect(detectType("  \n\n  ")).toEqual({ type: "none" });
  });
});

// VO-037 (FR-012, EC-02): a Markdown text is split at its Mermaid fences; the first block is imported and each further block is listed as ignored.

describe("splitDocument", () => {
  const markdown = [
    "# Architecture",
    "",
    "```mermaid",
    "flowchart TD",
    "  A --> B",
    "```",
    "",
    "Some prose.",
    "",
    "```mermaid",
    "sequenceDiagram",
    "  Alice->>Bob: Hi",
    "```",
    "",
    "```mermaid",
    "graph LR",
    "  C --> D",
    "```",
  ].join("\n");

  it("returns the first Mermaid block with its line offset and lists the other two as ignored", () => {
    const split = splitDocument(markdown);
    expect(split.text).toBe("flowchart TD\n  A --> B");
    expect(split.lineOffset).toBe(3);
    expect(split.ignored).toEqual([
      { line: 10, firstLine: "sequenceDiagram" },
      { line: 15, firstLine: "graph LR" },
    ]);
  });

  it("returns text with no fence as one block with no ignored entries", () => {
    const split = splitDocument("flowchart TD\n  A --> B");
    expect(split.text).toBe("flowchart TD\n  A --> B");
    expect(split.lineOffset).toBe(0);
    expect(split.ignored).toEqual([]);
  });

  it("returns the front-matter title with its quotes removed", () => {
    const split = splitDocument('---\ntitle: "Login flow"\n---\nflowchart TD\n  A --> B');
    expect(split.frontMatter).toEqual({ title: "Login flow" });
    expect(split.text).toBe('---\ntitle: "Login flow"\n---\nflowchart TD\n  A --> B');
  });

  it("lists a second diagram header inside one block as ignored", () => {
    const split = splitDocument("flowchart TD\n  A --> B\nsequenceDiagram\n  Alice->>Bob: Hi");
    expect(split.text).toBe("flowchart TD\n  A --> B\nsequenceDiagram\n  Alice->>Bob: Hi");
    expect(split.ignored).toEqual([{ line: 3, firstLine: "sequenceDiagram" }]);
  });
});
