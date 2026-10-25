/** Text for assistive technology only: what an item of the canvas can be dragged, pressed and asked to do. */
export function CanvasHelp({ id, text }: Readonly<{ id: string; text: string }>) {
  return (
    <div
      id={id}
      style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}
    >
      {text}
    </div>
  );
}

/**
 * The one sentence that says what the canvas is waiting for: a label being edited, or a connection being chosen. It is seen as
 * well as announced, sits at the top of the canvas and never takes the pointer. Nothing is drawn when there is nothing to say.
 */
export function CanvasPrompt({ text }: Readonly<{ text: string | null }>) {
  return (
    <div role="status" style={{ position: "absolute", top: 8, left: 8, right: 8, zIndex: 5, pointerEvents: "none", textAlign: "center" }}>
      {text !== null && (
        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 4, background: "var(--prompt-background, Canvas)", color: "var(--prompt-ink, CanvasText)", border: "1px solid currentColor" }}>
          {text}
        </span>
      )}
    </div>
  );
}
