import { describe, expect, it } from "vitest";
import { detectType, splitDocument } from "./document";
import { scanC4, scanSequence } from "./scan";

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

  // Feature 006 (FR-007): the block ends before the second header, so the parser never reads what was not imported.
  it("lists a second diagram header inside one block as ignored, and ends the block before it", () => {
    const split = splitDocument("flowchart TD\n  A --> B\nsequenceDiagram\n  Alice->>Bob: Hi");
    expect(split.text).toBe("flowchart TD\n  A --> B");
    expect(split.ignored).toEqual([{ line: 3, firstLine: "sequenceDiagram" }]);
  });
});

// VO-012 (FR-006, US3-AS2): a sequence or C4 document behind a directive spread over several lines is detected as its own
// type, and its report holds the directive once, on its first line.
describe("a multi-line directive before a sequence or C4 header", () => {
  const directive = '%%{init: {\n  "theme": "dark",\n  "fontFamily": "serif"\n}}%%';
  const ignoredDirectives = (entries: ReturnType<typeof scanSequence>) => entries.filter((entry) => entry.construct === "directive");

  it("is skipped when a sequence diagram's type is detected, and reported once", () => {
    const text = `${directive}\nsequenceDiagram\n  Alice->>Bob: Hi`;
    expect(detectType(text)).toEqual({ type: "sequence" });
    expect(ignoredDirectives(scanSequence(text))).toEqual([expect.objectContaining({ line: 1, category: "ignored" })]);
  });

  it.each([
    ["C4Context", "context"],
    ["C4Container", "container"],
    ["C4Component", "component"],
    ["C4Dynamic", "dynamic"],
    ["C4Deployment", "deployment"],
  ] as const)("is skipped when %s is detected, and reported once", (header, kind) => {
    const text = `${directive}\n${header}\n  title x`;
    expect(detectType(text)).toEqual({ type: "c4", kind });
    expect(ignoredDirectives(scanC4(text))).toEqual([expect.objectContaining({ line: 1, category: "ignored" })]);
  });
});


// VO-028 (FR-007, PR #5): a statement that starts with a diagram word is not a header: the block keeps it and everything
// after it, and nothing is listed as ignored.
describe("a statement that starts with a diagram word", () => {
  it.each([
    ["a flowchart node named pie", "flowchart TD\npie[Chart] --> B\n  B --> C"],
    ["a flowchart node named after a C4 element", "flowchart TD\nC4Node[Service] --> B\n  B --> C"],
    ["a sequence message from a participant named graph", "sequenceDiagram\ngraph->>Bob: Next\n  Bob->>Alice: Done"],
  ])("is kept in the block: %s", (_name, text) => {
    const split = splitDocument(text);
    expect(split.text).toBe(text);
    expect(split.ignored).toEqual([]);
  });
});

// VO-029 (FR-007, EC-05, PR #5): a second header written with leading spaces still ends the block, and is listed as
// ignored on its own line.
describe("an indented second diagram header", () => {
  it("ends the block before it and is listed as ignored with its line number", () => {
    const split = splitDocument("flowchart TD\n  A --> B\n  flowchart LR\n  C --> D");
    expect(split.text).toBe("flowchart TD\n  A --> B");
    expect(split.ignored).toEqual([{ line: 3, firstLine: "flowchart LR" }]);
  });
});

// VO-030 (FR-006, PR #5): finding directives takes time that grows with the text, not with its square: 20,000 one-line
// directives are split and detected within 200 ms together.
describe("a document of many one-line directives", () => {
  it("is split and its type detected within 200 ms", () => {
    const text = [...Array.from({ length: 20000 }, () => "%%{init: {}}%%"), "flowchart TD", "  A --> B"].join("\n");
    const started = performance.now();
    splitDocument(text);
    const detected = detectType(text);
    const elapsed = performance.now() - started;
    expect(detected).toEqual({ type: "flowchart" });
    expect(elapsed).toBeLessThan(200);
  });
});
