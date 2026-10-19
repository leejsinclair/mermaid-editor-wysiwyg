// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { C4_KINDS } from "../model/c4/catalogue";
import type { C4Diagram, Connection, FlowchartDiagram, Node, SequenceDiagram } from "../model/types";
import { boundary, c4Diagram, element, node, relationship } from "../testing/c4Builder";
import { readC4, readFlowchart, readSequence } from "../testing/mermaidReadback";
import { generate } from "./generate";

// VO-017 (SC-003, EC-03): every label field of every type, set to each test text, gives source that Mermaid's
// parser accepts with exactly the expected items, and the parser's reading decodes to the text exactly as typed.
// Flowchart node and connection labels, Sequence participant labels and message text, and every C4 text field.

const PUNCTUATION = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

export const TEST_TEXTS: readonly (readonly [string, string])[] = [
  ["every ASCII punctuation character", PUNCTUATION],
  ["the SC-003 characters", "\" ' [ ] ( ) { } < > # ; : | & % /"],
  ["a backtick", "a`b``c"],
  ["a backslash", "a\\b\\\\c\\"],
  ["double percent", "50%% off %%comment"],
  ["an arrow", "a --> b --- c ==> d"],
  ["the keyword end", "end"],
  ["the keyword End inside text", "the End of it"],
  ["markdown-like text", "**bold** _italic_ `code` # heading - item [link](http://example.com) > quote"],
  ["math", "$$x^2$$ and $y$"],
  ["emoji", "😀 party 🎉 👨\u200d👩\u200d👧"],
  ["non-Latin script", "日本語 Привет مرحبا שלום"],
  ["a typed line-break tag", "one<br/>two<br>three"],
  ["a line break", "one\ntwo"],
  ["a carriage return", "one\rtwo"],
  ["a CRLF line break", "one\r\ntwo"],
  ["a U+2028 line break", "one\u2028two"],
  ["several blank lines", "one\n\n\nfour"],
  ["leading and trailing spaces", "  padded  "],
  ["tabs and NBSP at line ends", "tab\t\nnbsp\u00a0\nend\t"],
  ["a Mermaid directive", "%%{init: {'theme':'dark'}}%%"],
  ["Mermaid statements", "graph TD\nsubgraph x\nclick A call f()\nclassDef a fill:#f00\nstyle A fill:#fff"],
  ["an entity-like text", "&amp; &#35; #quot; #59;"],
];

/** What the parser should read back: line breaks of every kind become one line feed. */
const typedAs = (text: string) => text.replace(/\r\n|[\r\u2028\u2029]/g, "\n");

function diagramWith(text: string): FlowchartDiagram {
  const nodes: Node[] = [
    { id: 1, shape: "rectangle", label: text, x: 0, y: 0 },
    { id: 2, shape: "circle", label: "B", x: 400, y: 0 },
  ];
  const connections: Connection[] = [{ id: 3, from: 1, to: 2, line: "solid", ending: "arrow", label: text }];
  return {
    id: "d1",
    name: "Untitled flowchart",
    type: "flowchart",
    nextId: 4,
    changedAt: "",
    content: { nodes, connections },
  };
}

describe("a flowchart label set to each test text", () => {
  it.each(TEST_TEXTS)("round-trips through Mermaid's parser: %s", async (_name, text) => {
    const { vertices, edges } = await readFlowchart(generate(diagramWith(text)).source);

    expect(vertices.map(({ id, text: read }) => [id, read])).toEqual([
      ["n1", typedAs(text)],
      ["n2", "B"],
    ]);
    expect(edges.map(({ from, to, text: read }) => [from, to, read])).toEqual([["n1", "n2", typedAs(text)]]);
  });
});

function sequenceWith(text: string): SequenceDiagram {
  return {
    id: "d1",
    name: "Untitled sequence diagram",
    type: "sequence",
    nextId: 5,
    changedAt: "",
    content: {
      participants: [
        { id: 1, role: "participant", label: text },
        { id: 2, role: "actor", label: "B" },
      ],
      messages: [{ id: 3, from: 1, to: 2, style: "solid-arrow", text }],
    },
  };
}

describe("a sequence participant label and message text set to each test text", () => {
  it.each(TEST_TEXTS)("round-trips through Mermaid's parser: %s", async (_name, text) => {
    const { actors, messages } = await readSequence(generate(sequenceWith(text)).source);

    expect(actors.map(({ id, label }) => [id, label])).toEqual([
      ["p1", typedAs(text)],
      ["p2", "B"],
    ]);
    expect(messages.map(({ from, to, text: read }) => [from, to, read])).toEqual([["p1", "p2", typedAs(text)]]);
  });
});

/** Every text field of a C4 diagram holds the text: element, boundary and node labels and details, relationship, title. */
function c4With(text: string, kind: C4Diagram["kind"]): C4Diagram {
  if (kind === "deployment") {
    const tree = [
      node(1, [element(2, "container", text, { description: text, technology: text })], text),
      element(3, "container", "B", { description: "", technology: "" }),
    ];
    return c4Diagram(kind, tree.map((item) => (item.item === "deployment-node" ? { ...item, description: text, technology: text } : item)), [{ ...relationship(10, 2, 3), label: text, technology: text }], text);
  }
  const tree = [boundary(1, "generic", [element(2, "person", text, { description: text })], text), element(3, "person", "B", { description: "" })];
  return c4Diagram(kind, tree, [{ ...relationship(10, 2, 3), label: text, technology: text }], text);
}

describe.each(C4_KINDS)("a %s diagram's text fields set to each test text", (kind) => {
  it.each(TEST_TEXTS)("round-trips through Mermaid's parser: %s", async (_name, text) => {
    const read = await readC4(generate(c4With(text, kind)).source);
    const typed = typedAs(text);

    expect(read.title).toBe(typed);
    expect(read.relationships.map(({ label, technology }) => [label, technology])).toEqual([[typed, typed]]);
    if (kind === "deployment") {
      expect(read.boundaries.map(({ label, type, description }) => [label, type, description])).toEqual([[typed, typed, typed]]);
      expect(read.shapes.map(({ label, description, technology }) => [label, description, technology])).toEqual([[typed, typed, typed], ["B", "", ""]]);
    } else {
      expect(read.boundaries.map(({ label }) => label)).toEqual([typed]);
      expect(read.shapes.map(({ label, description }) => [label, description])).toEqual([[typed, typed], ["B", ""]]);
    }
  });
});
