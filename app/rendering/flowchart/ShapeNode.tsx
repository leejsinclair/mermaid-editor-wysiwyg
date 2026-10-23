import { Handle, Position, useStore, type Node as FlowNode, type NodeProps } from "@xyflow/react";
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { NODE_HEIGHT, NODE_WIDTH } from "../../model/flowchart/freePosition";
import type { FlowchartShape, Node } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { handlesFit } from "../shared/interaction";
import { HANDLE_DOT, HANDLE_HIT } from "../shared/handleSize";
import type { Side } from "./sides";
import { InlineLabelEditor, type InlineEdit } from "../shared/InlineLabelEditor";

/** The node, and its label being edited in place when it is the one open for editing. */
export type ShapeFlowNode = FlowNode<{ node: Node; name: string; edit?: InlineEdit }, "shape">;

/** The ends a line being drawn may be dropped on: none while no line is drawn. */
export const DropTargets = createContext<ReadonlySet<number> | null>(null);

/**
 * The sides of each node that the end handles of the selected connection sit on. It is shared through a context rather than
 * kept in the nodes: a node changed in any way is measured again, and its connections vanish for a frame.
 */
export const CoveredSides = createContext<ReadonlyMap<number, readonly Side[]>>(new Map());

const SIDES: readonly (readonly [Side, Position])[] = [
  ["top", Position.Top],
  ["right", Position.Right],
  ["bottom", Position.Bottom],
  ["left", Position.Left],
];

const SIDE_NAMES = new Map<Side, string>([
  ["top", "Top"],
  ["right", "Right"],
  ["bottom", "Bottom"],
  ["left", "Left"],
]);

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
  const covered = useContext(CoveredSides).get(data.node.id);
  const zoom = useStore((state) => state.transform[2]);
  const [hovered, setHovered] = useState(false);
  const targets = useContext(DropTargets);
  let target: "valid" | "drop" | undefined;
  if (targets?.has(data.node.id)) target = hovered ? "drop" : "valid";
  // A handle is 28 px to hit and 16 px to see however far the drawing is zoomed, and a node too small to hold them shows none.
  const fits = handlesFit({ width: W, height: H }, zoom);
  const hit = HANDLE_HIT / zoom;
  return (
    <div
      data-zone="body"
      {...(target && { "data-target": target })}
      style={{ position: "relative", width: W, height: H }}
      onPointerEnter={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
    >
      <div data-target-ring style={{ position: "absolute", inset: -7, borderRadius: 6 }} />
      <div data-hover-outline style={{ position: "absolute", inset: -4, border: "1px dashed currentColor", borderRadius: 4 }} />
      <svg width={W} height={H} aria-hidden="true" focusable="false" fill="var(--node-fill)" stroke={selected ? "var(--selection)" : "currentColor"} strokeWidth={selected ? 4 : 2} style={{ position: "absolute", inset: 0 }}>
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
          // The editor may be taller than the node while a long label is typed.
          overflow: data.edit ? "visible" : "hidden",
          overflowWrap: "anywhere",
        }}
      >
        {data.edit ? <InlineLabelEditor name={data.name} edit={data.edit} /> : data.node.label}
      </div>
      {SIDES.map(([side, position]) => (
        // Every handle both starts and receives a line (loose connection mode), so they are all of the one type. React Flow's
        // own handle is a point on the edge of the node, where a connection ends; the 28 px square to hit and the dot to see
        // are drawn around it. The handles stay in the node when it is too small to show them: connections are drawn to them
        // all the same.
        <Handle key={side} id={side} type="source" position={position} style={{ width: 1, height: 1, minWidth: 0, minHeight: 0, border: "none", background: "transparent" }}>
          <span
            className="shape-handle"
            role="img"
            aria-label={fill(en.canvasHelp.handle, { side: SIDE_NAMES.get(side) ?? side })}
            data-side={side}
            data-covered={covered?.includes(side) === true}
            data-visible={hovered || selected}
            {...(fits && { "data-zone": "connect" })}
            style={{ width: hit, height: hit, "--handle-dot": `${String(HANDLE_DOT / zoom)}px`, ...(!fits && { visibility: "hidden", pointerEvents: "none" }) } as CSSProperties}
          />
        </Handle>
      ))}
    </div>
  );
}
