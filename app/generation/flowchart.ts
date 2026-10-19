import { escapeLabel } from "./escape";
import type { Connection, Ending, FlowchartDiagram, FlowchartShape, LineStyle, Node } from "../model/types";

// Opening and closing brackets around the quoted label (contracts/mermaid-output.md).
const SHAPE_BRACKETS = new Map<FlowchartShape, readonly [string, string]>([
  ["rectangle", ["[", "]"]],
  ["rounded", ["(", ")"]],
  ["stadium", ["([", "])"]],
  ["diamond", ["{", "}"]],
  ["circle", ["((", "))"]],
  ["parallelogram", ["[/", "/]"]],
  ["cylinder", ["[(", ")]"]],
  ["subroutine", ["[[", "]]"]],
  ["hexagon", ["{{", "}}"]],
]);

// Operator by line style, then ending.
const OPERATORS = new Map<LineStyle, ReadonlyMap<Ending, string>>([
  [
    "solid",
    new Map([
      ["arrow", "-->"],
      ["plain", "---"],
      ["both", "<-->"],
    ]),
  ],
  [
    "dotted",
    new Map([
      ["arrow", "-.->"],
      ["plain", "-.-"],
      ["both", "<-.->"],
    ]),
  ],
  [
    "thick",
    new Map([
      ["arrow", "==>"],
      ["plain", "==="],
      ["both", "<==>"],
    ]),
  ],
]);

const alias = (id: number) => `n${String(id)}`;

function nodeLine(node: Node): string {
  const [open, close] = SHAPE_BRACKETS.get(node.shape) ?? ["[", "]"];
  return `  ${alias(node.id)}${open}"${escapeLabel(node.label)}"${close}`;
}

function connectionLine(connection: Connection): string {
  const operator = OPERATORS.get(connection.line)?.get(connection.ending) ?? "-->";
  const label = connection.label === "" ? "" : `|"${escapeLabel(connection.label)}"|`;
  return `  ${alias(connection.from)} ${operator}${label} ${alias(connection.to)}`;
}

/** Nodes in creation order, then connections in creation order; positions are never written (FR-003). */
export function generateFlowchart(diagram: FlowchartDiagram): string {
  return [
    "flowchart TD",
    ...diagram.content.nodes.map(nodeLine),
    ...diagram.content.connections.map(connectionLine),
  ].join("\n");
}
