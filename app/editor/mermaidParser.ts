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
