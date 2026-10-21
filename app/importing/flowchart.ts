import type { Connection, Ending, FlowchartShape, LineStyle, Node } from "../model/types";
import { decodeLabel } from "./decode";
import { layoutFlowchart } from "./layout";
import type { FlowchartSnapshot } from "./snapshots";

export interface ReadFlowchart {
  readonly nodes: readonly Node[];
  readonly connections: readonly Connection[];
  readonly nextId: number;
}

/** Mermaid's shape words that the editor holds exactly (research R7). A bare id has no shape word and is a rectangle. */
const SHAPES: ReadonlyMap<string, FlowchartShape> = new Map([
  ["", "rectangle"],
  ["square", "rectangle"],
  ["round", "rounded"],
  ["stadium", "stadium"],
  ["cylinder", "cylinder"],
  ["circle", "circle"],
  ["diamond", "diamond"],
  ["hexagon", "hexagon"],
  ["lean_right", "parallelogram"],
  ["subroutine", "subroutine"],
  // Approximations (research R7): the nearest outline the editor has.
  ["doublecircle", "circle"],
  ["odd", "rectangle"],
  ["trapezoid", "rectangle"],
  ["inv_trapezoid", "rectangle"],
  ["lean_left", "parallelogram"],
]);

const LINES: ReadonlyMap<string, LineStyle> = new Map([
  ["normal", "solid"],
  ["dotted", "dotted"],
  ["thick", "thick"],
]);

const ENDINGS: ReadonlyMap<string, Ending> = new Map([
  ["arrow_point", "arrow"],
  ["arrow_open", "plain"],
  ["double_arrow_point", "both"],
  ["arrow_circle", "plain"],
  ["arrow_cross", "plain"],
  ["double_arrow_circle", "both"],
  ["double_arrow_cross", "both"],
]);

/**
 * The editor's nodes and connections for a flowchart snapshot. Ids run from 1 in document order: nodes by first
 * appearance, then connections. Positions come from the layered layout, computed once here (FR-008).
 */
export function readFlowchart(snapshot: FlowchartSnapshot): ReadFlowchart {
  const keys = new Map<string, number>();
  snapshot.vertices.forEach((vertex, index) => keys.set(vertex.key, index + 1));
  const nodeCount = snapshot.vertices.length;
  // An invisible link has no line in the editor: it is dropped, and reported by the scanner (research R7).
  const visible = snapshot.edges.filter((edge) => edge.stroke !== "invisible");
  const edges = visible.map((edge) => ({ from: keys.get(edge.from) ?? 0, to: keys.get(edge.to) ?? 0 }));
  const positions = layoutFlowchart({
    direction: snapshot.direction,
    ids: snapshot.vertices.map((_, index) => index + 1),
    edges,
  });

  const nodes: Node[] = snapshot.vertices.map((vertex, index) => {
    const id = index + 1;
    const position = positions.get(id) ?? { x: 0, y: 0 };
    return {
      id,
      shape: SHAPES.get(vertex.shape) ?? "rectangle",
      label: decodeLabel(vertex.text).text,
      x: position.x,
      y: position.y,
    };
  });

  const connections: Connection[] = visible.map((edge, index) => ({
    id: nodeCount + index + 1,
    from: keys.get(edge.from) ?? 0,
    to: keys.get(edge.to) ?? 0,
    line: LINES.get(edge.stroke) ?? "solid",
    ending: ENDINGS.get(edge.arrow) ?? "plain",
    label: decodeLabel(edge.text).text,
  }));

  return { nodes, connections, nextId: nodeCount + connections.length + 1 };
}
