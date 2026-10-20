import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from "@xyflow/react";
import type { Connection } from "../../model/types";
import { InlineLabelEditor, type InlineEdit } from "../shared/InlineLabelEditor";

/** The connection, and its label being edited in place when it is the one open for editing. */
export type ConnectionFlowEdge = Edge<{ connection: Connection; name: string; edit?: InlineEdit }, "connection">;

/** The width of the editor on a line, which has no box of its own to fill. */
const EDITOR_WIDTH = 160;

const INK = "#222";
/** The colour and extra width that mark the selected connection; the width is the cue that does not rely on colour. */
const CHOSEN = "#1565c0";
const CHOSEN_EXTRA_WIDTH = 2;

/** A path out of the bottom of a node and back into its top, for a connection from a node to itself. */
function loopPath(x: number, y: number, targetY: number): string {
  return `M ${String(x)} ${String(y)} C ${String(x + 110)} ${String(y + 70)}, ${String(x + 110)} ${String(targetY - 70)}, ${String(x)} ${String(targetY)}`;
}

/** Three line styles, three endings, and self-loops; the label is React text, never markup (DC-04). */
export function ConnectionEdge(props: Readonly<EdgeProps<ConnectionFlowEdge>>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected } = props;
  if (!data) return null;
  const { connection } = data;
  const isLoop = connection.from === connection.to;
  const [bezier, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const path = isLoop ? loopPath(sourceX, sourceY, targetY) : bezier;
  const markerId = `arrow-${id}`;

  return (
    <>
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={path}
        {...(connection.ending !== "plain" && { markerEnd: `url(#${markerId})` })}
        {...(connection.ending === "both" && { markerStart: `url(#${markerId})` })}
        style={{
          stroke: selected ? CHOSEN : INK,
          strokeWidth: (connection.line === "thick" ? 4 : 2) + (selected ? CHOSEN_EXTRA_WIDTH : 0),
          ...(connection.line === "dotted" && { strokeDasharray: "2 6", strokeLinecap: "round" as const }),
        }}
      />
      {data.edit && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: "absolute",
              width: EDITOR_WIDTH,
              transform: `translate(-50%, -50%) translate(${String(isLoop ? labelX + 90 : labelX)}px, ${String(labelY)}px)`,
              pointerEvents: "all",
            }}
          >
            <InlineLabelEditor name={data.name} edit={data.edit} />
          </div>
        </EdgeLabelRenderer>
      )}
      {connection.label !== "" && !data.edit && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            data-testid="connection-label"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${String(isLoop ? labelX + 90 : labelX)}px, ${String(labelY)}px)`,
              background: "white",
              padding: "0 4px",
              whiteSpace: "pre-wrap",
              pointerEvents: "all",
            }}
            data-item-id={id}
          >
            {connection.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
