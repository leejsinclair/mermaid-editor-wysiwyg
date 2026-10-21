import type { C4Kind } from "../model/types";
import type { Detection, IgnoredBlock, SplitDocument } from "./types";

const C4_KINDS: ReadonlyMap<string, C4Kind> = new Map<string, C4Kind>([
  ["C4Context", "context"],
  ["C4Container", "container"],
  ["C4Component", "component"],
  ["C4Dynamic", "dynamic"],
  ["C4Deployment", "deployment"],
]);

/** The first line that is not blank, a `%%` comment, a `%%{...}%%` directive or part of front matter. */
function firstSignificantLine(text: string): string | undefined {
  const lines = text.split(/\r?\n/);
  let index = 0;
  if (lines[0]?.trim() === "---") {
    const close = lines.findIndex((line, position) => position > 0 && line.trim() === "---");
    index = close === -1 ? lines.length : close + 1;
  }
  for (const line of lines.slice(index)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("%%")) continue;
    return trimmed;
  }
  return undefined;
}

/** The diagram type named by the document's header (FR-002). Mermaid's own parser judges the rest. */
export function detectType(text: string): Detection {
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
  for (const line of text.split(/\r?\n/)) {
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
 * A second diagram header inside the chosen block is ignored as well, from its own line.
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

  const block = lines.slice(blockStart, blockEnd);
  let headerSeen = false;
  block.forEach((line, offset) => {
    if (!DIAGRAM_HEADER.test(line)) return;
    if (headerSeen) ignored.push({ line: blockStart + offset + 1, firstLine: line.trim() });
    headerSeen = true;
  });

  const title = frontMatterTitle(block);
  return {
    text: block.join("\n"),
    lineOffset: blockStart,
    ...(title === undefined ? {} : { frontMatter: title }),
    ignored: [...ignored].sort((a, b) => a.line - b.line),
  };
}
