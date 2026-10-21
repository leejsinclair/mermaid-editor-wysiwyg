// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseLocated } from "../editor/mermaidParser";
import { snapshotFlowchart, snapshotSequence } from "../editor/mermaidSnapshot";
import { generate } from "../generation/generate";
import type { C4Item, C4Kind, Diagram, Direction } from "../model/types";
import { readDocument } from "./readDocument";

// VO-054 (SC-002, FR-009): every document in the supported corpus imports with every node, participant, element,
// connection, message and relationship present and labelled as in the document, and the generated source is accepted by
// the Mermaid parser. C4 expectations are read from the document's own macro calls. Flowchart and sequence expectations
// are written out beside the documents they describe, since their syntax has no such calls.

const realDeps = { parse: parseLocated, snapshotFlowchart, snapshotSequence };
const corpus = join(__dirname, "corpus");

const ELEMENT = /^(Person|System|Container|Component)(Db|Queue)?(_Ext)?$/;
const BOUNDARY = /^(\w+_)?Boundary$/;
const NODE = /^(Deployment_)?Node(_L|_R)?$/;
const RELATIONSHIP = /^(Rel|RelIndex|BiRel)$/;
const DIRECTION: Readonly<Record<string, Direction>> = { Rel: "one-way", RelIndex: "one-way", BiRel: "two-way" };

interface Call {
  readonly macro: string;
  readonly args: readonly string[];
}

/** Each macro call in the document, in order: its name and its arguments, quotes kept. */
function calls(text: string): Call[] {
  const found: Call[] = [];
  for (const line of text.split("\n")) {
    const match = /^(\w+)\((.*)\)( \{)?$/.exec(line.trim());
    if (match === null) continue;
    const [, macro = "", inside = ""] = match;
    const args = [...inside.matchAll(/"[^"]*"|[^,\s][^,]*/g)].map(([token = ""]) => token.trim());
    found.push({ macro, args });
  }
  return found;
}

const unquote = (arg: string): string => arg.replace(/^"|"$/g, "");
const quoted = (call: Call): string => unquote(call.args.find((arg) => arg.startsWith('"')) ?? "");
const isItem = (call: Call): boolean => ELEMENT.test(call.macro) || BOUNDARY.test(call.macro) || NODE.test(call.macro);

/** The labels of elements, boundaries and nodes in document order: the first quoted argument of each. */
function expectedLabels(all: readonly Call[]): string[] {
  return all.filter(isItem).map(quoted);
}

/** Each relationship as direction, label, from label, to label, in document order. */
function expectedRelationships(all: readonly Call[]): string[][] {
  const labelOf = new Map<string, string>();
  for (const call of all.filter(isItem)) labelOf.set(call.args[0] ?? "", quoted(call));
  return all
    .filter((call) => RELATIONSHIP.test(call.macro))
    .map((call) => {
      const [from, to] = call.macro === "RelIndex" ? [call.args[1], call.args[2]] : [call.args[0], call.args[1]];
      return [DIRECTION[call.macro] ?? "one-way", quoted(call), labelOf.get(from ?? "") ?? "?", labelOf.get(to ?? "") ?? "?"];
    });
}

/** Labels of every element, boundary and node, in document order (depth first, as they are written). */
function labelsOf(items: readonly C4Item[]): string[] {
  return items.flatMap((item) => (item.item === "element" ? [item.label] : [item.label, ...labelsOf(item.children)]));
}

function labelById(items: readonly C4Item[], labels: Map<number, string>): void {
  for (const item of items) {
    if (item.item === "element") labels.set(item.id, item.label);
    else {
      if (item.item === "deployment-node") labels.set(item.id, item.label);
      labelById(item.children, labels);
    }
  }
}

interface FlowchartExpectation {
  readonly nodes: readonly string[];
  /** From label, to label, line, ending, label; in document order. */
  readonly edges: readonly (readonly [string, string, string, string, string])[];
}

interface SequenceExpectation {
  readonly participants: readonly string[];
  /** From, to, style, text; in document order. */
  readonly messages: readonly (readonly [string, string, string, string])[];
}

const FLOWCHARTS: Readonly<Record<string, FlowchartExpectation>> = {
  "flowchart-02.md": {
    nodes: ["A", "C", "D", "B"],
    edges: [
      ["A", "C", "solid", "arrow", ""],
      ["A", "D", "solid", "arrow", ""],
      ["B", "C", "solid", "arrow", ""],
      ["B", "D", "solid", "arrow", ""],
    ],
  },
  "flowchart-06.md": {
    nodes: ["A", "B", "C"],
    edges: [
      ["A", "B", "solid", "arrow", "text"],
      ["B", "C", "solid", "arrow", "text2"],
    ],
  },
  "flowchart-hand-01.md": {
    nodes: ["Start here", "Is it ready?", "Go ahead", "Wait a while"],
    edges: [
      ["Start here", "Is it ready?", "solid", "arrow", ""],
      ["Is it ready?", "Go ahead", "solid", "arrow", "Yes"],
      ["Is it ready?", "Wait a while", "solid", "arrow", "No"],
      ["Wait a while", "Is it ready?", "solid", "arrow", ""],
    ],
  },
  "flowchart-hand-02.md": {
    nodes: ["Cache", "Database", "Client", "Logs", "Archive"],
    edges: [
      ["Cache", "Database", "thick", "arrow", ""],
      ["Client", "Cache", "dotted", "arrow", ""],
      ["Client", "Logs", "solid", "plain", ""],
      ["Logs", "Archive", "solid", "arrow", ""],
    ],
  },
  "flowchart-hand-03.md": {
    nodes: ["Read input", "Parse", "Store", "Report", "Finish"],
    edges: [
      ["Read input", "Parse", "solid", "arrow", ""],
      ["Parse", "Store", "solid", "arrow", ""],
      ["Store", "Report", "solid", "arrow", ""],
      ["Report", "Finish", "solid", "arrow", ""],
    ],
  },
  "flowchart-hand-04.md": {
    nodes: ["Quoted label, with a comma", "Second: a label", "Done"],
    edges: [
      ["Quoted label, with a comma", "Second: a label", "solid", "arrow", ""],
      ["Second: a label", "Done", "solid", "arrow", ""],
    ],
  },
};

const SEQUENCES: Readonly<Record<string, SequenceExpectation>> = {
  "sequence-hand-01.md": {
    participants: ["Client", "Server", "Cache"],
    messages: [
      ["Client", "Server", "solid-arrow", "GET /items"],
      ["Server", "Cache", "solid-arrow", "Look up items"],
      ["Cache", "Server", "dashed-arrow", "Miss"],
      ["Server", "Client", "dashed-arrow", "200 OK"],
    ],
  },
  "sequence-hand-02.md": {
    participants: ["Alice", "Bob"],
    messages: [
      ["Alice", "Bob", "solid-arrow", "Ping"],
      ["Bob", "Alice", "dashed-async", "Pong later"],
      ["Alice", "Bob", "solid-cross", "Message lost"],
      ["Bob", "Alice", "dashed-arrow", "Thanks"],
    ],
  },
};

/** The C4 kind a file is named for: c4-<kind>-NN.md. */
const c4KindOf = (file: string): C4Kind | undefined => /^c4-(context|container|component|dynamic|deployment)-\d+\.md$/.exec(file)?.[1] as C4Kind | undefined;

const FILES = readdirSync(corpus).filter((file) => file.endsWith(".md") && file !== "SOURCES.md").sort((a, b) => a.localeCompare(b));
const UNSUPPORTED_DIR = join(corpus, "unsupported");
const UNSUPPORTED = readdirSync(UNSUPPORTED_DIR).filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b));

/** The text's lines that the original does not have: each is a construct the editor does not support (VO-055). */
function addedLines(original: string, variant: string): number[] {
  const counts = new Map<string, number>();
  for (const line of original.split("\n")) counts.set(line, (counts.get(line) ?? 0) + 1);
  const added: number[] = [];
  variant.split("\n").forEach((line, index) => {
    const left = counts.get(line) ?? 0;
    if (left > 0) counts.set(line, left - 1);
    else added.push(index + 1);
  });
  return added;
}

/** The imported diagram holds what the document says, item for item (VO-054). */
function expectContent(file: string, text: string, diagram: Diagram): void {
  const kind = c4KindOf(file);
  if (kind !== undefined) {
    expect(diagram.type).toBe("c4");
    if (diagram.type !== "c4") return;
    const all = calls(text);
    expect(diagram.kind).toBe(kind);
    expect(labelsOf(diagram.content.tree)).toEqual(expectedLabels(all));
    const labels = new Map<number, string>();
    labelById(diagram.content.tree, labels);
    const actual = diagram.content.relationships.map((rel) => [rel.direction, rel.label, labels.get(rel.from) ?? "?", labels.get(rel.to) ?? "?"]);
    expect(actual).toEqual(expectedRelationships(all));
  } else if (file in FLOWCHARTS) {
    const expected = FLOWCHARTS[file];
    expect(diagram.type).toBe("flowchart");
    if (diagram.type !== "flowchart" || expected === undefined) return;
    expect(diagram.content.nodes.map((node) => node.label)).toEqual(expected.nodes);
    const labels = new Map(diagram.content.nodes.map((node) => [node.id, node.label] as const));
    expect(diagram.content.connections.map((c) => [labels.get(c.from), labels.get(c.to), c.line, c.ending, c.label])).toEqual(expected.edges);
  } else {
    const expected = SEQUENCES[file];
    expect(diagram.type).toBe("sequence");
    if (diagram.type !== "sequence" || expected === undefined) return;
    expect(diagram.content.participants.map((p) => p.label)).toEqual(expected.participants);
    const labels = new Map(diagram.content.participants.map((p) => [p.id, p.label] as const));
    expect(diagram.content.messages.map((m) => [labels.get(m.from), labels.get(m.to), m.style, m.text])).toEqual(expected.messages);
  }
}

describe("corpus: supported documents import in full (VO-054)", () => {
  it("holds at least thirty documents, each with an expectation", () => {
    expect(FILES.length).toBeGreaterThanOrEqual(30);
    for (const file of FILES) {
      expect(c4KindOf(file) !== undefined || file in FLOWCHARTS || file in SEQUENCES, file).toBe(true);
    }
  });

  for (const file of FILES) {
    it(`${file} imports with every item as written`, async () => {
      const text = readFileSync(join(corpus, file), "utf8");
      const outcome = await readDocument(text, realDeps);
      if (outcome.kind !== "ready") throw new Error(`${file} was not ready: ${outcome.kind}`);
      expectContent(file, text, outcome.diagram);
      expect((await parseLocated(generate(outcome.diagram).source)).ok).toBe(true);
    });
  }
});

// VO-055 (SC-003, data-model.md rule 2): the same documents with one unsupported construct added after the header. Every
// line the addition puts in the text is reported at its own line number; none is silent. The items still import in full.
describe("corpus: unsupported constructs are never silent (VO-055)", () => {
  it("holds at least thirty documents with unsupported constructs added", () => {
    expect(UNSUPPORTED.length).toBeGreaterThanOrEqual(30);
  });

  for (const file of UNSUPPORTED) {
    it(`${file} reports each unsupported line it adds`, async () => {
      const original = readFileSync(join(corpus, file), "utf8");
      const variant = readFileSync(join(UNSUPPORTED_DIR, file), "utf8");
      const outcome = await readDocument(variant, realDeps);
      if (outcome.kind !== "ready") throw new Error(`${file} was not ready: ${outcome.kind}`);
      const reported = new Set(outcome.report.map((entry) => entry.line));
      const silent = addedLines(original, variant).filter((line) => !reported.has(line));
      expect(silent).toEqual([]);
      expectContent(file, original, outcome.diagram);
    });
  }
});
