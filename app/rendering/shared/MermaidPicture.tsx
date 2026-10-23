import { loadMermaid } from "./mermaidRuntime";

// The shared drawing of Mermaid source as an SVG picture (contracts/import-dialog.md, Preview; the flowchart preview uses it too).

export type Drawn = { readonly svg: string } | { readonly error: string };

let drawings = 0;

/** Starts loading Mermaid ahead of the first drawing, so the first picture is not held up by the module load (SC-005). */
export function preloadMermaid(): void {
  void import("mermaid");
}

/**
 * Draws the source the way Mermaid does, with the strict security level (research R4). Mermaid measures text in a
 * container that must be in the document, so it gets a hidden one that is removed afterwards.
 */
export async function drawWithMermaid(source: string): Promise<Drawn> {
  const scratch = document.createElement("div");
  scratch.setAttribute("aria-hidden", "true");
  scratch.style.cssText = "position:absolute;left:-10000px;top:0;visibility:hidden";
  document.body.append(scratch);
  try {
    const mermaid = await loadMermaid();
    drawings += 1;
    const { svg } = await mermaid.render(`preview-${String(drawings)}`, source, scratch);
    return { svg };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    scratch.remove();
  }
}
