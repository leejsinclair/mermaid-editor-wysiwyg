// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { parseLocated } from "./mermaidParser";

// VO-013 (FR-004, SC-004): Mermaid's own parser judges pasted text and reports the line of each error, with a column.
// Lines are the document's own: front matter and directives count, and an error past the last line is on the last line.

const BROKEN: readonly (readonly [string, string, number])[] = [
  ["flowchart: unclosed bracket at the end", "flowchart TD\n  A[Unclosed", 2],
  ["flowchart: unclosed label after an arrow", "flowchart TD\n  A --> B[oops", 2],
  ["flowchart: arrow with no target", "flowchart TD\n  A -->", 2],
  ["flowchart: bad arrow on line 3", "flowchart TD\n  A --> B\n  C ==>> D", 3],
  ["flowchart: unclosed circle on line 3", "flowchart TD\n  A --> B\n  B --- ((x", 3],
  ["flowchart: unclosed diamond on line 3", "flowchart TD\n  A --> B\n  B{ decide --> C", 3],
  ["flowchart: unclosed quote", 'flowchart LR\n  A["quoted --> B', 2],
  ["flowchart: ampersand with no node", "flowchart LR\n  A --> B & ", 2],
  ["flowchart with front matter: unclosed bracket", "---\ntitle: Broken\n---\nflowchart TD\n  A[Unclosed", 5],
  ["flowchart with front matter: arrow at the end", "---\ntitle: Broken\n---\nflowchart TD\n  A --> B -->", 5],
  ["sequence: message with no text", "sequenceDiagram\n  Alice->>Bob", 2],
  ["sequence: arrow split across lines", "sequenceDiagram\n  Alice->>\n  Bob: Hi", 2],
  ["sequence: block opened and not closed", "sequenceDiagram\n  Alice->>Bob: Hi\n  loop", 3],
  ["sequence: keyword with no name", "sequenceDiagram\n  participant", 2],
  ["sequence: note with no position", "sequenceDiagram\n  Alice->>Bob: Hi\n  Note over", 3],
  ["sequence: unclosed quote", 'sequenceDiagram\n  Alice-x->Bob: "unclosed', 2],
  ["sequence with a directive: arrow with no text", '%%{init: {"theme": "dark"}}%%\nsequenceDiagram\n  Alice->>Bob', 3],
  ["C4 context: unclosed macro at the end", 'C4Context\n  Person(user, "User"', 2],
  ["C4 container: boundary not closed", 'C4Container\n  System_Boundary(sys, "Sys") {\n    Container(a, "A")', 3],
  ["C4 context: unclosed relationship", 'C4Context\n  Rel(a, b, "uses"', 2],
  ["C4 deployment: unclosed node", 'C4Deployment\n  Deployment_Node(n, "Node"', 2],
  ["C4 with front matter: unclosed macro", '---\ntitle: Broken\n---\nC4Context\n  Person(user, "User"', 5],
  ["C4 dynamic: unclosed relation index", "C4Dynamic\n  RelIndex(1, a, b", 2],
];

describe("parseLocated", () => {
  it.each(BROKEN)("rejects %s with the message, the line and a column", async (_name, source, line) => {
    const outcome = await parseLocated(source);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.message.length).toBeGreaterThan(0);
    expect(outcome.line).toBe(line);
    expect(outcome.column).toBeGreaterThanOrEqual(1);
  });

  it("accepts a valid flowchart", async () => {
    expect(await parseLocated("flowchart TD\n  A --> B")).toEqual({ ok: true });
  });
});
