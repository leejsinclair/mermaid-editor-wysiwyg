import type { ParseOutcome } from "./sourceCheck";

/** Mermaid's own parser, loaded the first time it is needed so the editor opens without it (research R7). */
export async function parseWithMermaid(source: string): Promise<ParseOutcome> {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false });
  try {
    await mermaid.parse(source);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export type LocatedOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string; readonly line: number; readonly column: number };

interface MermaidHash {
  readonly line?: number;
  readonly loc?: { readonly first_line: number; readonly first_column: number };
}

/** The lines Mermaid strips before it reads a diagram: front matter, then `%%{...}%%` directives. */
function strippedLineCount(lines: readonly string[]): number {
  let index = 0;
  if (lines[0]?.trim() === "---") {
    const close = lines.findIndex((line, position) => position > 0 && line.trim() === "---");
    index = close === -1 ? lines.length : close + 1;
  }
  while (index < lines.length && (lines.at(index) ?? "").trim().startsWith("%%{")) index += 1;
  return index;
}

/** Mermaid's parser with the error's line (document lines, front matter included) and column (research R4). */
export async function parseLocated(source: string): Promise<LocatedOutcome> {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false });
  try {
    await mermaid.parse(source);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const hash = (error as { hash?: MermaidHash } | null)?.hash;
    const lines = source.split(/\r?\n/);
    const offset = strippedLineCount(lines);
    const body = lines.slice(offset);
    const reported = hash?.loc?.first_line ?? Number(/on line (\d+)/.exec(message)?.[1] ?? 1);
    let line = reported;
    let column = Math.max(1, hash?.loc?.first_column ?? 1);
    if (reported > body.length) {
      // Past the last line: the error is at the end of the text, so it is reported on the last non-blank line.
      const nonBlank = body.map((text, position) => (text.trim() === "" ? 0 : position + 1)).filter((position) => position > 0);
      line = Math.max(1, nonBlank.at(-1) ?? 1);
      column = (body.at(line - 1) ?? "").length + 1;
    }
    return { ok: false, message, line: line + offset, column };
  }
}
