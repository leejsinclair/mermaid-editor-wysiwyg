import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type Ref } from "react";
import { CanvasHelp, CanvasPrompt } from "../shared/CanvasHelp";
import { EmptyHint } from "../shared/EmptyHint";
import { gridBackground } from "../shared/gridStyle";
import { useTouchPan } from "../shared/touchPan";
import { useReportZoom, useSvgViewport, type ViewHandle } from "../shared/viewport";
import { BOUNDARY_NAMES, DEPLOYMENT_NODE_NAME, DIRECTION_NAMES, ELEMENT_TYPE_NAMES } from "../../model/c4/catalogue";
import { findItem } from "../../model/c4/tree";
import type { C4Diagram, C4Item, Relationship } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { typeWording } from "../../text/typeWording";
import { c4Layout, type C4Box } from "../layout/c4Layout";
import { MultilineText } from "../sequence/MultilineText";
import { useDrag, type DragEnd } from "../shared/useDrag";
import { InlineLabelEditor, type InlineEdit } from "../shared/InlineLabelEditor";
import { HANDLE_DOT, HANDLE_HIT } from "../shared/handleSize";
import { handlesFit, targetMark, validEnds } from "../shared/interaction";
import { useDoubleActivation } from "../shared/useDoubleActivation";

/** The side handles of an element or node: a square hit area with a dot in it, centred on the middle of each side. */
const SIDES = ["top", "right", "bottom", "left"] as const;
type HandleSide = (typeof SIDES)[number];
/** The width of the editor on a relationship, which has no box of its own to fill. */
const EDITOR_WIDTH = 160;

type C4Drag = { readonly kind: "create"; readonly fromId: number; readonly side: HandleSide } | { readonly kind: "move"; readonly id: number } | { readonly kind: "reorder"; readonly id: number } | { readonly kind: "end"; readonly id: number; readonly end: "from" | "to" };
type Begin = (what: C4Drag) => (event: { clientX: number; clientY: number; button: number }) => void;

interface C4CanvasProps {
  readonly handleRef?: Ref<ViewHandle>;
  /** Called with the zoom now and whenever it changes. */
  readonly onZoomChange?: (zoom: number) => void;
  readonly diagram: C4Diagram;
  /** The label being edited in place, or none. */
  readonly inlineEdit: InlineEdit | null;
  /** A double click, tap or pen tap on an item or relationship: select it and open its label for editing. */
  readonly onStartEdit: (itemId: number) => void;
  readonly selection: number | null;
  readonly onSelect: (itemId: number | null) => void;
  /** A drag from one element to another asked for a relationship between them. */
  readonly onCreateRelationship: (from: number, to: number) => void;
  /** A relationship end was dragged to another element. */
  readonly onMoveEnd: (relationshipId: number, end: "from" | "to", targetId: number) => void;
  /** An element, boundary or node was dropped into a boundary or node, or out to the top level (null). */
  readonly onMoveToParent: (itemId: number, parentId: number | null) => void;
  /** A Dynamic relationship was dragged onto another and takes its place in the order. */
  readonly onReorder: (relationshipId: number, toIndex: number) => void;
}

/** Makes a drawn item reachable from the keyboard: it takes focus and Enter or Space selects it. */
function selectable<E extends { stopPropagation: () => void }>(id: number, select: (id: number) => void, activate?: (id: number, event: E) => boolean, edit?: (id: number) => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: (event: E) => {
      event.stopPropagation();
      if (activate?.(id, event) !== true) select(id);
    },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        // Enter on an item that is already selected opens its label for editing.
        if (event.key === "Enter" && edit) edit(id);
        else select(id);
      }
    },
  };
}

const TESTIDS = new Map<C4Item["item"], string>([
  ["element", "c4-element"],
  ["boundary", "c4-boundary"],
  ["deployment-node", "c4-node"],
]);

function typeNameOf(item: C4Item): string {
  if (item.item === "element") return ELEMENT_TYPE_NAMES.get(item.elementType) ?? item.elementType;
  if (item.item === "boundary") return BOUNDARY_NAMES.get(item.boundaryType) ?? item.boundaryType;
  return DEPLOYMENT_NODE_NAME;
}

/** The lines under a label: the description, and the technology in brackets. */
function details(item: C4Item): readonly { readonly name: string; readonly text: string }[] {
  if (item.item === "boundary") return [];
  const lines = [
    { name: "item-description", text: item.description },
    { name: "item-technology", text: item.technology === "" ? "" : `[${item.technology}]` },
  ];
  return lines.filter((line) => line.text !== "");
}

/** A boundary is open; an element is the node fill, and an external one the raised panel colour so it still stands apart. */
const fillOf = (container: boolean, external: boolean): string => {
  if (container) return "transparent";
  return external ? "var(--panel-raised)" : "var(--node-fill)";
};

/** Where the middle of a side of a box is. */
function sidePoint(box: C4Box, side: HandleSide): { x: number; y: number } {
  if (side === "top") return { x: box.x + box.width / 2, y: box.y };
  if (side === "bottom") return { x: box.x + box.width / 2, y: box.y + box.height };
  return { x: side === "left" ? box.x : box.x + box.width, y: box.y + box.height / 2 };
}

/** A connection handle on one side of an element or node: dragging from it draws a relationship. */
const SideHandle = memo(function SideHandle({ box, side, itemId, covered, visible, zoom, begin, onHover }: Readonly<{ box: C4Box; side: HandleSide; itemId: number; covered: boolean; visible: boolean; zoom: number; begin: Begin; onHover: (id: number, hovered: boolean) => void }>) {
  const { x, y } = sidePoint(box, side);
  // 28 px to hit and 16 px to see on screen, however far the drawing is zoomed.
  const hit = HANDLE_HIT / zoom;
  return (
    <g
      data-zone="connect"
      role="img"
      aria-label={fill(en.canvasHelp.handle, { side: side.charAt(0).toUpperCase() + side.slice(1) })}
      data-item={itemId}
      data-side={side}
      data-covered={covered}
      data-visible={visible}
      onPointerEnter={() => {
        onHover(itemId, true);
      }}
      onPointerLeave={() => {
        onHover(itemId, false);
      }}
      style={{ cursor: "crosshair" }}
      onPointerDown={(event) => {
        event.stopPropagation();
        begin({ kind: "create", fromId: itemId, side })(event);
      }}
    >
      <rect x={x - hit / 2} y={y - hit / 2} width={hit} height={hit} fill="transparent" />
      <circle data-handle-dot data-visible={visible} cx={x} cy={y} r={HANDLE_DOT / 2 / zoom} fill="currentColor" fillOpacity={0.6} pointerEvents="none" style={{ "--hover-r": `${String(HANDLE_DOT * 0.75 / zoom)}px` } as CSSProperties} />
    </g>
  );
});

/** An item's label, or the editor on it, and the lines under it. */
function ItemText({ box, item, name, edit }: Readonly<{ box: C4Box; item: C4Item; name: string; edit: InlineEdit | undefined }>) {
  const container = item.item !== "element";
  const x = container ? box.x + 12 : box.x + box.width / 2;
  return (
    <>
      {edit ? (
        <foreignObject overflow="visible" x={box.x + 8} y={container ? box.y + 4 : box.y + 8} width={box.width - 16} height={36}>
          <InlineLabelEditor name={name} edit={edit} />
        </foreignObject>
      ) : (
        <MultilineText data-testid="item-label" text={item.label} x={x} y={container ? box.y + 24 : box.y + 30} textAnchor={container ? "start" : "middle"} fill="currentColor" fontSize={14} fontWeight="bold" />
      )}
      {details(item).map((line, index) => (
        <MultilineText
          key={line.name}
          data-testid={line.name}
          text={line.text}
          x={x}
          y={container ? box.y + 40 + index * 16 : box.y + 54 + index * 18}
          textAnchor={container ? "start" : "middle"}
          fill="currentColor"
          fontSize={12}
        />
      ))}
    </>
  );
}

const ItemView = memo(function ItemView({ box, item, chosen, target, helpId, onSelect, onEdit, onHover, begin, edit, activate }: Readonly<{ box: C4Box; item: C4Item; chosen: boolean; helpId: string; target: "valid" | "drop" | undefined; onSelect: (id: number) => void; onEdit: (id: number) => void; onHover: (id: number, hovered: boolean) => void; begin: Begin; edit: InlineEdit | undefined; activate: (id: number, event: MouseEvent<SVGGElement>) => boolean }>) {
  const container = item.item !== "element";
  const name = fill(en.c4.itemName, { type: typeNameOf(item), label: item.label });
  const external = item.item === "element" && item.elementType.endsWith("-ext");
  return (
    <g
      data-testid={TESTIDS.get(item.item)}
      {...(target && { "data-target": target })}
      data-id={item.id}
      aria-label={name}
      aria-describedby={helpId}
      aria-pressed={edit ? undefined : chosen}
      {...selectable(item.id, onSelect, activate, chosen ? onEdit : undefined)}
      // While its label is typed the item holds a text field, so it is a group rather than a button.
      role={edit ? "group" : "button"}
      style={{ outline: "none" }}
    >
      <g
        data-zone="body"
        onPointerDown={begin({ kind: "move", id: item.id })}
        onPointerEnter={() => {
          onHover(item.id, true);
        }}
        onPointerLeave={() => {
          onHover(item.id, false);
        }}
      >
      <rect data-target-ring x={box.x - 7} y={box.y - 7} width={box.width + 14} height={box.height + 14} rx={9} fill="none" stroke="currentColor" />
      <rect data-hover-outline x={box.x - 4} y={box.y - 4} width={box.width + 8} height={box.height + 8} rx={8} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" />
      <rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        rx={6}
        fill={fillOf(container, external)}
        stroke={chosen ? "var(--selection)" : "currentColor"}
        strokeWidth={chosen ? 3 : 1.5}
        strokeDasharray={item.item === "boundary" ? "8 5" : undefined}
      />
      <ItemText box={box} item={item} name={name} edit={edit} />
      </g>
    </g>
  );
});

/** Where the line from the middle of `from` towards `to` leaves `from`'s outline. */
function edgePoint(from: C4Box, to: C4Box): { x: number; y: number } {
  const cx = from.x + from.width / 2;
  const cy = from.y + from.height / 2;
  const dx = to.x + to.width / 2 - cx;
  const dy = to.y + to.height / 2 - cy;
  if (dx === 0 && dy === 0) return { x: from.x + from.width, y: cy };
  const scale = Math.min(dx === 0 ? Infinity : from.width / 2 / Math.abs(dx), dy === 0 ? Infinity : from.height / 2 / Math.abs(dy));
  return { x: cx + dx * scale, y: cy + dy * scale };
}

const RelationshipView = memo(function RelationshipView({ relationship, source, target, fromName, toName, chosen, number, onSelect, onEdit, begin, pressed, edit, activate }: Readonly<{ relationship: Relationship; source: C4Box; target: C4Box; fromName: string; toName: string; chosen: boolean; number: number | undefined; onSelect: (id: number) => void; onEdit: (id: number) => void; begin: Begin; pressed: (event: { clientX: number; clientY: number }) => void; edit: InlineEdit | undefined; activate: (id: number, event: MouseEvent<SVGGElement>) => boolean }>) {
  const name = fill(en.c4.relationshipName, { kind: DIRECTION_NAMES.get(relationship.direction) ?? relationship.direction, from: fromName, to: toName, label: relationship.label });
  const from = source;
  const to = target;
  const start = edgePoint(source, target);
  const end = edgePoint(target, source);
  const looping = from.id === to.id;
  const path = looping
    ? `M${String(from.x + from.width)} ${String(from.y + 30)} h30 v40 h-30`
    : `M${String(start.x)} ${String(start.y)} L${String(end.x)} ${String(end.y)}`;
  const middle = looping ? { x: from.x + from.width + 38, y: from.y + 50 } : { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const twoWay = relationship.direction === "two-way";
  return (
    <g
      data-testid="c4-relationship"
      data-zone="line"
      data-id={relationship.id}
      data-number={number}
      aria-label={name}
      aria-pressed={edit ? undefined : chosen}
      {...selectable(relationship.id, onSelect, activate, chosen ? onEdit : undefined)}
      // While its label is typed the item holds a text field, so it is a group rather than a button.
      role={edit ? "group" : "button"}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerDown={(event) => {
        pressed(event);
        if (number !== undefined) begin({ kind: "reorder", id: relationship.id })(event);
      }}
    >
      <path d={path} stroke="transparent" strokeWidth={18} fill="none" />
      <path d={path} fill="none" stroke={chosen ? "var(--selection)" : "currentColor"} strokeWidth={chosen ? 3 : 1.5} markerEnd="url(#c4-arrow)" markerStart={twoWay ? "url(#c4-arrow)" : undefined} />
      {number !== undefined && (
        <g data-testid="relationship-number">
          <circle cx={start.x} cy={start.y} r={11} fill="currentColor" fillOpacity={0.15} stroke="currentColor" />
          <text x={start.x} y={start.y + 4} textAnchor="middle" fill="currentColor" fontSize={12}>
            {number}
          </text>
        </g>
      )}
      {edit ? (
        <foreignObject overflow="visible" x={looping ? middle.x : middle.x - EDITOR_WIDTH / 2} y={middle.y - 36} width={EDITOR_WIDTH} height={30}>
          <InlineLabelEditor name={name} edit={edit} />
        </foreignObject>
      ) : (
        <MultilineText text={relationship.label} x={middle.x} y={middle.y - 6} textAnchor={looping ? "start" : "middle"} fill="currentColor" fontSize={12} data-testid="relationship-text" />
      )}
    </g>
  );
});

function EndHandle({ end, x, y, begin, id, zoom }: Readonly<{ end: "from" | "to"; x: number; y: number; begin: Begin; id: number; zoom: number }>) {
  const hit = HANDLE_HIT / zoom;
  return (
    <g
      data-testid={`relationship-end-${end}`}
      data-zone="end"
      onClick={(event) => {
        // A click on an end handle is not a click on the canvas: the line stays selected.
        event.stopPropagation();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        begin({ kind: "end", id, end })(event);
      }}
    >
      <rect x={x - hit / 2} y={y - hit / 2} width={hit} height={hit} fill="transparent" />
      <circle cx={x} cy={y} r={HANDLE_DOT / 2 / zoom} fill="currentColor" opacity={0.6} pointerEvents="none" />
    </g>
  );
}

/**
 * The element (or, in Deployment, node) drawn at a point, the innermost when they nest. A point over a side handle, which
 * straddles the edge of its item, counts as over that item even where the handle sticks out.
 */
function endAt(boxes: readonly C4Box[], x: number, y: number, reach: number): number | undefined {
  const hits = boxes.filter((box) => box.item !== "boundary" && x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
  const inside = hits.at(-1);
  if (inside) return inside.id;
  return boxes.find((box) => box.item !== "boundary" && SIDES.some((side) => Math.hypot(sidePoint(box, side).x - x, sidePoint(box, side).y - y) <= reach))?.id;
}

/** The side handles, as "<item id>-<side>", that the end handles of a selected relationship sit on. */
function coveredHandles(ends: readonly (readonly [C4Box, { readonly x: number; readonly y: number }])[], reach: number): Set<string> {
  const covered = new Set<string>();
  for (const [box, point] of ends) {
    for (const side of SIDES) {
      const middle = sidePoint(box, side);
      if (Math.hypot(middle.x - point.x, middle.y - point.y) < reach) covered.add(`${String(box.id)}-${side}`);
    }
  }
  return covered;
}

/** The item a line let go at a point ends at: the one an end handle there belongs to, or the element or node drawn there. */
function lineEndAt(boxes: readonly C4Box[], endHandles: readonly { readonly id: number; readonly x: number; readonly y: number }[], at: { readonly x: number; readonly y: number }, reach: number): number | undefined {
  const onEndHandle = endHandles.find((handle) => Math.hypot(handle.x - at.x, handle.y - at.y) < reach);
  return onEndHandle?.id ?? endAt(boxes, at.x, at.y, reach);
}

type Place = { readonly kind: "parent"; readonly parentId: number | null } | { readonly kind: "nowhere" };

/**
 * What dropping a moved item at a point means: a move into the innermost boundary or node drawn there, whether or not an
 * element is drawn there too, or out to the top level on blank canvas. Dropping where the item already is, or inside itself,
 * means nothing.
 */
function placeAt(boxes: readonly C4Box[], movedId: number, x: number, y: number): Place {
  const moved = boxes.find((box) => box.id === movedId);
  const hits = boxes.filter((box) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
  if (hits.some((box) => box.id === movedId)) return { kind: "nowhere" };
  const target = hits.filter((box) => box.item !== "element").at(-1);
  if (target === undefined) return moved?.parentId === null ? { kind: "nowhere" } : { kind: "parent", parentId: null };
  return moved?.parentId === target.id ? { kind: "nowhere" } : { kind: "parent", parentId: target.id };
}

/** How close to another relationship's middle a drop must be to take its place. */
const REORDER_REACH = 60;

/** The position of the other relationship whose middle is nearest the point, if one is within reach. */
function relationshipIndexAt(boxes: readonly C4Box[], relationships: readonly Relationship[], movedId: number, x: number, y: number): number | undefined {
  const byId = new Map(boxes.map((box) => [box.id, box]));
  let nearest: { readonly index: number; readonly distance: number } | undefined;
  for (const [index, relationship] of relationships.entries()) {
    const first = byId.get(relationship.from);
    const second = byId.get(relationship.to);
    if (relationship.id === movedId || !first || !second) continue;
    const start = edgePoint(first, second);
    const end = edgePoint(second, first);
    const distance = Math.hypot((start.x + end.x) / 2 - x, (start.y + end.y) / 2 - y);
    if (distance <= REORDER_REACH && (nearest === undefined || distance < nearest.distance)) nearest = { index, distance };
  }
  return nearest?.index;
}

const WORDING = typeWording("c4");

/** The prompt for what the canvas is waiting for: a label being typed, or the target of a relationship being drawn. */
function promptFor(editing: boolean, drawing: boolean): string | null {
  if (editing) return en.canvasHelp.labelEditing;
  return drawing ? WORDING.connectDestination : null;
}

/** Elements, boundaries and nodes in the order and nesting Mermaid arranges them, with relationships between (research R3, FR-038). */
export function C4Canvas({ handleRef, onZoomChange, diagram, inlineEdit, onStartEdit, selection, onSelect, onCreateRelationship, onMoveEnd, onMoveToParent, onReorder }: Readonly<C4CanvasProps>) {
  const svg = useRef<SVGSVGElement>(null);
  const helpId = useId();
  // The item under the pointer, whose handles are shown with those of the selected item.
  const [hovered, setHovered] = useState<number | null>(null);
  const { content } = diagram;
  const layout = useMemo(() => c4Layout(content), [content]);
  const boxes = useMemo(() => new Map(layout.boxes.map((box) => [box.id, box])), [layout]);
  const scroller = useRef<HTMLDivElement>(null);
  const { zoom, zoomTo } = useSvgViewport(handleRef, layout, scroller);
  useTouchPan(scroller, zoom, zoomTo);
  useReportZoom(zoom, onZoomChange);
  // How far from a handle's middle a press or a release still counts as on it, in the drawing's own units.
  const reach = HANDLE_HIT / 2 / zoom;
  const chosen = content.relationships.find((relationship) => relationship.id === selection);
  const chosenFrom = chosen && boxes.get(chosen.from);
  const chosenTo = chosen && boxes.get(chosen.to);
  // The end handles of the selected relationship: a line let go over one of them ends at the item that end belongs to.
  const endHandles = useMemo(
    () => (chosen && chosenFrom && chosenTo ? [{ id: chosen.from, ...edgePoint(chosenFrom, chosenTo) }, { id: chosen.to, ...edgePoint(chosenTo, chosenFrom) }] : []),
    [chosen, chosenFrom, chosenTo],
  );
  const onDrop = useCallback(
    (drop: DragEnd<C4Drag>) => {
      if (drop.what.kind === "reorder") {
        const toIndex = relationshipIndexAt(layout.boxes, content.relationships, drop.what.id, drop.x, drop.y);
        if (toIndex !== undefined) onReorder(drop.what.id, toIndex);
        return;
      }
      if (drop.what.kind === "end") {
        if (!drop.inside) return;
        const target = endAt(layout.boxes, drop.x, drop.y, reach);
        if (target !== undefined) onMoveEnd(drop.what.id, drop.what.end, target);
        return;
      }
      if (drop.what.kind === "create") {
        // A line drawn from a handle ends on the element or node it is released over; anywhere else it is cancelled.
        const target = drop.inside ? lineEndAt(layout.boxes, endHandles, drop, reach) : undefined;
        if (target !== undefined) onCreateRelationship(drop.what.fromId, target);
        return;
      }
      const place = placeAt(layout.boxes, drop.what.id, drop.x, drop.y);
      if (place.kind === "parent") onMoveToParent(drop.what.id, place.parentId);
    },
    [layout, content.relationships, endHandles, reach, onCreateRelationship, onMoveEnd, onMoveToParent, onReorder],
  );
  const { begin: beginDrag, current } = useDrag<C4Drag>(svg, scroller, onDrop, zoom);
  const doubles = useDoubleActivation(onStartEdit);
  // The handlers the items are given never change, so an item is drawn again only when what it shows does: a hover then draws the
  // items it concerns, not every item and relationship. They reach the newest callbacks through a ref.
  const latest = useRef({ onSelect, onStartEdit, beginDrag, doubles });
  useEffect(() => {
    latest.current = { onSelect, onStartEdit, beginDrag, doubles };
  });
  const begin = useCallback<Begin>((what) => (event) => {
    latest.current.doubles.pressed(event);
    latest.current.beginDrag(what)(event);
  }, []);
  const selectItem = useCallback((id: number) => {
    latest.current.onSelect(id);
  }, []);
  const editItem = useCallback((id: number) => {
    latest.current.onStartEdit(id);
  }, []);
  const hoverItem = useCallback((id: number, over: boolean) => {
    setHovered(over ? id : null);
  }, []);
  const activate = useCallback((id: number, event: MouseEvent<SVGGElement>) => latest.current.doubles.released(id, event), []);
  const pressed = useCallback((event: { clientX: number; clientY: number }) => {
    latest.current.doubles.pressed(event);
  }, []);
  const creatingFrom = current?.what.kind === "create" ? boxes.get(current.what.fromId) : undefined;
  // While a relationship is drawn every element and node is a valid end (never a boundary) and the one under the pointer is where it will land.
  const drawing = creatingFrom !== undefined;
  const dropOn = drawing && current ? endAt(layout.boxes, current.x, current.y, reach) : undefined;
  const validIds = useMemo(() => new Set(validEnds(diagram)), [diagram]);
  // The side handles the end handles of the selected relationship sit on: only the end handle shows and is hit there.
  const coveredSides = chosenFrom && chosenTo ? coveredHandles([[chosenFrom, edgePoint(chosenFrom, chosenTo)], [chosenTo, edgePoint(chosenTo, chosenFrom)]], reach) : new Set<string>();
  return (
    <div
      ref={scroller}
      role="presentation"
      style={{ width: "100%", height: "100%", overflow: "auto", position: "relative", touchAction: "none", ...gridBackground(zoom) }}
      onClick={() => {
        onSelect(null);
      }}
    >
      <CanvasHelp id={helpId} text={en.canvasHelp.c4} />
      {content.tree.length === 0 && <EmptyHint lines={WORDING.steps} />}
      <CanvasPrompt text={promptFor(inlineEdit !== null, drawing)} />
      {diagram.title !== "" && (
        <div data-testid="c4-title" style={{ padding: "16px 32px 0", fontSize: 18, fontWeight: "bold", whiteSpace: "pre-wrap" }}>
          {diagram.title}
        </div>
      )}
      <svg
        ref={svg}
        width={layout.width * zoom}
        height={layout.height * zoom}
        viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`}
        style={{ display: "block", touchAction: "none", userSelect: "none" }}
      >
        <defs>
          <marker id="c4-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="currentColor" />
          </marker>
        </defs>
        {layout.boxes.map((box) => {
          const item = findItem(content.tree, box.id);
          return item && <ItemView key={box.id} box={box} item={item} helpId={helpId} chosen={box.id === selection} onSelect={selectItem} target={drawing ? targetMark(validIds.has(box.id), dropOn === box.id) : undefined} onEdit={editItem} onHover={hoverItem} begin={begin} edit={inlineEdit?.itemId === box.id ? inlineEdit : undefined} activate={activate} />;
        })}
        {content.relationships.map((relationship, position) => {
          const from = boxes.get(relationship.from);
          const to = boxes.get(relationship.to);
          if (!from || !to) return null;
          return (
            <RelationshipView
              key={relationship.id}
              relationship={relationship}
              source={from}
              target={to}
              fromName={findItem(content.tree, relationship.from)?.label ?? ""}
              toName={findItem(content.tree, relationship.to)?.label ?? ""}
              chosen={relationship.id === selection}
              number={diagram.kind === "dynamic" ? position + 1 : undefined}
              onSelect={selectItem}
              onEdit={editItem}
              begin={begin}
              pressed={pressed}
              edit={inlineEdit?.itemId === relationship.id ? inlineEdit : undefined}
              activate={activate}
            />
          );
        })}
        {layout.boxes.map((box) => {
          const item = findItem(content.tree, box.id);
          // The handles are drawn above the lines, so a line crossing an item never takes a press meant for a handle.
          // An element or node too small on screen to hold handles shows none.
          return item && item.item !== "boundary" && handlesFit(box, zoom) && SIDES.map((side) => <SideHandle key={`${String(box.id)}-${side}`} box={box} side={side} itemId={box.id} covered={coveredSides.has(`${String(box.id)}-${side}`)} visible={hovered === box.id || selection === box.id} zoom={zoom} begin={begin} onHover={hoverItem} />);
        })}
        {chosen && chosenFrom && chosenTo && (
          <g>
            <EndHandle end="from" {...edgePoint(chosenFrom, chosenTo)} begin={begin} id={chosen.id} zoom={zoom} />
            <EndHandle end="to" {...edgePoint(chosenTo, chosenFrom)} begin={begin} id={chosen.id} zoom={zoom} />
          </g>
        )}
        {creatingFrom && current?.what.kind === "create" && (
          <line data-testid="connection-preview" x1={sidePoint(creatingFrom, current.what.side).x} y1={sidePoint(creatingFrom, current.what.side).y} x2={current.x} y2={current.y} stroke="currentColor" strokeDasharray="4 4" pointerEvents="none" />
        )}
      </svg>
    </div>
  );
}
