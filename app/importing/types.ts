import type { C4Kind } from "../model/types";

/** What the document's first significant line says it is (data-model.md, Detection). */
export type Detection =
  | { readonly type: "flowchart" }
  | { readonly type: "sequence" }
  | { readonly type: "c4"; readonly kind: C4Kind }
  | { readonly type: "unsupported"; readonly found: string }
  /** A `%%{` directive with no `}%%`; its first line, counted from 1 (feature 006, FR-006). */
  | { readonly type: "unclosedDirective"; readonly line: number }
  | { readonly type: "none" };

/** The first Mermaid block of a document, and the blocks and headers that were not imported (data-model.md). */
export interface IgnoredBlock {
  /** 1-based line where the block or header starts. */
  readonly line: number;
  readonly firstLine: string;
}

export interface SplitDocument {
  /** The block to import: the first block, ending before any second diagram header (feature 006, FR-007). */
  readonly text: string;
  /** The whole first block, second headers included; only the C4 mixed-kind check reads it (DC-02, 005 EC-06). */
  readonly wholeBlock: string;
  /** Lines before the first block; a line N of `text` is line N + lineOffset of the document. */
  readonly lineOffset: number;
  readonly frontMatter?: { readonly title: string };
  readonly ignored: readonly IgnoredBlock[];
}
