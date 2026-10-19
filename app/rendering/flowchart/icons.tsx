import type { ReactNode } from "react";
import type { Ending, FlowchartShape, LineStyle } from "../../model/types";

function Icon({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
      {children}
    </svg>
  );
}

const SHAPE_DRAWINGS = new Map<FlowchartShape, ReactNode>([
  ["rectangle", <rect key="s" x="2" y="4" width="36" height="16" />],
  ["rounded", <rect key="s" x="2" y="4" width="36" height="16" rx="4" />],
  ["stadium", <rect key="s" x="2" y="4" width="36" height="16" rx="8" />],
  ["diamond", <polygon key="s" points="20,2 38,12 20,22 2,12" />],
  ["circle", <circle key="s" cx="20" cy="12" r="10" />],
  ["parallelogram", <polygon key="s" points="10,4 38,4 30,20 2,20" />],
  [
    "cylinder",
    <path key="s" d="M4 6a16 4 0 0 1 32 0v12a16 4 0 0 1-32 0zM4 6a16 4 0 0 0 32 0" />,
  ],
  [
    "subroutine",
    <g key="s">
      <rect x="2" y="4" width="36" height="16" />
      <path d="M7 4v16M33 4v16" />
    </g>,
  ],
  ["hexagon", <polygon key="s" points="10,4 30,4 38,12 30,20 10,20 2,12" />],
]);

export function ShapeIcon({ shape }: Readonly<{ shape: FlowchartShape }>) {
  return <Icon>{SHAPE_DRAWINGS.get(shape)}</Icon>;
}

const DASHES = new Map<LineStyle, string | undefined>([
  ["solid", undefined],
  ["dotted", "2 3"],
  ["thick", undefined],
]);

export function ConnectionIcon({ line, ending }: Readonly<{ line: LineStyle; ending: Ending }>) {
  const width = line === "thick" ? 4 : 2;
  return (
    <Icon>
      <path d="M6 12h28" strokeWidth={width} strokeDasharray={DASHES.get(line)} />
      {ending !== "plain" && <path d="M30 6l8 6-8 6z" fill="currentColor" />}
      {ending === "both" && <path d="M10 6l-8 6 8 6z" fill="currentColor" />}
    </Icon>
  );
}
