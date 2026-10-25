import { alpha, type ThemeOptions } from "@mui/material";

// The design tokens of both appearances: the only place a colour is written (spec 007, FR-001, FR-002, SC-004). MUI's theme and
// the CSS custom properties are both made from these, so the interface, the canvases and Mermaid's own drawings agree.

export type Appearance = "blueprint" | "light";

export interface TokenSet {
  readonly surfaces: Readonly<Record<"background" | "panel" | "panelRaised", string>>;
  readonly text: Readonly<Record<"text" | "textMuted", string>>;
  readonly accent: Readonly<Record<"accent", string>>;
  readonly states: Readonly<Record<"warning" | "error" | "success", string>>;
  readonly canvas: Readonly<Record<"canvasSurface" | "canvasInk" | "nodeFill" | "gridMinor" | "gridMajor" | "selection", string>>;
  readonly borders: Readonly<Record<"border" | "borderStrong", string>>;
  readonly code: Readonly<Record<"keyword" | "string" | "operator" | "comment" | "identifier", string>>;
  readonly type: Readonly<Record<"fontSans" | "fontMono", string>>;
  readonly shape: Readonly<Record<"space" | "radius" | "borderWidth" | "focusWidth", string>>;
  readonly motion: Readonly<Record<"duration", string>>;
}

/** System fonts only: nothing is fetched (FR-003, 002 FR-021). */
const FONT_SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const FONT_MONO = 'ui-monospace, SFMono-Regular, "Cascadia Mono", "DejaVu Sans Mono", Menlo, Consolas, monospace';

const SHARED = {
  type: { fontSans: FONT_SANS, fontMono: FONT_MONO },
  shape: { space: "8px", radius: "4px", borderWidth: "1px", focusWidth: "3px" },
  motion: { duration: "150ms" },
} as const;

const BLUEPRINT: TokenSet = {
  surfaces: { background: "#071C30", panel: "#0D2B45", panelRaised: "#174565" },
  text: { text: "#F1E9D7", textMuted: "#A9C0D0" },
  accent: { accent: "#72D7F2" },
  states: { warning: "#E8AD63", error: "#FF8A80", success: "#7FD8A6" },
  canvas: {
    canvasSurface: "#071C30",
    canvasInk: "#F1E9D7",
    nodeFill: "#0D2B45",
    gridMinor: "rgba(114, 215, 242, 0.08)",
    gridMajor: "rgba(114, 215, 242, 0.18)",
    selection: "#72D7F2",
  },
  borders: { border: "#174565", borderStrong: "rgba(114, 215, 242, 0.6)" },
  code: { keyword: "#72D7F2", string: "#E8AD63", operator: "#F1E9D7", comment: "#A9C0D0", identifier: "#F1E9D7" },
  ...SHARED,
};

const LIGHT: TokenSet = {
  surfaces: { background: "#FFFFFF", panel: "#F5F7FA", panelRaised: "#E8EDF2" },
  text: { text: "#222222", textMuted: "#5F6B76" },
  accent: { accent: "#1565C0" },
  states: { warning: "#8A5300", error: "#C62828", success: "#2E7D32" },
  canvas: {
    canvasSurface: "#FFFFFF",
    canvasInk: "#222222",
    nodeFill: "#FFFFFF",
    gridMinor: "rgba(21, 101, 192, 0.06)",
    gridMajor: "rgba(21, 101, 192, 0.14)",
    selection: "#1565C0",
  },
  borders: { border: "#D0D7DE", borderStrong: "#6E7781" },
  code: { keyword: "#1565C0", string: "#8A5300", operator: "#222222", comment: "#5F6B76", identifier: "#222222" },
  ...SHARED,
};

export const TOKENS: Readonly<Record<Appearance, TokenSet>> = { blueprint: BLUEPRINT, light: LIGHT };

export const tokensFor = (appearance: Appearance): TokenSet => (appearance === "light" ? TOKENS.light : TOKENS.blueprint);

const kebab = (name: string): string => name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The custom property of a token: its name in kebab case, with `code-` in front of the source highlighting colours. */
const propertyOf = (group: string, name: string): string => `--${group === "code" ? "code-" : ""}${kebab(name)}`;

/** One `--…` custom property per token, for the stylesheet of an appearance. */
export function cssVariables(appearance: Appearance): Readonly<Record<string, string>> {
  const found: [string, string][] = [];
  for (const [group, tokens] of Object.entries(tokensFor(appearance))) {
    for (const [name, value] of Object.entries(tokens as Readonly<Record<string, string>>)) found.push([propertyOf(group, name), value]);
  }
  return Object.fromEntries(found);
}

/** The options MUI's theme of an appearance is made from. */
export function muiThemeOptions(appearance: Appearance): ThemeOptions {
  const { surfaces, text, accent, states, borders, type, shape, motion } = tokensFor(appearance);
  const ms = Number.parseInt(motion.duration, 10);
  /** An alert says its state by the colour of its icon and its left edge, as well as in words. */
  const flagged = (colour: string) => ({ borderLeftColor: colour, "& .MuiAlert-icon": { color: colour } });
  return {
    palette: {
      mode: appearance === "light" ? "light" : "dark",
      primary: { main: accent.accent, contrastText: surfaces.background },
      error: { main: states.error },
      warning: { main: states.warning },
      success: { main: states.success },
      background: { default: surfaces.background, paper: surfaces.panel },
      text: { primary: text.text, secondary: text.textMuted },
      divider: borders.border,
    },
    typography: { fontFamily: type.fontSans, button: { textTransform: "none" } },
    shape: { borderRadius: Number.parseInt(shape.radius, 10) },
    spacing: Number.parseInt(shape.space, 10),
    // Every transition MUI makes is as short as the tokens say (FR-022).
    transitions: { duration: { shortest: ms, shorter: ms, short: ms, standard: ms, complex: ms, enteringScreen: ms, leavingScreen: ms } },
    components: {
      // A control that has keyboard focus shows a ring in the accent colour (FR-021, WCAG 2.4.7, 2.4.11); a pressed button shows it too.
      MuiButtonBase: { styleOverrides: { root: { "&.Mui-focusVisible": { outline: `${shape.focusWidth} solid ${accent.accent}`, outlineOffset: "2px" } } } },
      // A one-line text area is 23 px tall at the default type size; a touch target is at least 24 px (FR-027, WCAG 2.5.8).
      MuiInputBase: { styleOverrides: { input: { "&:is(textarea)": { minHeight: "24px", boxSizing: "border-box" } } } },
      // The appearance switch: the button that is not pressed keeps the text colour (MUI dims it, which fails 4.5:1 in Light) and the
      // pressed one sits on the raised surface.
      MuiToggleButton: {
        styleOverrides: {
          root: { color: text.text, borderColor: borders.borderStrong, "&.Mui-selected": { color: text.text, backgroundColor: surfaces.panelRaised } },
        },
      },
      // Each state of a button differs in more than colour (spec 008, FR-046): hovered underlines the label, pressed (a toggle that
      // is on, or the button held down) draws an inner ring, and unavailable dashes the border; focus keeps the ring above.
      MuiButton: {
        styleOverrides: {
          root: {
            "&:hover": { textDecoration: "underline" },
            "&:active, &[aria-pressed=\"true\"]": { boxShadow: `inset 0 0 0 ${shape.focusWidth} currentColor` },
            "&:active": { backgroundColor: alpha(accent.accent, 0.24) },
            "&.Mui-disabled, &[aria-disabled=\"true\"]": { borderStyle: "dashed", textDecoration: "none" },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            color: text.text,
            backgroundColor: surfaces.panelRaised,
            border: `${shape.borderWidth} solid ${borders.border}`,
            borderLeftWidth: "4px",
            "&.MuiAlert-colorSuccess": flagged(states.success),
            "&.MuiAlert-colorError": flagged(states.error),
            "&.MuiAlert-colorWarning": flagged(states.warning),
          },
        },
      },
    },
  };
}

type Rgb = readonly [number, number, number];

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const RGBA = /^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), ([\d.]+)\)$/;

/** A colour written as `#rrggbb` or `rgba(r, g, b, a)` (the forms the tokens use): its channels and how opaque it is. */
function parseColour(colour: string): { readonly rgb: Rgb; readonly alpha: number } {
  const hex = HEX.exec(colour);
  if (hex) return { rgb: [Number.parseInt(hex[1] ?? "0", 16), Number.parseInt(hex[2] ?? "0", 16), Number.parseInt(hex[3] ?? "0", 16)], alpha: 1 };
  const rgba = RGBA.exec(colour);
  if (rgba) return { rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])], alpha: Number(rgba[4]) };
  throw new Error(`Not a colour the tokens use: ${colour}`);
}

/** WCAG 2.x relative luminance of opaque channels. */
function luminance([red, green, blue]: Rgb): number {
  const linear = (channel: number): number => {
    const share = channel / 255;
    return share <= 0.039_28 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/**
 * The WCAG 2.x contrast ratio of two colours. A colour with transparency is laid over the background first, which is the
 * surface it sits on; the background itself is taken as opaque.
 */
export function contrastRatio(foreground: string, background: string): number {
  const behind = parseColour(background).rgb;
  const { rgb, alpha } = parseColour(foreground);
  const shown: Rgb = [0, 1, 2].map((at) => (rgb.at(at) ?? 0) * alpha + (behind.at(at) ?? 0) * (1 - alpha)) as unknown as Rgb;
  const [lighter, darker] = [luminance(shown), luminance(behind)].sort((a, b) => b - a);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}
