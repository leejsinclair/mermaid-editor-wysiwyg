import { useCallback, useMemo, useRef } from "react";
import { MESSAGE_STYLE_NAMES, ROLE_NAMES } from "../../model/sequence/catalogue";
import type { SequenceDiagram } from "../../model/types";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { HEADER_HEIGHT, sequenceLayout, type Lifeline, type MessageRow, type SequenceLayout } from "../layout/sequenceLayout";
import { lifelineAt, messageIndexAt, participantIndexAt, useDrag, type DragEnd, type DragKind } from "./gestures";
import { MESSAGE_DRAWING, MessageMarkers } from "./messageDrawing";
import { MultilineText } from "./MultilineText";

const HEADER_WIDTH = 140;
const LOOP_WIDTH = 40;
const LOOP_HEIGHT = 28;
const HANDLE_RADIUS = 7;

interface SequenceCanvasProps {
  readonly diagram: SequenceDiagram;
  readonly selection: number | null;
  readonly onSelect: (itemId: number | null) => void;
  /** A participant or message was dragged to a new position in its order. */
  readonly onReorder: (itemId: number, toIndex: number) => void;
  /** A drag from one lifeline to another asked for a message between them. */
  readonly onCreateMessage: (from: number, to: number) => void;
  /** A message end was dragged to another lifeline. */
  readonly onMoveEnd: (messageId: number, end: "from" | "to", targetId: number) => void;
}

type Begin = (what: DragKind) => (event: { clientX: number; clientY: number; button: number }) => void;

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

function ParticipantView({ lifeline, chosen, height, onSelect, begin }: Readonly<{ lifeline: Lifeline; chosen: boolean; height: number; onSelect: () => void; begin: Begin }>) {
  const roleName = ROLE_NAMES.get(lifeline.role) ?? lifeline.role;
  const x = lifeline.x;
  const width = chosen ? 3 : 1.5;
  return (
    <g
      data-testid="participant"
      data-id={lifeline.id}
      data-role={lifeline.role}
      aria-label={fill(en.sequence.participantName, { role: roleName, label: lifeline.label })}
      aria-pressed={chosen}
      {...selectable(onSelect)}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <line x1={x} y1={HEADER_HEIGHT - 20} x2={x} y2={height - 40} stroke="currentColor" strokeDasharray="6 6" opacity={0.5} />
      <rect
        data-testid="lifeline"
        x={x - 12}
        y={HEADER_HEIGHT - 20}
        width={24}
        height={Math.max(height - HEADER_HEIGHT - 20, 1)}
        fill="transparent"
        onPointerDown={begin({ kind: "create", fromId: lifeline.id })}
      />
      <g data-testid="participant-header" onPointerDown={begin({ kind: "participant", id: lifeline.id })}>
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
        <MultilineText text={lifeline.label} x={x} y={lifeline.role === "actor" ? 62 : 35} textAnchor="middle" fill="currentColor" fontSize={14} />
      </g>
    </g>
  );
}

function EndHandle({ end, x, y, begin, id }: Readonly<{ end: "from" | "to"; x: number; y: number; begin: Begin; id: number }>) {
  return (
    <circle
      data-testid={`message-end-${end}`}
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

function MessageView({ row, chosen, ends, names, onSelect, begin }: Readonly<{ row: MessageRow; chosen: boolean; ends: { from: number; to: number }; names: { from: string; to: string }; onSelect: () => void; begin: Begin }>) {
  const drawing = MESSAGE_DRAWING.get(row.style) ?? { dashed: false, ending: "arrow" as const };
  const path = row.loop
    ? `M${String(row.fromX)} ${String(row.y - LOOP_HEIGHT / 2)} h${String(LOOP_WIDTH)} v${String(LOOP_HEIGHT)} h${String(-LOOP_WIDTH)}`
    : `M${String(row.fromX)} ${String(row.y)} H${String(row.toX)}`;
  return (
    <g
      data-testid="message"
      data-id={row.id}
      data-style={row.style}
      data-from={ends.from}
      data-to={ends.to}
      aria-label={fill(en.sequence.messageName, { type: MESSAGE_STYLE_NAMES.get(row.style) ?? row.style, ...names, text: row.text })}
      aria-pressed={chosen}
      {...selectable(onSelect)}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerDown={begin({ kind: "message", id: row.id })}
    >
      <path d={path} stroke="transparent" strokeWidth={18} fill="none" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={chosen ? 3 : 1.5} strokeDasharray={drawing.dashed ? "6 4" : undefined} markerEnd={`url(#seq-${drawing.ending})`} />
      <MultilineText
        text={row.text}
        x={row.loop ? row.fromX + LOOP_WIDTH + 8 : (row.fromX + row.toX) / 2}
        y={row.loop ? row.y + 4 : row.y - 8}
        textAnchor={row.loop ? "start" : "middle"}
        fill="currentColor"
        fontSize={13}
        data-testid="message-text"
      />
    </g>
  );
}

/** What a finished drag asks for, by the kind of drag it was. */
function dropped(layout: SequenceLayout, diagram: SequenceDiagram, end: DragEnd<DragKind>, props: Pick<SequenceCanvasProps, "onReorder" | "onCreateMessage" | "onMoveEnd">): void {
  const { what, x, y } = end;
  if (what.kind === "participant") props.onReorder(what.id, participantIndexAt(x, diagram.content.participants.length));
  else if (what.kind === "message") props.onReorder(what.id, messageIndexAt(y, diagram.content.messages.length));
  else {
    const target = lifelineAt(layout, x);
    if (target === undefined) return;
    if (what.kind === "create") props.onCreateMessage(what.fromId, target);
    else props.onMoveEnd(what.id, what.end, target);
  }
}

/** Lifelines left to right and messages top to bottom, drawn from the pure layout (research R3, FR-029). */
export function SequenceCanvas({ diagram, selection, onSelect, onReorder, onCreateMessage, onMoveEnd }: Readonly<SequenceCanvasProps>) {
  const svg = useRef<SVGSVGElement>(null);
  const layout = useMemo(() => sequenceLayout(diagram.content), [diagram.content]);
  const names = useMemo(() => new Map(diagram.content.participants.map((participant) => [participant.id, participant.label])), [diagram.content.participants]);
  const messages = useMemo(() => new Map(diagram.content.messages.map((message) => [message.id, message])), [diagram.content.messages]);
  const onDrop = useCallback((end: DragEnd<DragKind>) => {
    dropped(layout, diagram, end, { onReorder, onCreateMessage, onMoveEnd });
  }, [layout, diagram, onReorder, onCreateMessage, onMoveEnd]);
  const { begin, current } = useDrag<DragKind>(svg, onDrop);
  const creatingFrom = current?.what.kind === "create" ? current.what.fromId : undefined;
  const creating = layout.lifelines.find((lifeline) => lifeline.id === creatingFrom);
  const chosenRow = layout.rows.find((row) => row.id === selection);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <svg
        ref={svg}
        width={layout.width}
        height={layout.height}
        style={{ display: "block", minWidth: "100%", touchAction: "none", userSelect: "none" }}
        onClick={() => {
          onSelect(null);
        }}
        role="presentation"
      >
        <MessageMarkers prefix="seq" />
        {layout.lifelines.map((lifeline) => (
          <ParticipantView
            key={lifeline.id}
            lifeline={lifeline}
            chosen={lifeline.id === selection}
            height={layout.height}
            onSelect={() => {
              onSelect(lifeline.id);
            }}
            begin={begin}
          />
        ))}
        {layout.rows.map((row) => {
          const message = messages.get(row.id);
          return (
            <MessageView
              key={row.id}
              row={row}
              chosen={row.id === selection}
              ends={{ from: message?.from ?? 0, to: message?.to ?? 0 }}
              names={{ from: names.get(message?.from ?? 0) ?? "", to: names.get(message?.to ?? 0) ?? "" }}
              onSelect={() => {
                onSelect(row.id);
              }}
              begin={begin}
            />
          );
        })}
        {chosenRow && (
          <g>
            <EndHandle end="from" x={chosenRow.fromX} y={chosenRow.y} begin={begin} id={chosenRow.id} />
            <EndHandle end="to" x={chosenRow.loop ? chosenRow.toX + LOOP_WIDTH : chosenRow.toX} y={chosenRow.loop ? chosenRow.y + LOOP_HEIGHT / 2 : chosenRow.y} begin={begin} id={chosenRow.id} />
          </g>
        )}
        {creating && current && <line x1={creating.x} y1={current.startY} x2={current.x} y2={current.y} stroke="currentColor" strokeDasharray="4 4" pointerEvents="none" />}
      </svg>
    </div>
  );
}
