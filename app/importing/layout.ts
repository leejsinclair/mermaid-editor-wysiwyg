import { NODE_HEIGHT, NODE_WIDTH } from "../model/flowchart/freePosition";

// Layered layout (research R6): back edges reversed for layering, longest-path ranks, barycentre sweeps, even spacing.
// Positions are whole numbers and computed once at import; nothing here reads a clock or a random source.

export type Direction = "TD" | "LR" | "RL" | "BT";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface LayoutInput {
  readonly direction: Direction;
  readonly ids: readonly number[];
  readonly edges: readonly { readonly from: number; readonly to: number }[];
}

const RANK_GAP = 80;
const POSITION_GAP = 48;
const SWEEPS = 4;

interface Edge {
  readonly from: number;
  readonly to: number;
}

/** Reverses the back edges of a depth-first walk so that the layering sees a graph without cycles. */
function forwardEdges(ids: readonly number[], edges: readonly Edge[]): Edge[] {
  const outgoing = new Map<number, Edge[]>();
  for (const edge of edges) {
    if (edge.from === edge.to) continue;
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge]);
  }
  const state = new Map<number, "open" | "done">();
  const backEdges = new Set<Edge>();
  const visit = (node: number): void => {
    state.set(node, "open");
    for (const edge of outgoing.get(node) ?? []) {
      const next = state.get(edge.to);
      if (next === "open") backEdges.add(edge);
      else if (next === undefined) visit(edge.to);
    }
    state.set(node, "done");
  };
  for (const id of ids) {
    if (!state.has(id)) visit(id);
  }
  return edges
    .filter((edge) => edge.from !== edge.to)
    .map((edge) => (backEdges.has(edge) ? { from: edge.to, to: edge.from } : edge));
}

/** Longest-path ranks over the forward edges. A node left in a cycle the walk could not break is started anyway, so the result is total. */
function ranksOf(ids: readonly number[], edges: readonly Edge[]): Map<number, number> {
  const indegree = new Map<number, number>(ids.map((id) => [id, 0]));
  const outgoing = new Map<number, number[]>();
  for (const edge of edges) {
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  }
  const rank = new Map<number, number>(ids.map((id) => [id, 0]));
  const done = new Set<number>();
  const queue: number[] = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  const finish = (node: number): void => {
    done.add(node);
    for (const next of outgoing.get(node) ?? []) {
      rank.set(next, Math.max(rank.get(next) ?? 0, (rank.get(node) ?? 0) + 1));
      indegree.set(next, (indegree.get(next) ?? 0) - 1);
      if ((indegree.get(next) ?? 0) === 0) queue.push(next);
    }
  };
  while (done.size < ids.length) {
    const node = queue.shift();
    if (node !== undefined) {
      if (!done.has(node)) finish(node);
    } else {
      const next = ids.find((id) => !done.has(id));
      if (next !== undefined) finish(next);
    }
  }
  return rank;
}

/** Orders each rank by barycentre of its neighbours in the adjacent rank, sweeping down then up, ties by first appearance. */
function orderLayers(layers: Map<number, number[]>, edges: readonly Edge[], rank: ReadonlyMap<number, number>): void {
  const maxRank = Math.max(0, ...layers.keys());
  const preds = new Map<number, number[]>();
  const succs = new Map<number, number[]>();
  for (const edge of edges) {
    preds.set(edge.to, [...(preds.get(edge.to) ?? []), edge.from]);
    succs.set(edge.from, [...(succs.get(edge.from) ?? []), edge.to]);
  }
  const positionOf = new Map<number, number>();
  const reindex = (): void => {
    for (const layer of layers.values()) layer.forEach((id, index) => positionOf.set(id, index));
  };
  const sortBy = (rankIndex: number, neighbours: ReadonlyMap<number, number[]>, adjacent: number): void => {
    const layer = layers.get(rankIndex) ?? [];
    const keyed = layer.map((id, index) => {
      const near = (neighbours.get(id) ?? []).filter((other) => rank.get(other) === adjacent).map((other) => positionOf.get(other) ?? 0);
      const bary = near.length === 0 ? index : near.reduce((sum, value) => sum + value, 0) / near.length;
      return { id, bary, index };
    });
    keyed.sort((a, b) => a.bary - b.bary || a.index - b.index);
    layers.set(rankIndex, keyed.map((entry) => entry.id));
    reindex();
  };
  reindex();
  for (let sweep = 0; sweep < SWEEPS; sweep += 1) {
    if (sweep % 2 === 0) {
      for (let r = 1; r <= maxRank; r += 1) sortBy(r, preds, r - 1);
    } else {
      for (let r = maxRank - 1; r >= 0; r -= 1) sortBy(r, succs, r + 1);
    }
  }
}

export function layoutFlowchart(input: LayoutInput): Map<number, Point> {
  const { ids, direction } = input;
  const edges = forwardEdges(ids, input.edges);
  const rank = ranksOf(ids, edges);
  const layers = new Map<number, number[]>();
  for (const id of ids) {
    const r = rank.get(id) ?? 0;
    layers.set(r, [...(layers.get(r) ?? []), id]);
  }
  orderLayers(layers, edges, rank);

  const vertical = direction === "TD" || direction === "BT";
  const reversed = direction === "BT" || direction === "RL";
  const primaryStep = (vertical ? NODE_HEIGHT : NODE_WIDTH) + RANK_GAP;
  const secondaryStep = (vertical ? NODE_WIDTH : NODE_HEIGHT) + POSITION_GAP;
  const maxRank = Math.max(0, ...layers.keys());
  const widest = Math.max(1, ...[...layers.values()].map((layer) => layer.length));
  const positions = new Map<number, Point>();
  for (const [r, layer] of layers) {
    const primaryIndex = reversed ? maxRank - r : r;
    const primary = primaryIndex * primaryStep;
    const offset = Math.round(((widest - layer.length) * secondaryStep) / 2);
    layer.forEach((id, index) => {
      const secondary = offset + index * secondaryStep;
      positions.set(id, vertical ? { x: secondary, y: primary } : { x: primary, y: secondary });
    });
  }
  return positions;
}
