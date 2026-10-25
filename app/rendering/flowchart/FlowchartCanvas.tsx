import { ConnectionMode, ReactFlow, ReactFlowProvider, useConnection, useReactFlow, useStore, useStoreApi, type Connection as FlowConnection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState, type DragEvent, type KeyboardEvent as ReactKeyboardEvent, type Ref } from "react";
import { CONNECTION_TYPES, shapeName } from "../../model/flowchart/catalogue";
import { NODE_HEIGHT, NODE_WIDTH } from "../../model/flowchart/freePosition";
import type { Position } from "../../model/operations";
import type { Ending, FlowchartDiagram, FlowchartShape, LineStyle } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { TOOLBOX_DRAG_TYPE } from "../shared/dnd";
import type { InlineEdit } from "../shared/InlineLabelEditor";
import { useDoubleActivation } from "../shared/useDoubleActivation";
import { CanvasHelp, CanvasPrompt } from "../shared/CanvasHelp";
import { EmptyHint } from "../shared/EmptyHint";
import { HANDLE_HIT } from "../shared/handleSize";
import { useReportZoom, type ViewHandle } from "../shared/viewport";
import { ConnectionEdge, type ConnectionFlowEdge } from "./ConnectionEdge";
import { CoveredSides, DropTargets, ShapeNode, type ShapeFlowNode } from "./ShapeNode";
import { validEnds } from "../shared/interaction";
import { nearestSides, type Box, type Side } from "./sides";
import { DraftingGrid } from "./DraftingGrid";
import { keepOnly, stableFor, type Stable } from "./stable";

const NODE_TYPES = { shape: ShapeNode };
const EDGE_TYPES = { connection: ConnectionEdge };
const EMPTY_POSITIONS: ReadonlyMap<string, Position> = new Map();
// A signal no Undo/Redo count equals: no drag is in progress.
const NO_DRAG = { signal: -1, positions: EMPTY_POSITIONS } as const;
const DEFAULT_CONNECTION = { line: "solid", ending: "arrow" } as const;
/** A press that moves less than this many screen pixels before it is released is a click, not a move (FR-006). */
const CLICK_SLOP = 5;

/** What the editor may ask of the canvas that only the canvas knows: where its visible middle is. */
export interface FlowchartHandle extends ViewHandle {
  /** The top-left corner a node would have if it sat in the middle of the visible canvas. */
  readonly visibleCentre: () => Position;
}

interface FlowchartCanvasProps {
  readonly handleRef?: Ref<FlowchartHandle>;
  /** Called with the zoom now and whenever it changes. */
  readonly onZoomChange?: (zoom: number) => void;
  readonly diagram: FlowchartDiagram;
  /** The label being edited in place, or none. */
  readonly inlineEdit: InlineEdit | null;
  /** A double click, tap or pen tap on a node or connection: select it and open its label for editing. */
  readonly onStartEdit: (itemId: number) => void;
  readonly onAddNode: (shape: FlowchartShape, position: Position) => void;
  /** The connection type armed in the toolbox; a plain solid arrow when none is. */
  readonly armed: { readonly line: LineStyle; readonly ending: Ending } | null;
  /** Escape cancelled a line being drawn: the armed connection type ends with it (spec 008, EC-02). */
  readonly onCancelConnection: () => void;
  readonly onAddConnection: (from: number, to: number, line: LineStyle, ending: Ending) => void;
  readonly selection: number | null;
  /** What the next Escape cancels, for the prompts that name it; the prompts are filled by T019. */
  readonly cancelTarget?: "label" | "connection" | "selection" | null;
  /** A changed value cancels any drag in progress (Undo and Redo). */
  readonly cancelDragSignal: number;
  readonly onMoveEnd: (linkId: number, end: "from" | "to", targetId: number) => void;
  readonly onSelect: (itemId: number | null) => void;
  readonly onMoveNode: (id: number, position: Position) => void;
  /** An arrow key moved the selected node by a fixed step; consecutive nudges of one node are one undo step (FR-019). */
  readonly onNudgeNode: (id: number, position: Position) => void;
  /** Focus left the canvas, which ends a run of nudges. */
  readonly onFocusLeave: () => void;
}

/** The id of the node or connection that an event happened on or inside, if any. */
function itemIdOf(target: EventTarget): number | undefined {
  const id = Number((target as HTMLElement).closest(".react-flow__node, .react-flow__edge")?.getAttribute("data-id"));
  return Number.isInteger(id) ? id : undefined;
}

/** The line drawn while a connection is being made is in the canvas ink, like the finished ones (spec 007, FR-015). */
const CONNECTION_LINE = { stroke: "var(--canvas-ink)", strokeWidth: 2 } as const;

/** The distance one arrow key press moves a node. */
const NUDGE_STEP = 16;
const ARROW_STEPS: ReadonlyMap<string, Position> = new Map([
  ["ArrowUp", { x: 0, y: -NUDGE_STEP }],
  ["ArrowDown", { x: 0, y: NUDGE_STEP }],
  ["ArrowLeft", { x: -NUDGE_STEP, y: 0 }],
  ["ArrowRight", { x: NUDGE_STEP, y: 0 }],
]);

/** The sides of each node that the end handles of the selected connection sit on. */
function coveredSides(content: FlowchartDiagram["content"], dragging: ReadonlyMap<string, Position>, selection: number | null): ReadonlyMap<number, Side[]> {
  const covered = new Map<number, Side[]>();
  const connection = content.connections.find((candidate) => candidate.id === selection);
  if (!connection) return covered;
  const box = (id: number): Box | undefined => {
    const node = content.nodes.find((candidate) => candidate.id === id);
    if (!node) return undefined;
    const position = dragging.get(String(id)) ?? { x: node.x, y: node.y };
    return { x: position.x, y: position.y, width: NODE_WIDTH, height: NODE_HEIGHT };
  };
  const from = box(connection.from);
  const to = box(connection.to);
  if (!from || !to) return covered;
  const sides = nearestSides(from, to);
  covered.set(connection.from, [sides.source]);
  covered.set(connection.to, [...(covered.get(connection.to) ?? []), sides.target]);
  return covered;
}

/** What the canvas is waiting for, in words: a label being edited, a line being drawn, or a connection type chosen and no line begun. */
function promptFor(editing: boolean, drawing: boolean, armed: boolean): string | null {
  if (editing) return en.canvasHelp.labelEditing;
  if (drawing) return en.canvasHelp.connectDestination;
  return armed ? en.canvasHelp.connectSource : null;
}

function Canvas({ handleRef, onZoomChange, diagram, inlineEdit, onStartEdit, onAddNode, armed, onCancelConnection, onAddConnection, onMoveNode, onNudgeNode, onFocusLeave, onSelect, selection, cancelDragSignal, onMoveEnd }: FlowchartCanvasProps) {
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);
  useReportZoom(zoom, onZoomChange);
  const doubles = useDoubleActivation(onStartEdit);
  const flow = useStoreApi();
  const helpId = useId();
  const rfId = flow.getState().rfId;
  // Whether a line is being drawn from a handle, and whether Escape has cancelled it: a line cancelled stays cancelled
  // however the pointer is then let go, and letting go over the empty canvas does not clear the selection. The next press starts afresh.
  const connecting = useRef(false);
  const connectionCancelled = useRef(false);
  const reconnecting = useRef(false);
  const reconnectingEnd = useRef<"from" | "to" | undefined>(undefined);
  const paneRef = useRef<HTMLDivElement>(null);
  // A drag is view state until release: positions here sit over the model's until the drag ends.
  // It belongs to the Undo/Redo signal it began under: once that changes the drag is cancelled and ignored (EC-08).
  const [drag, setDrag] = useState<{ readonly signal: number; readonly positions: ReadonlyMap<string, Position> }>(NO_DRAG);
  const dragging = drag.signal === cancelDragSignal ? drag.positions : EMPTY_POSITIONS;
  const dragSignal = useRef(0);
  // Held for the life of one drag; cancelling it makes the release commit nothing (EC-08).
  const dragToken = useRef(0);
  // Where the last pointer press began, so a release can tell a click that wobbled from a move.
  const press = useRef({ x: 0, y: 0 });
  // The node that keyboard focus has just selected: the next Enter confirms it, and only a second Enter opens its label (EC-09).
  const justFocused = useRef<number | null>(null);
  const nextToken = useRef(0);

  const cancelDrag = () => {
    dragToken.current = 0;
    setDrag(NO_DRAG);
  };
  useEffect(() => {
    // Escape ends a drag or a line being drawn and is marked handled, so the editor's own Escape does not also act on this press:
    // a line being drawn takes the armed connection type with it, and the selection stays for the next Escape. Nor does the
    // press reach the focused node, whose own Escape would drop its highlight.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (dragToken.current !== 0 || connecting.current) {
        event.preventDefault();
        event.stopPropagation();
      }
      dragToken.current = 0;
      setDrag(NO_DRAG);
      if (connecting.current) {
        connectionCancelled.current = true;
        flow.getState().cancelConnection();
        onCancelConnection();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [flow, onCancelConnection]);

  useImperativeHandle(handleRef, () => ({
    zoomIn: () => void zoomIn(),
    zoomOut: () => void zoomOut(),
    fit: () => void fitView(),
    visibleCentre: () => {
      const rect = paneRef.current?.getBoundingClientRect();
      const point = screenToFlowPosition({ x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2, y: (rect?.top ?? 0) + (rect?.height ?? 0) / 2 });
      return { x: point.x - NODE_WIDTH / 2, y: point.y - NODE_HEIGHT / 2 };
    },
  }));

  // Held for the life of the canvas; the nodes and edges built from the model are reused while their facts stay the same.
  const [nodeCache] = useState<Stable<ShapeFlowNode>>(() => new Map());
  const [edgeCache] = useState<Stable<ConnectionFlowEdge>>(() => new Map());

  const nodes = useMemo<ShapeFlowNode[]>(() => {
    keepOnly(nodeCache, new Set(diagram.content.nodes.map((node) => String(node.id))));
    // The handles a selected line's end handles sit on: only the end handle shows and is hit there.
    return diagram.content.nodes.map((node) => {
      const id = String(node.id);
      const position = dragging.get(id) ?? { x: node.x, y: node.y };
      const selected = node.id === selection;
      const edit = inlineEdit?.itemId === node.id ? inlineEdit : undefined;
      return stableFor(nodeCache, id, [node, position.x, position.y, selected, edit], () => {
        const name = fill(en.editor.nodeName, { shape: shapeName(node.shape) ?? node.shape, label: node.label });
        return {
          id,
          type: "shape",
          // The nominal footprint, so a node is never unmeasured (and hidden) for a frame after it is re-created.
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          // Every shape has this footprint and the same side handles. Without `measured`, React Flow drops a node's handle
          // bounds each time the node object is rebuilt, and a re-measure lost in a quick run of changes (adding a shape and
          // opening its label) leaves the node's connections undrawn.
          measured: { width: NODE_WIDTH, height: NODE_HEIGHT },
          position,
          data: { node, name, ...(edit && { edit }) },
          selected,
          // React Flow's own hint for a node, then what this canvas does with one.
          domAttributes: { "aria-describedby": `react-flow__node-desc-${rfId} ${helpId}`, ...(selected && { "aria-current": true }) },
          ariaLabel: name,
        };
      });
    });
  }, [diagram.content.nodes, dragging, selection, inlineEdit, nodeCache, helpId, rfId]);

  // While a line is drawn from a handle, every node is a valid end.
  const drawing = useConnection((connection) => connection.inProgress);
  const promptText = promptFor(inlineEdit !== null, drawing, armed !== null);
  const dropTargets = useMemo(() => (drawing ? new Set(validEnds(diagram)) : null), [drawing, diagram]);
  const covered = useMemo(() => coveredSides(diagram.content, dragging, selection), [diagram.content, dragging, selection]);

  const edges = useMemo<ConnectionFlowEdge[]>(() => {
    const labels = new Map(diagram.content.nodes.map((node) => [node.id, node.label]));
    const typeNames = new Map(CONNECTION_TYPES.map((entry) => [`${entry.line}-${entry.ending}`, entry.name]));
    keepOnly(edgeCache, new Set(diagram.content.connections.map((connection) => String(connection.id))));
    // Each line joins the sides of its two nodes that face each other, wherever the nodes are now (during a drag too).
    const boxes = new Map<number, Box>(
      diagram.content.nodes.map((node) => {
        const position = dragging.get(String(node.id)) ?? { x: node.x, y: node.y };
        return [node.id, { x: position.x, y: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }];
      }),
    );
    return diagram.content.connections.map((connection) => {
      const id = String(connection.id);
      const from = boxes.get(connection.from);
      const to = boxes.get(connection.to);
      const sides = from && to ? nearestSides(from, to) : { source: "bottom", target: "top" };
      const name = fill(en.editor.connectionName, {
        type: typeNames.get(`${connection.line}-${connection.ending}`) ?? connection.line,
        from: labels.get(connection.from) ?? "",
        to: labels.get(connection.to) ?? "",
      });
      const selected = connection.id === selection;
      const edit = inlineEdit?.itemId === connection.id ? inlineEdit : undefined;
      return stableFor(edgeCache, id, [connection, name, selected, edit, sides.source, sides.target], () => ({
        id,
        type: "connection",
        source: String(connection.from),
        target: String(connection.to),
        sourceHandle: sides.source,
        targetHandle: sides.target,
        data: { connection, name, ...(edit && { edit }) },
        selected,
        domAttributes: { "data-zone": "line", ...(selected && { "aria-current": true }) },
        reconnectable: true,
        ariaLabel: name,
      }));
    });
  }, [diagram.content.nodes, diagram.content.connections, dragging, selection, inlineEdit, edgeCache]);

  const onConnect = (connection: FlowConnection) => {
    if (connectionCancelled.current) return;
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

  /** The id of the node drawn where a mouse or touch event happened, if there is one. */
  const nodeUnder = (event: MouseEvent | TouchEvent): number | undefined => {
    const point = pointOf(event);
    if (!point) return undefined;
    const id = Number(document.elementFromPoint(point.clientX, point.clientY)?.closest(".react-flow__node")?.getAttribute("data-id"));
    return Number.isInteger(id) ? id : undefined;
  };

  /** Where a mouse or touch event happened on screen. */
  const pointOf = (event: MouseEvent | TouchEvent): { readonly clientX: number; readonly clientY: number } | undefined => ("changedTouches" in event ? event.changedTouches[0] : event);

  const insidePane = (event: MouseEvent | TouchEvent): boolean => {
    const rect = paneRef.current?.getBoundingClientRect();
    const point = pointOf(event);
    if (!rect || !point) return false;
    return point.clientX >= rect.left && point.clientX <= rect.right && point.clientY >= rect.top && point.clientY <= rect.bottom;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      // Enter or Space on a node or connection selects it, whatever way it was focused. Enter on a node that is already
      // selected opens its label for editing.
      const id = itemIdOf(event.target);
      if (id === undefined) return;
      const confirmsFocus = justFocused.current === id;
      justFocused.current = null;
      if (id !== selection) onSelect(id);
      else if (event.key === "Enter" && !confirmsFocus) onStartEdit(id);
      return;
    }
    justFocused.current = null;
    const step = ARROW_STEPS.get(event.key);
    const node = diagram.content.nodes.find((candidate) => candidate.id === selection);
    if (!step || !node || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    event.preventDefault();
    onNudgeNode(node.id, { x: node.x + step.x, y: node.y + step.y });
  };

  return (
    <div
      ref={paneRef}
      role="presentation"
      style={{ width: "100%", height: "100%", position: "relative" }}
      onKeyDown={onKeyDown}
      onPointerDownCapture={(event) => {
        press.current = { x: event.clientX, y: event.clientY };
        connectionCancelled.current = false;
        doubles.pressed(event);
      }}
      onClickCapture={(event) => {
        // The click that lets go of a cancelled line is not a click on what lies under the pointer.
        if (connectionCancelled.current) {
          event.stopPropagation();
          return;
        }
        if (!(event.target instanceof Element)) return;
        const label = event.target.closest("[data-testid='connection-label']");
        if (!label) return;
        event.stopPropagation();
        const id = Number(label.getAttribute("data-item-id"));
        if (Number.isInteger(id) && !doubles.released(id, event.nativeEvent)) onSelect(id);
      }}
      onFocus={(event) => {
        // Tabbing to a node or connection selects it, so the Properties panel always shows what has focus. A pointer press
        // selects through its own click, and is left to it.
        if (!(event.target as HTMLElement).matches(":focus-visible")) return;
        const id = itemIdOf(event.target);
        if (id === undefined || id === selection) return;
        justFocused.current = id;
        onSelect(id);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusLeave();
      }}
    >
    <CoveredSides value={covered}>
    <DropTargets value={dropTargets}>
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
        const end = pointOf(event);
        const wobble = end !== undefined && Math.hypot(end.clientX - press.current.x, end.clientY - press.current.y) < CLICK_SLOP;
        if (live && !wobble && insidePane(event)) onMoveNode(Number(node.id), node.position);
      }}
      edges={edges}
      onNodeClick={(event, node) => {
        const onHandle = event.target instanceof Element && event.target.closest(".react-flow__handle") !== null;
        if (onHandle || !doubles.released(Number(node.id), event)) onSelect(Number(node.id));
      }}
      onReconnect={(oldEdge, next) => {
        const end = next.source === oldEdge.source ? "to" : "from";
        onMoveEnd(Number(oldEdge.id), end, Number(end === "to" ? next.target : next.source));
      }}
      onEdgeClick={(event, edge) => {
        // The grips at a line's ends only move the end: they never open the label.
        const onEnd = event.target instanceof Element && event.target.closest(".react-flow__edgeupdater") !== null;
        if (onEnd || !doubles.released(Number(edge.id), event)) onSelect(Number(edge.id));
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
      nodeClickDistance={CLICK_SLOP}
      connectionDragThreshold={CLICK_SLOP}
      connectionMode={ConnectionMode.Loose}
      connectionLineStyle={CONNECTION_LINE}
      reconnectRadius={HANDLE_HIT / 2 / zoom}
      connectionRadius={HANDLE_HIT / zoom}
      onConnectStart={() => {
        connecting.current = true;
        connectionCancelled.current = false;
      }}
      onConnectEnd={(event, state) => {
        connecting.current = false;
        // Let go over a handle, React Flow has made the line itself; let go over a node's body, the line ends at that node.
        if (reconnecting.current || connectionCancelled.current || state.isValid === true || !state.fromNode) return;
        const to = nodeUnder(event);
        if (to === undefined) return;
        const type = armed ?? DEFAULT_CONNECTION;
        onAddConnection(Number(state.fromNode.id), to, type.line, type.ending);
      }}
      onReconnectStart={(event) => {
        reconnecting.current = true;
        reconnectingEnd.current = event.target instanceof Element && event.target.closest(".react-flow__edgeupdater-source") !== null ? "from" : "to";
      }}
      onReconnectEnd={(event, edge, handleType, state) => {
        reconnecting.current = false;
        const end = reconnectingEnd.current ?? (handleType === "source" ? "from" : "to");
        reconnectingEnd.current = undefined;
        if (connectionCancelled.current || state.isValid === true) return;
        const to = nodeUnder(event);
        if (to !== undefined) onMoveEnd(Number(edge.id), end, to);
      }}
      autoPanOnNodeDrag={false}
    >
      <DraftingGrid zoom={zoom} />
    </ReactFlow>
    </DropTargets>
    </CoveredSides>
    <CanvasHelp id={helpId} text={en.canvasHelp.flowchart} />
    {diagram.content.nodes.length === 0 && <EmptyHint lines={Object.values(en.canvasHelp.gettingStarted)} />}
    <CanvasPrompt text={promptText} />
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
