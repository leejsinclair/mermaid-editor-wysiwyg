import type { ReactElement, ReactNode } from "react";

/** The one size every toolbar, panel and toolbox icon is drawn at (FR-046). */
export const ICON_SIZE = 20;

interface IconProps {
  /** A standalone icon is exposed to assistive technology; otherwise it is decorative and hidden from it. */
  readonly standalone?: boolean | undefined;
}

function Svg({ standalone, children }: IconProps & { readonly children: ReactNode }): ReactElement {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(standalone ? { role: "img" } : { "aria-hidden": true })}
    >
      {children}
    </svg>
  );
}

export function UndoIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </Svg>
  );
}

export function RedoIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
    </Svg>
  );
}

export function AddShapeIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </Svg>
  );
}

export function ConnectIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M8.5 8.5 15.5 15.5" />
    </Svg>
  );
}

export function ZoomInIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4M11 8v6M8 11h6" />
    </Svg>
  );
}

export function ZoomOutIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4M8 11h6" />
    </Svg>
  );
}

export function FitToViewIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </Svg>
  );
}

export function PreviewIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M5 7v4a4 4 0 0 0 4 4h2M19 7v4a4 4 0 0 1-4 4h-2" />
    </Svg>
  );
}

export function CopySourceIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M8 6 3 12l5 6M16 6l5 6-5 6" />
    </Svg>
  );
}

export function CopyMarkdownIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M7 17v-6l2 2.5L11 11v6M14 14l1.5 1.5L17 14" />
    </Svg>
  );
}

export function SaveIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M5 3h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M8 3v5h7V3M8 21v-7h8v7" />
    </Svg>
  );
}

export function RenameIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </Svg>
  );
}

export function ChangeTypeIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 7c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" strokeDasharray="3 2" />
      <path d="M9 12h6" />
    </Svg>
  );
}

export function MoveToIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 12h9M10 8l4 4-4 4" />
      <path d="M15 4h5v16h-5" />
    </Svg>
  );
}

export function ReverseIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 8h16l-4-4M20 16H4l4 4" />
    </Svg>
  );
}

export function ChangeEndpointsIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 17 14 7" />
      <path d="M9 7h5v5" />
      <circle cx="20" cy="4" r="1.5" />
    </Svg>
  );
}

export function DeleteIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </Svg>
  );
}

export function MermaidSourceIcon(props: IconProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M8 6 3 12l5 6M16 6l5 6-5 6" />
      <path d="M11 9h2" />
    </Svg>
  );
}
