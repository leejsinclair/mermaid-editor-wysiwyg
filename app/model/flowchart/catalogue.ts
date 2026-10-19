// What a flowchart offers: nine node shapes and nine connection types, each with its own name (FR-024).
import { en } from "../../text/en";
import type { Ending, FlowchartShape, LineStyle } from "../types";

export interface ShapeEntry {
  readonly shape: FlowchartShape;
  readonly name: string;
}

export interface ConnectionTypeEntry {
  readonly line: LineStyle;
  readonly ending: Ending;
  readonly name: string;
}

const shapes = en.flowchart.shapes;
const connections = en.flowchart.connections;

export const FLOWCHART_SHAPES: readonly ShapeEntry[] = [
  { shape: "rectangle", name: shapes.rectangle },
  { shape: "rounded", name: shapes.rounded },
  { shape: "stadium", name: shapes.stadium },
  { shape: "diamond", name: shapes.diamond },
  { shape: "circle", name: shapes.circle },
  { shape: "parallelogram", name: shapes.parallelogram },
  { shape: "cylinder", name: shapes.cylinder },
  { shape: "subroutine", name: shapes.subroutine },
  { shape: "hexagon", name: shapes.hexagon },
];

export const CONNECTION_TYPES: readonly ConnectionTypeEntry[] = [
  { line: "solid", ending: "arrow", name: connections.solidArrow },
  { line: "solid", ending: "plain", name: connections.solidLine },
  { line: "solid", ending: "both", name: connections.solidBoth },
  { line: "dotted", ending: "arrow", name: connections.dottedArrow },
  { line: "dotted", ending: "plain", name: connections.dottedLine },
  { line: "dotted", ending: "both", name: connections.dottedBoth },
  { line: "thick", ending: "arrow", name: connections.thickArrow },
  { line: "thick", ending: "plain", name: connections.thickLine },
  { line: "thick", ending: "both", name: connections.thickBoth },
];

/** The shape's name, which is also the default label of a new node; undefined for a shape this editor does not offer. */
export function shapeName(shape: FlowchartShape): string | undefined {
  return FLOWCHART_SHAPES.find((entry) => entry.shape === shape)?.name;
}
