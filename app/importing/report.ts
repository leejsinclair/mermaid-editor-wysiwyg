// The Import report's entries (data-model.md, "Import report entry"). One entry per construct and line.

export type ReportCategory = "dropped" | "approximated" | "ignored";

export interface ReportEntry {
  /** 1-based line of the text the developer sees (contracts/import-reading.md, "Line numbers"). */
  readonly line: number;
  readonly column?: number;
  readonly category: ReportCategory;
  /** A short name for the construct, such as `subgraph` or `classDef`. */
  readonly construct: string;
  /** One plain sentence. */
  readonly reason: string;
  /** Set for approximated entries: what the construct became. */
  readonly becomes?: string;
}
