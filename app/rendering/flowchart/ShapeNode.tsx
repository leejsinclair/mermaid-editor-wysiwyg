import { Handle, Position, type Node as FlowNode, type NodeProps } from "@xyflow/react";
import type { ReactNode } from "react";
import { NODE_HEIGHT, NODE_WIDTH } from "../../model/flowchart/freePosition";
import type { FlowchartShape, Node } from "../../model/types";

export type ShapeFlowNode = FlowNode<{ node: Node }, "shape">;

const W = NODE_WIDTH;
const H = NODE_HEIGHT;
const INSET = 2;

const OUTLINES = new Map<FlowchartShape, ReactNode>([
  ["rectangle", <rect key="o" x={INSET} y={INSET} width={W - 2 * INSET} height={H - 2 * INSET} />],
  ["rounded", <rect key="o" x={INSET} y={INSET} width={W - 2 * INSET} height={H - 2 * INSET} rx="12" />],
  ["stadium", <rect key="o" x={INSET} y={INSET} width={W - 2 * INSET} height={H - 2 * INSET} rx={(H - 2 * INSET) / 2} />],
  ["diamond", <polygon key="o" points={`${String(W / 2)},${String(INSET)} ${String(W - INSET)},${String(H / 2)} ${String(W / 2)},${String(H - INSET)} ${String(INSET)},${String(H / 2)}`} />],
  ["circle", <ellipse key="o" cx={W / 2} cy={H / 2} rx={W / 2 - INSET} ry={H / 2 - INSET} />],
  ["parallelogram", <polygon key="o" points={`28,${String(INSET)} ${String(W - INSET)},${String(INSET)} ${String(W - 28)},${String(H - INSET)} ${String(INSET)},${String(H - INSET)}`} />],
  [
    "cylinder",
    <path key="o" d={`M${String(INSET)} 12a${String(W / 2 - INSET)} 10 0 0 1 ${String(W - 2 * INSET)} 0v${String(H - 24)}a${String(W / 2 - INSET)} 10 0 0 1-${String(W - 2 * INSET)} 0zM${String(INSET)} 12a${String(W / 2 - INSET)} 10 0 0 0 ${String(W - 2 * INSET)} 0`} />,
  ],
  [
    "subroutine",
    <g key="o">
      <rect x={INSET} y={INSET} width={W - 2 * INSET} height={H - 2 * INSET} />
      <path d={`M14 ${String(INSET)}v${String(H - 2 * INSET)}M${String(W - 14)} ${String(INSET)}v${String(H - 2 * INSET)}`} />
    </g>,
  ],
  ["hexagon", <polygon key="o" points={`24,${String(INSET)} ${String(W - 24)},${String(INSET)} ${String(W - INSET)},${String(H / 2)} ${String(W - 24)},${String(H - INSET)} 24,${String(H - INSET)} ${String(INSET)},${String(H / 2)}`} />],
]);

/** A node drawn at its nominal footprint; its label is React text, never markup (DC-04). */
export function ShapeNode({ data, selected }: Readonly<NodeProps<ShapeFlowNode>>) {
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <svg width={W} height={H} aria-hidden="true" focusable="false" fill="white" stroke={selected ? "#1565c0" : "currentColor"} strokeWidth={selected ? 4 : 2} style={{ position: "absolute", inset: 0 }}>
        {OUTLINES.get(data.node.shape)}
      </svg>
      <div
        data-testid="node-label"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          overflowWrap: "anywhere",
        }}
      >
        {data.node.label}
      </div>
    </div>
  );
}
