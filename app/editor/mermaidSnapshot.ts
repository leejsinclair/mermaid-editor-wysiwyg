// Mermaid's readings as plain data (data-model.md, Snapshots): this module is the only one that reads Mermaid's objects.

import type { FlowchartSnapshot, SequenceSnapshot } from "../importing/snapshots";
import { loadMermaid } from "../rendering/shared/mermaidRuntime";

export type { FlowchartSnapshot, SequenceSnapshot };

interface ReadVertex {
  readonly text?: string;
  readonly type?: string | null;
}

interface ReadEdge {
  readonly start: string;
  readonly end: string;
  readonly text?: string;
  readonly type?: string;
  readonly stroke?: string;
}

interface ReadSubgraph {
  readonly id: string;
  readonly title?: string;
}

interface FlowDb {
  getVertices(): Map<string, ReadVertex>;
  getEdges(): ReadEdge[];
  getDirection(): string;
  getSubGraphs(): ReadSubgraph[];
}

const DIRECTIONS: ReadonlyMap<string, FlowchartSnapshot["direction"]> = new Map([
  ["TB", "TD"],
  ["TD", "TD"],
  ["BT", "BT"],
  ["LR", "LR"],
  ["RL", "RL"],
]);

/** Mermaid's own reading of a flowchart source, loaded when first needed so the editor opens without it (research R1). */
export async function snapshotFlowchart(source: string): Promise<FlowchartSnapshot> {
  // Registers Mermaid's diagram types, which `getDiagramFromText` alone does not.
  const mermaid = await loadMermaid();
  // mermaidAPI is deprecated, but `parse` does not expose the parsed database a snapshot needs (research R1).
  // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  const db = diagram.db as unknown as FlowDb;
  return {
    direction: DIRECTIONS.get(db.getDirection()) ?? "TD",
    vertices: [...db.getVertices()].map(([key, vertex]) => ({
      key,
      text: vertex.text ?? key,
      shape: vertex.type ?? "",
    })),
    edges: db.getEdges().map((edge) => ({
      from: edge.start,
      to: edge.end,
      text: edge.text ?? "",
      arrow: edge.type ?? "",
      stroke: edge.stroke ?? "",
    })),
    subgraphs: db.getSubGraphs().map((subgraph) => ({ id: subgraph.id, title: subgraph.title ?? subgraph.id })),
  };
}

interface ReadActorEntry {
  readonly description?: string;
  readonly type?: string;
}

interface ReadMessageEntry {
  readonly from?: string | null;
  readonly to?: string | null;
  readonly message?: unknown;
  readonly type?: number;
}

interface SequenceDb {
  getActors(): Map<string, ReadActorEntry>;
  getMessages(): ReadMessageEntry[];
}

/** Mermaid's own reading of a sequence source, as plain data (research R1). */
export async function snapshotSequence(source: string): Promise<SequenceSnapshot> {
  const mermaid = await loadMermaid();
  // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  const db = diagram.db as unknown as SequenceDb;
  return {
    actors: [...db.getActors()].map(([key, actor]) => ({
      key,
      label: actor.description ?? key,
      role: actor.type === "actor" ? "actor" : "participant",
    })),
    steps: db.getMessages().map((entry) => ({
      type: entry.type ?? -1,
      ...(entry.from ? { from: entry.from } : {}),
      ...(entry.to ? { to: entry.to } : {}),
      text: typeof entry.message === "string" ? entry.message : "",
    })),
  };
}
