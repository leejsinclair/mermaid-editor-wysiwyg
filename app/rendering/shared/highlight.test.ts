// @vitest-environment node
/* eslint-disable security/detect-non-literal-fs-filename -- every path is a fixed directory joined with a name read from it */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { highlightRuns, type RunKind } from "./highlight";
import { newDiagram } from "../../model/newDiagram";

// VO-022 (FR-017, US3-AS1): highlighting splits source into runs whose texts joined are exactly the source, for every corpus
// document, the generated source of each diagram type and arbitrary strings; keywords, identifiers, quoted labels, arrows and
// comments each get their own kind.

const corpus = join(__dirname, "..", "..", "importing", "corpus");
const DOCUMENTS = readdirSync(corpus)
  .filter((file) => file.endsWith(".md") && file !== "SOURCES.md")
  .map((file) => ({ file, text: readFileSync(join(corpus, file), "utf8") }));

const joined = (source: string): string => highlightRuns(source).map((run) => run.text).join("");

/** The kind of the first run whose text is `text`. */
const kindOf = (source: string, text: string): RunKind | undefined => highlightRuns(source).find((run) => run.text === text)?.kind;

describe("source highlighting", () => {
  it("never changes the text, for every corpus document", () => {
    for (const { file, text } of DOCUMENTS) expect(joined(text), file).toBe(text);
  });

  it("never changes the text of the source the editor generates for each diagram type", () => {
    for (const diagram of [newDiagram("f", "flowchart"), newDiagram("s", "sequence"), newDiagram("c", "c4", "container")]) {
      const { source } = generate(diagram);
      expect(joined(source), diagram.type).toBe(source);
    }
  });

  it("never changes arbitrary text, including unterminated quotes, comments and odd characters", () => {
    const awkward = ["", " ", '"', 'A["unterminated', "%% note\nA-->B", "A -- text --> B", "\n\n\t  \r\n", "é日本語 -->> ✓", "((()))[]{};:,#&;", "a\u0000b"];
    for (const text of awkward) expect(joined(text), JSON.stringify(text)).toBe(text);
    let seed = 12345;
    const next = (): number => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed;
    };
    const alphabet = ['"', "%", "-", ">", "<", ".", "=", "x", ")", "(", " ", "\n", "A", "b", "_", "1", "#", ";", "|", "~", "é", "\t"];
    for (let round = 0; round < 200; round += 1) {
      const text = Array.from({ length: 1 + (next() % 60) }, () => alphabet.at(next() % alphabet.length) ?? "").join("");
      expect(joined(text), JSON.stringify(text)).toBe(text);
    }
  });

  it("gives keywords, identifiers, quoted labels, arrows and comments their own kinds", () => {
    const flowchart = 'flowchart TD\n  n1["Start here"]\n  n1 --> n2\n  n1 -.-> n3\n  n2 ==> n3\n%% a comment';
    expect(kindOf(flowchart, "flowchart")).toBe("keyword");
    expect(kindOf(flowchart, "TD")).toBe("keyword");
    expect(kindOf(flowchart, "n1")).toBe("identifier");
    expect(kindOf(flowchart, '"Start here"')).toBe("string");
    expect(kindOf(flowchart, "-->")).toBe("operator");
    expect(kindOf(flowchart, "-.->")).toBe("operator");
    expect(kindOf(flowchart, "==>")).toBe("operator");
    expect(kindOf(flowchart, "%% a comment")).toBe("comment");

    const sequence = 'sequenceDiagram\n  participant p1 as "Name"\n  actor p2 as "Other"\n  p1->>p2: hello\n  p2-->>p1: back';
    expect(kindOf(sequence, "sequenceDiagram")).toBe("keyword");
    expect(kindOf(sequence, "participant")).toBe("keyword");
    expect(kindOf(sequence, "actor")).toBe("keyword");
    expect(kindOf(sequence, "as")).toBe("keyword");
    expect(kindOf(sequence, "->>")).toBe("operator");
    expect(kindOf(sequence, "-->>")).toBe("operator");

    const c4 = 'C4Context\n  title "System context"\n  Person(user, "User", "Someone")\n  Rel(user, sys, "Uses")';
    expect(kindOf(c4, "C4Context")).toBe("keyword");
    expect(kindOf(c4, "title")).toBe("keyword");
    expect(kindOf(c4, "Person")).toBe("keyword");
    expect(kindOf(c4, "Rel")).toBe("keyword");
    expect(kindOf(c4, "user")).toBe("identifier");
    expect(kindOf(c4, '"System context"')).toBe("string");
  });

  it("treats a quote that is never closed as a label to the end of its line, and a comment as a comment to the end of its line", () => {
    const text = 'A["never closed\nB --> C %% trailing';
    expect(kindOf(text, '["never closed') ?? kindOf(text, '"never closed')).toBe("string");
    expect(kindOf(text, "%% trailing")).toBe("comment");
    expect(kindOf(text, "B")).toBe("identifier");
  });
});
