import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from "@xyflow/react";
import type { Connection } from "../../model/types";

export type ConnectionFlowEdge = Edge<{ connection: Connection }, "connection">;

const INK = "#222";

/** A path out of the bottom of a node and back into its top, for a connection from a node to itself. */
function loopPath(x: number, y: number, targetY: number): string {
  return `M ${String(x)} ${String(y)} C ${String(x + 110)} ${String(y + 70)}, ${String(x + 110)} ${String(targetY - 70)}, ${String(x)} ${String(targetY)}`;
}

/** Three line styles, three endings, and self-loops; the label is React text, never markup (DC-04). */
export function ConnectionEdge(props: Readonly<EdgeProps<ConnectionFlowEdge>>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
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
          stroke: INK,
          strokeWidth: connection.line === "thick" ? 4 : 2,
          ...(connection.line === "dotted" && { strokeDasharray: "2 6", strokeLinecap: "round" as const }),
        }}
      />
      {connection.label !== "" && (
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
              pointerEvents: "none",
            }}
          >
            {connection.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
