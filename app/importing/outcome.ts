import type { C4Kind, Diagram } from "../model/types";
import type { Detection } from "./types";
import type { FlowchartSnapshot, SequenceSnapshot } from "./snapshots";
import type { ReportEntry } from "./report";

// The pure import's types (contracts/import-reading.md, data-model.md "Outcome"). Nothing here is Mermaid's.

/** Mermaid's verdict on a document: accepted, or refused with the message and the line and column of the error. */
export type ParseResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string; readonly line: number; readonly column: number };

/** The functions the pure import needs from the Mermaid adapter (app/editor), passed in so the layer stays pure. */
export interface ReadDeps {
  readonly parse: (source: string) => Promise<ParseResult>;
  readonly snapshotFlowchart: (source: string) => Promise<FlowchartSnapshot>;
  readonly snapshotSequence: (source: string) => Promise<SequenceSnapshot>;
}

export type RefusalReason = "tooLarge" | "tooDeep" | "kindUndetected" | "kindsMixed" | "notValid";

/** What the dialog shows for one document. Exactly one. */
export type Outcome =
  | { readonly kind: "empty" }
  | { readonly kind: "invalid"; readonly message: string; readonly line: number; readonly column: number }
  | { readonly kind: "unsupported"; readonly found: string }
  | { readonly kind: "refused"; readonly reason: RefusalReason; readonly limit?: number; readonly kinds?: readonly C4Kind[] }
  | { readonly kind: "ready"; readonly diagram: Diagram; readonly name: string; readonly detection: Detection; readonly report: readonly ReportEntry[] };
