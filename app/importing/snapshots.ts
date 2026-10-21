// The plain-data readings of a Mermaid document that the import layer consumes (data-model.md, Snapshots).
// No Mermaid object appears here: the adapter in app/editor fills these shapes.

export interface FlowchartSnapshot {
  readonly direction: "TD" | "LR" | "RL" | "BT";
  readonly vertices: readonly { readonly key: string; readonly text: string; readonly shape: string }[];
  readonly edges: readonly { readonly from: string; readonly to: string; readonly text: string; readonly arrow: string; readonly stroke: string }[];
  readonly subgraphs: readonly { readonly id: string; readonly title: string }[];
}

export interface SequenceSnapshot {
  readonly actors: readonly { readonly key: string; readonly label: string; readonly role: "participant" | "actor" }[];
  /** Every step in order. `type` is Mermaid's line type; a message has `from` and `to`. */
  readonly steps: readonly { readonly type: number; readonly from?: string; readonly to?: string; readonly text: string; readonly block?: string }[];
}
