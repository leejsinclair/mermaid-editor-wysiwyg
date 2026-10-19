import { Alert, Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { latestOnly } from "../shared/latestOnly";

interface ViewBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

type Drawn = { readonly svg: string } | { readonly error: string };

const ZOOM_STEP = 1.25;
const PAN_STEP = 0.1;
let drawings = 0;

/**
 * Draws the source the way Mermaid does, with the strict security level (research R4). Mermaid measures text in a
 * container that must be in the document, so it gets a hidden one that is removed afterwards.
 */
async function drawWithMermaid(source: string): Promise<Drawn> {
  const scratch = document.createElement("div");
  scratch.setAttribute("aria-hidden", "true");
  scratch.style.cssText = "position:absolute;left:-10000px;top:0;visibility:hidden";
  document.body.append(scratch);
  try {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
    drawings += 1;
    const { svg } = await mermaid.render(`preview-${String(drawings)}`, source, scratch);
    return { svg };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    scratch.remove();
  }
}

function parseViewBox(svg: SVGSVGElement): ViewBox | undefined {
  const [x, y, w, h] = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
  return x === undefined || y === undefined || !w || !h ? undefined : { x, y, w, h };
}

const zoomed = (view: ViewBox, factor: number): ViewBox => ({
  x: view.x + (view.w - view.w / factor) / 2,
  y: view.y + (view.h - view.h / factor) / 2,
  w: view.w / factor,
  h: view.h / factor,
});

interface PreviewProps {
  readonly source: string;
}

/** A read-only view of the diagram as Mermaid draws it, with zoom, pan and fit (FR-016, EC-06). */
export function Preview({ source }: PreviewProps) {
  const latest = useMemo(() => latestOnly(), []);
  const [drawn, setDrawn] = useState<{ source: string; result: Drawn } | undefined>();
  const [base, setBase] = useState<ViewBox | undefined>();
  const [view, setView] = useState<ViewBox | undefined>();
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    void latest(() => drawWithMermaid(source)).then((result) => {
      if (result) setDrawn({ source, result });
    });
  }, [latest, source]);

  const svgMarkup = drawn && "svg" in drawn.result ? drawn.result.svg : undefined;
  // Mermaid sanitises its own output at the strict security level before it reaches this point.
  useEffect(() => {
    const element = host.current;
    if (!element || svgMarkup === undefined) return;
    element.innerHTML = svgMarkup;
    const svg = element.querySelector("svg");
    if (!svg) return;
    const box = parseViewBox(svg);
    svg.removeAttribute("style");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    setBase(box);
    setView(box);
  }, [svgMarkup]);

  useEffect(() => {
    const svg = host.current?.querySelector("svg");
    if (svg && view) svg.setAttribute("viewBox", `${String(view.x)} ${String(view.y)} ${String(view.w)} ${String(view.h)}`);
  }, [view]);

  const pan = (dx: number, dy: number) => {
    setView((current) => (current ? { ...current, x: current.x + dx * current.w, y: current.y + dy * current.h } : current));
  };
  const zoom = (factor: number) => {
    setView((current) => (current ? zoomed(current, factor) : current));
  };

  const onPointerDown = (event: PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent) => {
    const last = pointer.current;
    const element = host.current;
    if (!last || !element || !view) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    const scale = view.w / Math.max(element.clientWidth, 1);
    setView({ ...view, x: view.x - (event.clientX - last.x) * scale, y: view.y - (event.clientY - last.y) * scale });
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => {
        pan(-PAN_STEP, 0);
      },
      ArrowRight: () => {
        pan(PAN_STEP, 0);
      },
      ArrowUp: () => {
        pan(0, -PAN_STEP);
      },
      ArrowDown: () => {
        pan(0, PAN_STEP);
      },
      "+": () => {
        zoom(ZOOM_STEP);
      },
      "-": () => {
        zoom(1 / ZOOM_STEP);
      },
    };
    const move = Object.hasOwn(moves, event.key) ? moves[event.key] : undefined;
    if (!move) return;
    event.preventDefault();
    move();
  };

  const failure = drawn && "error" in drawn.result ? drawn.result.error : undefined;
  return (
    <Box component="section" aria-label={en.toolbar.preview} sx={{ borderTop: 1, borderColor: "divider", p: 1 }}>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Button size="small" variant="outlined" onClick={() => { zoom(ZOOM_STEP); }}>
          {en.preview.zoomIn}
        </Button>
        <Button size="small" variant="outlined" onClick={() => { zoom(1 / ZOOM_STEP); }}>
          {en.preview.zoomOut}
        </Button>
        <Button size="small" variant="outlined" onClick={() => { setView(base); }}>
          {en.preview.fit}
        </Button>
      </Box>
      {failure === undefined ? (
        // A pan-and-zoom drawing is a custom widget: it takes focus, arrow keys, + and -, and pointer drags.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          ref={host}
          role="application"
          aria-label={en.preview.drawing}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the widget takes keyboard focus
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => {
            pointer.current = null;
          }}
          style={{ height: 320, overflow: "hidden", cursor: "grab", touchAction: "none" }}
        />
      ) : (
        <Alert severity="error">{fill(en.preview.failed, { reason: failure })}</Alert>
      )}
      {drawn === undefined && <Typography variant="body2">{en.preview.drawingNow}</Typography>}
    </Box>
  );
}
