import { ReactFlow, ReactFlowProvider, useReactFlow, type Connection as FlowConnection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { CONNECTION_TYPES, shapeName } from "../../model/flowchart/catalogue";
import { NODE_HEIGHT, NODE_WIDTH } from "../../model/flowchart/freePosition";
import type { Position } from "../../model/operations";
import type { Ending, FlowchartDiagram, FlowchartShape, LineStyle } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { TOOLBOX_DRAG_TYPE } from "../shared/dnd";
import { ConnectionEdge, type ConnectionFlowEdge } from "./ConnectionEdge";
import { ShapeNode, type ShapeFlowNode } from "./ShapeNode";

const NODE_TYPES = { shape: ShapeNode };
const EDGE_TYPES = { connection: ConnectionEdge };
const EMPTY_POSITIONS: ReadonlyMap<string, Position> = new Map();
// A signal no Undo/Redo count equals: no drag is in progress.
const NO_DRAG = { signal: -1, positions: EMPTY_POSITIONS } as const;
const DEFAULT_CONNECTION = { line: "solid", ending: "arrow" } as const;

interface FlowchartCanvasProps {
  readonly diagram: FlowchartDiagram;
  readonly onAddNode: (shape: FlowchartShape, position: Position) => void;
  /** The connection type armed in the toolbox; a plain solid arrow when none is. */
  readonly armed: { readonly line: LineStyle; readonly ending: Ending } | null;
  readonly onAddConnection: (from: number, to: number, line: LineStyle, ending: Ending) => void;
  readonly selection: number | null;
  /** A changed value cancels any drag in progress (Undo and Redo). */
  readonly cancelDragSignal: number;
  readonly onMoveEnd: (linkId: number, end: "from" | "to", targetId: number) => void;
  readonly onSelect: (itemId: number | null) => void;
  readonly onMoveNode: (id: number, position: Position) => void;
}

function Canvas({ diagram, onAddNode, armed, onAddConnection, onMoveNode, onSelect, selection, cancelDragSignal, onMoveEnd }: FlowchartCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const paneRef = useRef<HTMLDivElement>(null);
  // A drag is view state until release: positions here sit over the model's until the drag ends.
  // It belongs to the Undo/Redo signal it began under: once that changes the drag is cancelled and ignored (EC-08).
  const [drag, setDrag] = useState<{ readonly signal: number; readonly positions: ReadonlyMap<string, Position> }>(NO_DRAG);
  const dragging = drag.signal === cancelDragSignal ? drag.positions : EMPTY_POSITIONS;
  const dragSignal = useRef(0);
  // Held for the life of one drag; cancelling it makes the release commit nothing (EC-08).
  const dragToken = useRef(0);
  const nextToken = useRef(0);

  const cancelDrag = () => {
    dragToken.current = 0;
    setDrag(NO_DRAG);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dragToken.current = 0;
        setDrag(NO_DRAG);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const nodes = useMemo<ShapeFlowNode[]>(
    () =>
      diagram.content.nodes.map((node) => ({
        id: String(node.id),
        type: "shape",
        position: dragging.get(String(node.id)) ?? { x: node.x, y: node.y },
        data: { node },
        selected: node.id === selection,
        ariaLabel: fill(en.editor.nodeName, { shape: shapeName(node.shape) ?? node.shape, label: node.label }),
      })),
    [diagram.content.nodes, dragging, selection],
  );

  const edges = useMemo<ConnectionFlowEdge[]>(() => {
    const labels = new Map(diagram.content.nodes.map((node) => [node.id, node.label]));
    const typeNames = new Map(CONNECTION_TYPES.map((entry) => [`${entry.line}-${entry.ending}`, entry.name]));
    return diagram.content.connections.map((connection) => ({
      id: String(connection.id),
      type: "connection",
      source: String(connection.from),
      target: String(connection.to),
      data: { connection },
      selected: connection.id === selection,
      reconnectable: true,
      ariaLabel: fill(en.editor.connectionName, {
        type: typeNames.get(`${connection.line}-${connection.ending}`) ?? connection.line,
        from: labels.get(connection.from) ?? "",
        to: labels.get(connection.to) ?? "",
      }),
    }));
  }, [diagram.content.nodes, diagram.content.connections, selection]);

  const onConnect = (connection: FlowConnection) => {
    const type = armed ?? DEFAULT_CONNECTION;
    onAddConnection(Number(connection.source), Number(connection.target), type.line, type.ending);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    const shape = event.dataTransfer.getData(TOOLBOX_DRAG_TYPE);
    if (shapeName(shape as FlowchartShape) === undefined) return;
    const point = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    // The drop point is the centre of the new node.
    onAddNode(shape as FlowchartShape, { x: point.x - NODE_WIDTH / 2, y: point.y - NODE_HEIGHT / 2 });
  };

  const insidePane = (event: MouseEvent | TouchEvent): boolean => {
    const rect = paneRef.current?.getBoundingClientRect();
    const point = "changedTouches" in event ? event.changedTouches[0] : event;
    if (!rect || !point) return false;
    return point.clientX >= rect.left && point.clientX <= rect.right && point.clientY >= rect.top && point.clientY <= rect.bottom;
  };

  return (
    <div ref={paneRef} style={{ width: "100%", height: "100%" }}>
    <ReactFlow
      nodes={nodes}
      onNodeDragStart={() => {
        nextToken.current += 1;
        dragToken.current = nextToken.current;
        dragSignal.current = cancelDragSignal;
      }}
      onNodeDrag={(_event, node) => {
        if (dragToken.current === 0 || dragSignal.current !== cancelDragSignal) return;
        setDrag({ signal: cancelDragSignal, positions: new Map([[node.id, node.position]]) });
      }}
      onNodeDragStop={(event, node) => {
        const live = dragToken.current !== 0 && dragSignal.current === cancelDragSignal;
        cancelDrag();
        if (live && insidePane(event)) onMoveNode(Number(node.id), node.position);
      }}
      edges={edges}
      onNodeClick={(_event, node) => {
        onSelect(Number(node.id));
      }}
      onReconnect={(oldEdge, next) => {
        const end = next.source === oldEdge.source ? "to" : "from";
        onMoveEnd(Number(oldEdge.id), end, Number(end === "to" ? next.target : next.source));
      }}
      onEdgeClick={(_event, edge) => {
        onSelect(Number(edge.id));
      }}
      onPaneClick={() => {
        onSelect(null);
      }}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      zoomOnDoubleClick={false}
      autoPanOnNodeDrag={false}
    />
    </div>
  );
}

/** A controlled React Flow canvas: the model is the only state; nodes and edges are derived on each render (research R3). */
export function FlowchartCanvas(props: Readonly<FlowchartCanvasProps>) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
