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
