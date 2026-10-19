import { useCallback, useMemo, useRef, type Ref } from "react";
import { EmptyHint } from "../shared/EmptyHint";
import { useSvgViewport, type ViewHandle } from "../shared/viewport";
import { BOUNDARY_NAMES, DEPLOYMENT_NODE_NAME, DIRECTION_NAMES, ELEMENT_TYPE_NAMES } from "../../model/c4/catalogue";
import { findItem } from "../../model/c4/tree";
import type { C4Diagram, C4Item, Relationship } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { c4Layout, type C4Box } from "../layout/c4Layout";
import { MultilineText } from "../sequence/MultilineText";
import { useDrag, type DragEnd } from "../shared/useDrag";

const HANDLE_RADIUS = 7;

type C4Drag = { readonly kind: "create"; readonly fromId: number } | { readonly kind: "move"; readonly id: number } | { readonly kind: "reorder"; readonly id: number } | { readonly kind: "end"; readonly id: number; readonly end: "from" | "to" };
type Begin = (what: C4Drag) => (event: { clientX: number; clientY: number; button: number }) => void;

interface C4CanvasProps {
  readonly handleRef?: Ref<ViewHandle>;
  readonly diagram: C4Diagram;
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
function selectable(select: () => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      select();
    },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
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

const fillOpacity = (container: boolean, external: boolean): number => {
  if (container) return 0;
  return external ? 0.25 : 0.1;
};

function ItemView({ box, item, chosen, onSelect, begin }: Readonly<{ box: C4Box; item: C4Item; chosen: boolean; onSelect: () => void; begin: Begin }>) {
  const container = item.item !== "element";
  const external = item.item === "element" && item.elementType.endsWith("-ext");
  const lines = details(item);
  return (
    <g
      data-testid={TESTIDS.get(item.item)}
      data-id={item.id}
      aria-label={fill(en.c4.itemName, { type: typeNameOf(item), label: item.label })}
      aria-pressed={chosen}
      {...selectable(onSelect)}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerDown={begin(item.item === "element" ? { kind: "create", fromId: item.id } : { kind: "move", id: item.id })}
    >
      <rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        rx={6}
        fill={container ? "transparent" : "currentColor"}
        fillOpacity={fillOpacity(container, external)}
        stroke="currentColor"
        strokeWidth={chosen ? 3 : 1.5}
        strokeDasharray={item.item === "boundary" ? "8 5" : undefined}
      />
      <MultilineText
        data-testid="item-label"
        text={item.label}
        x={container ? box.x + 12 : box.x + box.width / 2}
        y={container ? box.y + 24 : box.y + 30}
        textAnchor={container ? "start" : "middle"}
        fill="currentColor"
        fontSize={14}
        fontWeight="bold"
      />
      {lines.map((line, index) => (
        <MultilineText
          key={line.name}
          data-testid={line.name}
          text={line.text}
          x={container ? box.x + 12 : box.x + box.width / 2}
          y={container ? box.y + 40 + index * 16 : box.y + 54 + index * 18}
          textAnchor={container ? "start" : "middle"}
          fill="currentColor"
          fontSize={12}
        />
      ))}
    </g>
  );
}

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

function RelationshipView({ relationship, source, target, names, chosen, number, onSelect, begin }: Readonly<{ relationship: Relationship; source: C4Box; target: C4Box; names: { from: string; to: string }; chosen: boolean; number: number | undefined; onSelect: () => void; begin: Begin }>) {
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
      data-id={relationship.id}
      data-number={number}
      aria-label={fill(en.c4.relationshipName, { kind: DIRECTION_NAMES.get(relationship.direction) ?? relationship.direction, ...names, label: relationship.label })}
      aria-pressed={chosen}
      {...selectable(onSelect)}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerDown={number === undefined ? undefined : begin({ kind: "reorder", id: relationship.id })}
    >
      <path d={path} stroke="transparent" strokeWidth={18} fill="none" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={chosen ? 3 : 1.5} markerEnd="url(#c4-arrow)" markerStart={twoWay ? "url(#c4-arrow)" : undefined} />
      {number !== undefined && (
        <g data-testid="relationship-number">
          <circle cx={start.x} cy={start.y} r={11} fill="currentColor" fillOpacity={0.15} stroke="currentColor" />
          <text x={start.x} y={start.y + 4} textAnchor="middle" fill="currentColor" fontSize={12}>
            {number}
          </text>
        </g>
      )}
      <MultilineText text={relationship.label} x={middle.x} y={middle.y - 6} textAnchor={looping ? "start" : "middle"} fill="currentColor" fontSize={12} data-testid="relationship-text" />
    </g>
  );
}

function EndHandle({ end, x, y, begin, id }: Readonly<{ end: "from" | "to"; x: number; y: number; begin: Begin; id: number }>) {
  return (
    <circle
      data-testid={`relationship-end-${end}`}
      cx={x}
      cy={y}
      r={HANDLE_RADIUS}
      fill="currentColor"
      opacity={0.6}
      style={{ cursor: "grab" }}
      onPointerDown={(event) => {
        event.stopPropagation();
        begin({ kind: "end", id, end })(event);
      }}
    />
  );
}

/** The element (or, in Deployment, node) drawn at a point, the innermost when they nest. */
function endAt(boxes: readonly C4Box[], x: number, y: number): number | undefined {
  const hits = boxes.filter((box) => box.item !== "boundary" && x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
  return hits.at(-1)?.id;
}

type Place = { readonly kind: "parent"; readonly parentId: number | null } | { readonly kind: "element"; readonly id: number } | { readonly kind: "nowhere" };

/**
 * What dropping the item at a point means: on an element, a relationship to it; on a boundary or node, a move into it;
 * on blank canvas, a move out to the top level. Dropping where the item already is, or inside itself, means nothing.
 */
function placeAt(boxes: readonly C4Box[], movedId: number, x: number, y: number): Place {
  const moved = boxes.find((box) => box.id === movedId);
  const hits = boxes.filter((box) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
  const target = hits.at(-1);
  if (target === undefined) return moved?.parentId === null ? { kind: "nowhere" } : { kind: "parent", parentId: null };
  if (target.item === "element") return { kind: "element", id: target.id };
  const inside = hits.some((box) => box.id === movedId);
  return inside || moved?.parentId === target.id ? { kind: "nowhere" } : { kind: "parent", parentId: target.id };
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

/** Elements, boundaries and nodes in the order and nesting Mermaid arranges them, with relationships between (research R3, FR-038). */
export function C4Canvas({ handleRef, diagram, selection, onSelect, onCreateRelationship, onMoveEnd, onMoveToParent, onReorder }: Readonly<C4CanvasProps>) {
  const svg = useRef<SVGSVGElement>(null);
  const { content } = diagram;
  const layout = useMemo(() => c4Layout(content), [content]);
  const boxes = useMemo(() => new Map(layout.boxes.map((box) => [box.id, box])), [layout]);
  const onDrop = useCallback(
    (drop: DragEnd<C4Drag>) => {
      if (drop.what.kind === "reorder") {
        const toIndex = relationshipIndexAt(layout.boxes, content.relationships, drop.what.id, drop.x, drop.y);
        if (toIndex !== undefined) onReorder(drop.what.id, toIndex);
        return;
      }
      if (drop.what.kind === "end") {
        const target = endAt(layout.boxes, drop.x, drop.y);
        if (target !== undefined) onMoveEnd(drop.what.id, drop.what.end, target);
        return;
      }
      const movedId = drop.what.kind === "create" ? drop.what.fromId : drop.what.id;
      const place = placeAt(layout.boxes, movedId, drop.x, drop.y);
      if (place.kind === "parent") onMoveToParent(movedId, place.parentId);
      else if (place.kind === "element" && drop.what.kind === "create") onCreateRelationship(drop.what.fromId, place.id);
    },
    [layout, content.relationships, onCreateRelationship, onMoveEnd, onMoveToParent, onReorder],
  );
  const scroller = useRef<HTMLDivElement>(null);
  const zoom = useSvgViewport(handleRef, layout, scroller);
  const { begin, current } = useDrag<C4Drag>(svg, onDrop, zoom);
  const creatingFrom = current?.what.kind === "create" ? boxes.get(current.what.fromId) : undefined;
  const chosen = content.relationships.find((relationship) => relationship.id === selection);
  const chosenFrom = chosen && boxes.get(chosen.from);
  const chosenTo = chosen && boxes.get(chosen.to);

  return (
    <div
      ref={scroller}
      role="presentation"
      style={{ width: "100%", height: "100%", overflow: "auto", position: "relative" }}
      onClick={() => {
        onSelect(null);
      }}
    >
      {content.tree.length === 0 && <EmptyHint />}
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
          return item && <ItemView key={box.id} box={box} item={item} chosen={box.id === selection} onSelect={() => { onSelect(box.id); }} begin={begin} />;
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
              names={{ from: findItem(content.tree, relationship.from)?.label ?? "", to: findItem(content.tree, relationship.to)?.label ?? "" }}
              chosen={relationship.id === selection}
              number={diagram.kind === "dynamic" ? position + 1 : undefined}
              onSelect={() => {
                onSelect(relationship.id);
              }}
              begin={begin}
            />
          );
        })}
        {chosen && chosenFrom && chosenTo && (
          <g>
            <EndHandle end="from" {...edgePoint(chosenFrom, chosenTo)} begin={begin} id={chosen.id} />
            <EndHandle end="to" {...edgePoint(chosenTo, chosenFrom)} begin={begin} id={chosen.id} />
          </g>
        )}
        {creatingFrom && current && <line x1={creatingFrom.x + creatingFrom.width / 2} y1={creatingFrom.y + creatingFrom.height / 2} x2={current.x} y2={current.y} stroke="currentColor" strokeDasharray="4 4" pointerEvents="none" />}
      </svg>
    </div>
  );
}
