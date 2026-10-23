// Source highlighting (spec 007, FR-017): the generated source split into runs a view can colour. The runs' texts joined are exactly
// the source, for any text: every character belongs to some run, and nothing is parsed, dropped or changed. It is a lexical
// colouring of what the editor generates for the three diagram types, not a parser of Mermaid.

export type RunKind = "keyword" | "identifier" | "string" | "operator" | "comment" | "punctuation" | "space";

export interface Run {
  readonly kind: RunKind;
  readonly text: string;
}

const KEYWORDS: ReadonlySet<string> = new Set([
  // flowchart
  "flowchart", "graph", "subgraph", "end", "direction", "TD", "TB", "LR", "RL", "BT", "classDef", "class", "style", "linkStyle", "click",
  // sequence
  "sequenceDiagram", "participant", "actor", "as", "title", "note", "over", "left", "right", "of", "loop", "alt", "else", "opt", "par", "and", "rect", "activate", "deactivate", "autonumber",
]);

/** C4 diagrams start with `C4Context`, `C4Container` and so on; their macros are the words written just before a bracket. */
const C4_HEADING = /^C4[A-Za-z]*$/;

/** The patterns, tried in this order at each place; each starts where the last run ended. */
const PATTERNS: readonly (readonly [RunKind | "word", RegExp])[] = [
  ["space", /[ \t\r\n]+/y],
  ["comment", /%%[^\n]*/y],
  // A quote never closed is a label to the end of its line.
  ["string", /"[^"\n]*"?/y],
  // Arrows with a head: `-->`, `-.->`, `==>`, `<-->`, `->>`, `-->>`, `-)`, `--)`, `-x`, `--x`.
  ["operator", /<{0,2}(?:-\.+-|-{1,3}|={2,3})(?:>{1,2}|[x)])/y],
  // Links with none, and the `--` or `-.-` that open a labelled link: `---`, `-.-`, `===`, `--`.
  ["operator", /<{0,2}(?:-\.+-|-{2,3}|={2,3})/y],
  ["word", /[\p{L}_][\p{L}\p{N}_]*/uy],
  ["identifier", /\p{N}+/uy],
];

function runAt(source: string, at: number): Run {
  for (const [kind, pattern] of PATTERNS) {
    pattern.lastIndex = at;
    const found = pattern.exec(source);
    if (found === null) continue;
    const text = found[0];
    if (kind !== "word") return { kind, text };
    const macro = source.startsWith("(", at + text.length);
    return { kind: KEYWORDS.has(text) || C4_HEADING.test(text) || macro ? "keyword" : "identifier", text };
  }
  // Anything else, a surrogate pair included, is punctuation of one character.
  return { kind: "punctuation", text: String.fromCodePoint(source.codePointAt(at) ?? 0) };
}

export function highlightRuns(source: string): readonly Run[] {
  const runs: Run[] = [];
  let at = 0;
  while (at < source.length) {
    const run = runAt(source, at);
    runs.push(run);
    at += run.text.length;
  }
  return runs;
}
