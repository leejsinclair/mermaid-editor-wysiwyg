import type { C4Kind } from "../model/types";
import type { Detection, IgnoredBlock, SplitDocument } from "./types";

const C4_KINDS: ReadonlyMap<string, C4Kind> = new Map<string, C4Kind>([
  ["C4Context", "context"],
  ["C4Container", "container"],
  ["C4Component", "component"],
  ["C4Dynamic", "dynamic"],
  ["C4Deployment", "deployment"],
]);

/** A `%%{ … }%%` directive: its first and last line, counted from 0; `last` is undefined when it never closes (research R4). */
export interface DirectiveSpan {
  readonly first: number;
  readonly last: number | undefined;
}

/** The directives among the lines: each opens on a line starting `%%{` and closes on the first line holding `}%%`, which may be the same line. */
export function directiveLines(lines: readonly string[]): DirectiveSpan[] {
  const spans: DirectiveSpan[] = [];
  let index = 0;
  while (index < lines.length) {
    if (!(lines.at(index) ?? "").trim().startsWith("%%{")) {
      index += 1;
      continue;
    }
    // The closing line is searched for from the opening line on, so every line is visited once (PR #5).
    let close = index;
    while (close < lines.length && !(lines.at(close) ?? "").includes("}%%")) close += 1;
    if (close === lines.length) close = -1;
    spans.push({ first: index, last: close === -1 ? undefined : close });
    if (close === -1) break;
    index = close + 1;
  }
  return spans;
}

/** Every line that belongs to a directive, its first line included; an unclosed directive runs to the end. */
export function linesInDirectives(lines: readonly string[]): ReadonlySet<number> {
  const inside = new Set<number>();
  for (const { first, last } of directiveLines(lines)) {
    for (let index = first; index <= (last ?? lines.length - 1); index += 1) inside.add(index);
  }
  return inside;
}

/** The first line that is not blank, a `%%` comment, a line of a `%%{...}%%` directive or part of front matter. */
function firstSignificantLine(text: string): string | undefined {
  const lines = text.split(/\r?\n/);
  let start = 0;
  if (lines[0]?.trim() === "---") {
    const close = lines.findIndex((line, position) => position > 0 && line.trim() === "---");
    start = close === -1 ? lines.length : close + 1;
  }
  const inDirective = linesInDirectives(lines);
  for (let index = start; index < lines.length; index += 1) {
    const trimmed = (lines.at(index) ?? "").trim();
    if (trimmed === "" || trimmed.startsWith("%%") || inDirective.has(index)) continue;
    return trimmed;
  }
  return undefined;
}

/** The diagram type named by the document's header (FR-002). Mermaid's own parser judges the rest. */
export function detectType(text: string): Detection {
  const unclosed = directiveLines(text.split(/\r?\n/)).find((span) => span.last === undefined);
  if (unclosed !== undefined) return { type: "unclosedDirective", line: unclosed.first + 1 };
  const header = firstSignificantLine(text);
  if (header === undefined) return { type: "none" };
  const word = header.split(/\s/)[0] ?? "";
  if (word === "flowchart" || word === "graph") return { type: "flowchart" };
  if (word === "sequenceDiagram") return { type: "sequence" };
  const kind = C4_KINDS.get(word);
  if (kind !== undefined) return { type: "c4", kind };
  return { type: "unsupported", found: word };
}

/** The C4 kinds of every C4 header in the text, each once, in order of first appearance (EC-06). */
export function c4KindsIn(text: string): C4Kind[] {
  const kinds: C4Kind[] = [];
  const lines = text.split(/\r?\n/);
  const inDirective = linesInDirectives(lines);
  for (const [index, line] of lines.entries()) {
    if (inDirective.has(index)) continue;
    const kind = C4_KINDS.get(line.trim().split(/\s/)[0] ?? "");
    if (kind !== undefined && !kinds.includes(kind)) kinds.push(kind);
  }
  return kinds;
}

type HeaderRest = (rest: string) => boolean;
const nothingMore: HeaderRest = (rest) => rest === "";
const direction: HeaderRest = (rest) => ["", "TB", "TD", "BT", "RL", "LR"].includes(rest);
/**
 * Each diagram word Mermaid starts a diagram with, and what may follow it on the header line. A line is a header only when
 * it is the word alone or the word, white space and what may follow, so `pie[Chart]` or `graph->>Bob: Next` is a statement
 * and `  flowchart LR` is a header (PR #5).
 */
const HEADER_REST: ReadonlyMap<string, HeaderRest> = new Map([
  ["flowchart", direction],
  ["graph", direction],
  ["sequenceDiagram", nothingMore],
  ["classDiagram", nothingMore],
  ["classDiagram-v2", nothingMore],
  ["stateDiagram", nothingMore],
  ["stateDiagram-v2", nothingMore],
  ["erDiagram", nothingMore],
  ["gantt", nothingMore],
  ["pie", (rest) => rest === "" || rest === "showData" || rest.startsWith("title ")],
  ["journey", nothingMore],
  ["gitGraph", (rest) => ["", "LR", "TB", "BT", "LR:", "TB:", "BT:"].includes(rest)],
  ["mindmap", nothingMore],
  ["timeline", () => true],
  ...[...C4_KINDS.keys()].map((word): [string, HeaderRest] => [word, nothingMore]),
]);

/** True when the line, trimmed and without a trailing `%%` comment, is a diagram header. */
function isDiagramHeader(line: string): boolean {
  const comment = line.indexOf("%%");
  const trimmed = (comment === -1 ? line : line.slice(0, comment)).trim();
  const space = trimmed.search(/\s/);
  const word = space === -1 ? trimmed : trimmed.slice(0, space);
  const rest = space === -1 ? "" : trimmed.slice(space).trim();
  return HEADER_REST.get(word)?.(rest) ?? false;
}
const FENCE_OPEN = /^```mermaid\s*$/;
const FENCE_CLOSE = /^```\s*$/;

/** Front matter's `title:` value, with its quotes removed (FR-011). */
function frontMatterTitle(lines: readonly string[]): { readonly title: string } | undefined {
  if (lines[0]?.trim() !== "---") return undefined;
  for (const line of lines.slice(1)) {
    if (line.trim() === "---") return undefined;
    const trimmed = line.trim();
    if (trimmed.startsWith("title:")) {
      const value = trimmed.slice("title:".length).trim();
      const quoted = value.length >= 2 && (value.startsWith('"') || value.startsWith("'")) && value.endsWith(value[0] ?? "");
      return { title: quoted ? value.slice(1, -1) : value };
    }
  }
  return undefined;
}

/**
 * Splits a document into the block to import and the blocks that are not imported (FR-012, EC-02).
 * Text with Mermaid fences is read as Markdown: the first fence is the block, each further fence is ignored.
 * A second diagram header inside the chosen block is ignored as well, from its own line, and the block ends before it.
 */
export function splitDocument(text: string): SplitDocument {
  const lines = text.split(/\r?\n/);
  const fences: number[] = [];
  lines.forEach((line, index) => {
    if (FENCE_OPEN.test(line.trim())) fences.push(index);
  });

  let blockStart = 0;
  let blockEnd = lines.length;
  const ignored: IgnoredBlock[] = [];
  if (fences.length > 0) {
    const first = fences[0] ?? 0;
    blockStart = first + 1;
    blockEnd = lines.findIndex((line, index) => index >= blockStart && FENCE_CLOSE.test(line.trim()));
    if (blockEnd === -1) blockEnd = lines.length;
    for (const fence of fences.slice(1)) {
      const firstLine = lines[fence + 1]?.trim() ?? "";
      ignored.push({ line: fence + 1, firstLine });
    }
  }

  // The block ends before a second diagram header, so the parser never reads what the report says was not imported
  // (feature 006, FR-007). A directive's lines are never a header, whatever word they start with (EC-08).
  const whole = lines.slice(blockStart, blockEnd);
  const inDirective = linesInDirectives(whole);
  const headers = whole.flatMap((line, offset) => (isDiagramHeader(line) && !inDirective.has(offset) ? [offset] : []));
  for (const offset of headers.slice(1)) ignored.push({ line: blockStart + offset + 1, firstLine: (whole.at(offset) ?? "").trim() });
  const second = headers[1];
  const block = second === undefined ? whole : whole.slice(0, second);

  const title = frontMatterTitle(block);
  return {
    text: block.join("\n"),
    wholeBlock: whole.join("\n"),
    lineOffset: blockStart,
    ...(title === undefined ? {} : { frontMatter: title }),
    ignored: [...ignored].sort((a, b) => a.line - b.line),
  };
}
