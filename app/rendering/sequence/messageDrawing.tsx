import type { MessageStyle } from "../../model/types";

/** How each of the eight message types is drawn: a solid or dashed line and one of four endings. */
export const MESSAGE_DRAWING = new Map<MessageStyle, { readonly dashed: boolean; readonly ending: "arrow" | "open" | "cross" | "async" }>([
  ["solid-arrow", { dashed: false, ending: "arrow" }],
  ["dashed-arrow", { dashed: true, ending: "arrow" }],
  ["solid-open", { dashed: false, ending: "open" }],
  ["dashed-open", { dashed: true, ending: "open" }],
  ["solid-cross", { dashed: false, ending: "cross" }],
  ["dashed-cross", { dashed: true, ending: "cross" }],
  ["solid-async", { dashed: false, ending: "async" }],
  ["dashed-async", { dashed: true, ending: "async" }],
]);

/** Marker definitions for the four endings; a canvas draws them once and each message refers to one by id. */
export function MessageMarkers({ prefix }: Readonly<{ prefix: string }>) {
  return (
    <defs>
      <marker id={`${prefix}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M0 0L10 5L0 10z" fill="currentColor" />
      </marker>
      <marker id={`${prefix}-open`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M0 0L10 5L0 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker id={`${prefix}-cross`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M1 1L9 9M9 1L1 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker id={`${prefix}-async`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto">
        <path d="M0 2L9 5L0 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M0 5L9 5" stroke="currentColor" strokeWidth="1.5" />
      </marker>
    </defs>
  );
}

/** A small drawing of a message type for the toolbox. */
export function MessageIcon({ style }: Readonly<{ style: MessageStyle }>) {
  const drawing = MESSAGE_DRAWING.get(style) ?? { dashed: false, ending: "arrow" as const };
  const prefix = `icon-${style}`;
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
      <MessageMarkers prefix={prefix} />
      <path d="M4 12h30" strokeDasharray={drawing.dashed ? "4 3" : undefined} markerEnd={`url(#${prefix}-${drawing.ending})`} />
    </svg>
  );
}
