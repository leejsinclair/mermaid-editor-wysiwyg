import { useCallback, useId, useMemo, useRef, useState, type MouseEvent, type Ref } from "react";
import { CanvasHelp } from "../shared/CanvasHelp";
import { EmptyHint } from "../shared/EmptyHint";
import { useSvgViewport, type ViewHandle } from "../shared/viewport";
import { MESSAGE_STYLE_NAMES, ROLE_NAMES } from "../../model/sequence/catalogue";
import type { SequenceDiagram } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { HEADER_HEIGHT, ROW_SPACING, sequenceLayout, type Lifeline, type MessageRow, type SequenceLayout } from "../layout/sequenceLayout";
import { HEADER_WIDTH, insertIndexAt, insertionY, messageIndexAt, participantAt, participantIndexAt, useDrag, type DragEnd, type DragKind } from "./gestures";
import { MESSAGE_DRAWING, MessageMarkers } from "./messageDrawing";
import { MultilineText } from "./MultilineText";
import { InlineLabelEditor, type InlineEdit } from "../shared/InlineLabelEditor";
import { HANDLE_DOT, HANDLE_HIT } from "../shared/handleSize";
import { targetMark, validEnds } from "../shared/interaction";
import { useDoubleActivation } from "../shared/useDoubleActivation";

/** Half the height of the band a message owns across its row, in drawing units. */
const ROW_BAND = 20;
/** The least gap between bands, in screen pixels, in which a lifeline still offers to start a message. */
const MIN_GAP = 24;
const LOOP_WIDTH = 40;
const LOOP_HEIGHT = 28;
/** The width of the editor on a message, which has no box of its own to fill. */
const EDITOR_WIDTH = 160;

interface SequenceCanvasProps {
  readonly handleRef?: Ref<ViewHandle>;
  readonly diagram: SequenceDiagram;
  /** The label being edited in place, or none. */
  readonly inlineEdit: InlineEdit | null;
  /** A double click, tap or pen tap on a participant or message: select it and open its label for editing. */
  readonly onStartEdit: (itemId: number) => void;
  readonly selection: number | null;
  readonly onSelect: (itemId: number | null) => void;
  /** A participant or message was dragged to a new position in its order. */
  readonly onReorder: (itemId: number, toIndex: number) => void;
  /** A drag from one lifeline to another asked for a message between them. */
  readonly onCreateMessage: (from: number, to: number, index: number) => void;
  /** A message end was dragged to another lifeline. */
  readonly onMoveEnd: (messageId: number, end: "from" | "to", targetId: number) => void;
}

type Begin = (what: DragKind) => (event: { clientX: number; clientY: number; button: number }) => void;

/** Makes a drawn item reachable from the keyboard: it takes focus and Enter or Space selects it. */
function selectable<E extends { stopPropagation: () => void }>(select: () => void, activate?: (event: E) => boolean, edit?: () => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: (event: E) => {
      event.stopPropagation();
      if (activate?.(event) !== true) select();
    },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        // Enter on an item that is already selected opens its label for editing.
        if (event.key === "Enter" && edit) edit();
        else select();
      }
    },
  };
}

function ParticipantView({ lifeline, chosen, hovered, target, height, zoom, helpId, onSelect, onEdit, onHover, onHint, begin, edit, activate }: Readonly<{ lifeline: Lifeline; chosen: boolean; hovered: boolean; helpId: string; target: "valid" | "drop" | undefined; height: number; zoom: number; onHover: (hovered: boolean) => void; onHint: (hinted: boolean) => void; onSelect: () => void; onEdit: () => void; begin: Begin; edit: InlineEdit | undefined; activate: (event: MouseEvent<SVGGElement>) => boolean }>) {
  const roleName = ROLE_NAMES.get(lifeline.role) ?? lifeline.role;
  const name = fill(en.sequence.participantName, { role: roleName, label: lifeline.label });
  const x = lifeline.x;
  const width = chosen ? 3 : 1.5;
  return (
    <g
      data-testid="participant"
      {...(target && { "data-target": target })}
      data-id={lifeline.id}
      data-role={lifeline.role}
      aria-label={name}
      aria-describedby={helpId}
      aria-pressed={edit ? undefined : chosen}
      {...selectable(onSelect, activate, chosen ? onEdit : undefined)}
      // While its label is typed the item holds a text field, so it is a group rather than a button.
      role={edit ? "group" : "button"}
      style={{ outline: "none" }}
      onPointerEnter={() => {
        onHover(true);
      }}
      onPointerLeave={() => {
        onHover(false);
      }}
    >
      <circle data-handle-dot data-visible={chosen || hovered} cx={x} cy={HEADER_HEIGHT + 4} r={HANDLE_DOT / 2 / zoom} fill="currentColor" fillOpacity={0.6} pointerEvents="none" />
      <line x1={x} y1={HEADER_HEIGHT - 20} x2={x} y2={height - 40} stroke="currentColor" strokeDasharray="6 6" opacity={0.5} />
      <rect
        data-testid="lifeline"
        data-zone="connect"
        role="img"
        aria-label={en.canvasHelp.lifeline}
        data-visible={chosen || hovered}
        onPointerEnter={() => {
          onHint(true);
        }}
        onPointerLeave={() => {
          onHint(false);
        }}
        x={x - HANDLE_HIT / zoom / 2}
        y={HEADER_HEIGHT - 20}
        width={HANDLE_HIT / zoom}
        height={Math.max(height - HEADER_HEIGHT + 20, 1)}
        fill="transparent"
        onPointerDown={begin({ kind: "create", fromId: lifeline.id })}
      />
      <g data-testid="participant-header" data-zone="body" onPointerDown={begin({ kind: "participant", id: lifeline.id })}>
        <rect x={x - HEADER_WIDTH / 2} y={0} width={HEADER_WIDTH} height={lifeline.role === "actor" ? 72 : 50} fill="transparent" />
        <rect data-target-ring x={x - HEADER_WIDTH / 2 - 6} y={4} width={HEADER_WIDTH + 12} height={lifeline.role === "actor" ? 74 : 52} rx={8} fill="none" stroke="currentColor" />
        <rect data-hover-outline x={x - HEADER_WIDTH / 2 - 3} y={7} width={HEADER_WIDTH + 6} height={lifeline.role === "actor" ? 68 : 46} rx={6} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" />
        {lifeline.role === "actor" ? (
          <path
            d={`M${String(x)} 10 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M${String(x)} 18 v14 M${String(x - 12)} 24 h24 M${String(x)} 32 l-10 14 M${String(x)} 32 l10 14`}
            fill="none"
            stroke="currentColor"
            strokeWidth={width}
          />
        ) : (
          <rect x={x - HEADER_WIDTH / 2} y={10} width={HEADER_WIDTH} height={40} rx={4} fill="transparent" stroke="currentColor" strokeWidth={width} />
        )}
        {edit ? (
          <foreignObject overflow="visible" x={x - HEADER_WIDTH / 2 + 4} y={lifeline.role === "actor" ? 48 : 14} width={HEADER_WIDTH - 8} height={30}>
            <InlineLabelEditor name={name} edit={edit} />
          </foreignObject>
        ) : (
          <MultilineText text={lifeline.label} x={x} y={lifeline.role === "actor" ? 62 : 35} textAnchor="middle" fill="currentColor" fontSize={14} />
        )}
      </g>
    </g>
  );
}

function EndHandle({ end, x, y, begin, id, zoom }: Readonly<{ end: "from" | "to"; x: number; y: number; begin: Begin; id: number; zoom: number }>) {
  const hit = HANDLE_HIT / zoom;
  return (
    <g
      data-testid={`message-end-${end}`}
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

/** A message's text, or the editor on it while it is being edited. */
function MessageLabel({ row, name, edit }: Readonly<{ row: MessageRow; name: string; edit: InlineEdit | undefined }>) {
  const x = row.loop ? row.fromX + LOOP_WIDTH + 8 : (row.fromX + row.toX) / 2;
  if (edit) {
    return (
      <foreignObject overflow="visible" x={row.loop ? x : x - EDITOR_WIDTH / 2} y={row.loop ? row.y - 14 : row.y - 42} width={EDITOR_WIDTH} height={30}>
        <InlineLabelEditor name={name} edit={edit} />
      </foreignObject>
    );
  }
  return <MultilineText text={row.text} x={x} y={row.loop ? row.y + 4 : row.y - 8} textAnchor={row.loop ? "start" : "middle"} fill="currentColor" fontSize={13} data-testid="message-text" />;
}

function MessageView({ row, band, reach, chosen, ends, names, onSelect, onEdit, begin, edit, activate }: Readonly<{ row: MessageRow; band: number; reach: number; chosen: boolean; ends: { from: number; to: number }; names: { from: string; to: string }; onSelect: () => void; onEdit: () => void; begin: Begin; edit: InlineEdit | undefined; activate: (event: MouseEvent<SVGGElement>) => boolean }>) {
  const name = fill(en.sequence.messageName, { type: MESSAGE_STYLE_NAMES.get(row.style) ?? row.style, ...names, text: row.text });
  const drawing = MESSAGE_DRAWING.get(row.style) ?? { dashed: false, ending: "arrow" as const };
  const path = row.loop
    ? `M${String(row.fromX)} ${String(row.y - LOOP_HEIGHT / 2)} h${String(LOOP_WIDTH)} v${String(LOOP_HEIGHT)} h${String(-LOOP_WIDTH)}`
    : `M${String(row.fromX)} ${String(row.y)} H${String(row.toX)}`;
  return (
    <g
      data-testid="message"
      data-zone="line"
      data-id={row.id}
      data-style={row.style}
      data-from={ends.from}
      data-to={ends.to}
      aria-label={name}
      aria-pressed={edit ? undefined : chosen}
      {...selectable(onSelect, activate, chosen ? onEdit : undefined)}
      // While its label is typed the item holds a text field, so it is a group rather than a button.
      role={edit ? "group" : "button"}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerDown={begin({ kind: "message", id: row.id })}
    >
      <rect x={Math.min(row.fromX, row.toX) - reach} y={row.y - band} width={Math.abs(row.toX - row.fromX) + 2 * reach + (row.loop ? LOOP_WIDTH : 0)} height={2 * band} fill="transparent" />
      <path d={path} stroke="transparent" strokeWidth={18} fill="none" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={chosen ? 3 : 1.5} strokeDasharray={drawing.dashed ? "6 4" : undefined} markerEnd={`url(#seq-${drawing.ending})`} />
      <MessageLabel row={row} name={name} edit={edit} />
    </g>
  );
}

/** What a finished drag asks for, by the kind of drag it was. */
function dropped(layout: SequenceLayout, diagram: SequenceDiagram, end: DragEnd<DragKind>, strip: number, props: Pick<SequenceCanvasProps, "onReorder" | "onCreateMessage" | "onMoveEnd">): void {
  const { what, x, y } = end;
  if (what.kind === "participant") props.onReorder(what.id, participantIndexAt(x, diagram.content.participants.length));
  else if (what.kind === "message") props.onReorder(what.id, messageIndexAt(y, diagram.content.messages.length));
  else {
    // A line let go outside the drawing is cancelled.
    if (!end.inside) return;
    const target = participantAt(layout, x, y, strip);
    if (target === undefined) return;
    if (what.kind === "create") props.onCreateMessage(what.fromId, target, insertIndexAt(y, layout.rows.map((row) => row.y)));
    else props.onMoveEnd(what.id, what.end, target);
  }
}

/** Lifelines left to right and messages top to bottom, drawn from the pure layout (research R3, FR-029). */
export function SequenceCanvas({ handleRef, diagram, inlineEdit, onStartEdit, selection, onSelect, onReorder, onCreateMessage, onMoveEnd }: Readonly<SequenceCanvasProps>) {
  const svg = useRef<SVGSVGElement>(null);
  const helpId = useId();
  // The participant under the pointer, whose handle is shown with that of the selected participant.
  const [hovered, setHovered] = useState<number | null>(null);
  // The participant whose lifeline is under the pointer, which says that dragging from it adds a message.
  const [hintFor, setHintFor] = useState<number | null>(null);
  const layout = useMemo(() => sequenceLayout(diagram.content), [diagram.content]);
  const names = useMemo(() => new Map(diagram.content.participants.map((participant) => [participant.id, participant.label])), [diagram.content.participants]);
  const messages = useMemo(() => new Map(diagram.content.messages.map((message) => [message.id, message])), [diagram.content.messages]);
  const scroller = useRef<HTMLDivElement>(null);
  const zoom = useSvgViewport(handleRef, layout, scroller);
  const onDrop = useCallback((end: DragEnd<DragKind>) => {
    dropped(layout, diagram, end, HANDLE_HIT / zoom, { onReorder, onCreateMessage, onMoveEnd });
  }, [layout, diagram, zoom, onReorder, onCreateMessage, onMoveEnd]);
  const { begin: beginDrag, current } = useDrag<DragKind>(svg, scroller, onDrop, zoom);
  const doubles = useDoubleActivation(onStartEdit);
  const begin: Begin = (what) => (event) => {
    doubles.pressed(event);
    beginDrag(what)(event);
  };
  const creatingFrom = current?.what.kind === "create" ? current.what.fromId : undefined;
  const creating = layout.lifelines.find((lifeline) => lifeline.id === creatingFrom);
  // While a message is drawn every participant is a valid end and the one under the pointer is where it will land.
  const drawing = creating !== undefined;
  const dropOn = drawing && current ? participantAt(layout, current.x, current.y, HANDLE_HIT / zoom) : undefined;
  const validIds = useMemo(() => new Set(validEnds(diagram)), [diagram]);
  // A message owns the band of the drawing across its row, so the lifelines offer no connect zone there. Where the gap between
  // bands would be under 24 screen px the band is the whole row, and the lifeline offers none between messages at all.
  const rowBand = (ROW_SPACING - 2 * ROW_BAND) * zoom >= MIN_GAP ? ROW_BAND : ROW_SPACING / 2;
  const rowYs = layout.rows.map((row) => row.y);
  const hinted = drawing ? undefined : layout.lifelines.find((lifeline) => lifeline.id === hintFor);
  const chosenRow = layout.rows.find((row) => row.id === selection);

  return (
    <div
      ref={scroller}
      role="presentation"
      style={{ width: "100%", height: "100%", overflow: "auto", position: "relative" }}
      onClick={() => {
        onSelect(null);
      }}
    >
      <CanvasHelp id={helpId} text={en.canvasHelp.sequence} />
      {diagram.content.participants.length === 0 && <EmptyHint />}
      <svg
        ref={svg}
        width={layout.width * zoom}
        height={layout.height * zoom}
        viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`}
        style={{ display: "block", touchAction: "none", userSelect: "none" }}
      >
        <MessageMarkers prefix="seq" />
        {layout.lifelines.map((lifeline) => (
          <ParticipantView
            key={lifeline.id}
            lifeline={lifeline}
            chosen={lifeline.id === selection}
            hovered={hovered === lifeline.id}
            helpId={helpId}
            target={drawing ? targetMark(validIds.has(lifeline.id), dropOn === lifeline.id) : undefined}
            height={layout.height}
            zoom={zoom}
            onSelect={() => {
              onSelect(lifeline.id);
            }}
            onEdit={() => {
              onStartEdit(lifeline.id);
            }}
            onHover={(over) => {
              setHovered(over ? lifeline.id : null);
            }}
            onHint={(over) => {
              setHintFor(over ? lifeline.id : null);
            }}
            begin={begin}
            edit={inlineEdit?.itemId === lifeline.id ? inlineEdit : undefined}
            activate={(event) => event.target instanceof Element && event.target.closest("[data-zone='body']") !== null && doubles.released(lifeline.id, event)}
          />
        ))}
        {layout.rows.map((row) => {
          const message = messages.get(row.id);
          return (
            <MessageView
              key={row.id}
              row={row}
              band={rowBand}
              reach={HANDLE_HIT / 2 / zoom}
              chosen={row.id === selection}
              ends={{ from: message?.from ?? 0, to: message?.to ?? 0 }}
              names={{ from: names.get(message?.from ?? 0) ?? "", to: names.get(message?.to ?? 0) ?? "" }}
              onSelect={() => {
                onSelect(row.id);
              }}
              onEdit={() => {
                onStartEdit(row.id);
              }}
              begin={begin}
              edit={inlineEdit?.itemId === row.id ? inlineEdit : undefined}
              activate={(event) => doubles.released(row.id, event)}
            />
          );
        })}
        {chosenRow && (
          <g>
            <EndHandle end="from" x={chosenRow.fromX} y={chosenRow.y} begin={begin} id={chosenRow.id} zoom={zoom} />
            <EndHandle end="to" x={chosenRow.loop ? chosenRow.toX + LOOP_WIDTH : chosenRow.toX} y={chosenRow.loop ? chosenRow.y + LOOP_HEIGHT / 2 : chosenRow.y} begin={begin} id={chosenRow.id} zoom={zoom} />
          </g>
        )}
        {hinted && (
          <text data-testid="lifeline-hint" x={hinted.x + 16 / zoom} y={HEADER_HEIGHT + 10} fontSize={12 / zoom} fill="currentColor" pointerEvents="none">
            {en.sequence.lifelineHint}
          </text>
        )}
        {drawing && current && (
          <line data-testid="insertion-marker" x1={layout.lifelines[0]?.x ?? 0} x2={layout.lifelines.at(-1)?.x ?? 0} y1={insertionY(insertIndexAt(current.y, rowYs), rowYs)} y2={insertionY(insertIndexAt(current.y, rowYs), rowYs)} stroke="currentColor" strokeWidth={2} strokeDasharray="2 4" pointerEvents="none" />
        )}
        {creating && current && <line data-testid="connection-preview" x1={creating.x} y1={current.startY} x2={current.x} y2={current.y} stroke="currentColor" strokeDasharray="4 4" pointerEvents="none" />}
      </svg>
    </div>
  );
}
