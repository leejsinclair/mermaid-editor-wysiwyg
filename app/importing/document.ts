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
    const close = lines.findIndex((line, position) => position >= index && line.includes("}%%"));
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

const DIAGRAM_HEADER = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|C4\w+)\b/;
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
  const headers = whole.flatMap((line, offset) => (DIAGRAM_HEADER.test(line) && !inDirective.has(offset) ? [offset] : []));
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
