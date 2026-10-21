import type { C4Kind } from "../model/types";

/** What the document's first significant line says it is (data-model.md, Detection). */
export type Detection =
  | { readonly type: "flowchart" }
  | { readonly type: "sequence" }
  | { readonly type: "c4"; readonly kind: C4Kind }
  | { readonly type: "unsupported"; readonly found: string }
  | { readonly type: "none" };

/** The first Mermaid block of a document, and the blocks and headers that were not imported (data-model.md). */
export interface IgnoredBlock {
  /** 1-based line where the block or header starts. */
  readonly line: number;
  readonly firstLine: string;
}

export interface SplitDocument {
  readonly text: string;
  /** Lines before the first block; a line N of `text` is line N + lineOffset of the document. */
  readonly lineOffset: number;
  readonly frontMatter?: { readonly title: string };
  readonly ignored: readonly IgnoredBlock[];
}
