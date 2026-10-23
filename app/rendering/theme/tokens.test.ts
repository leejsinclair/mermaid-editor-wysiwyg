import { describe, expect, it } from "vitest";
import { cssVariables, TOKENS, tokensFor, type Appearance } from "./tokens";

// VO-001 (FR-001, FR-002): both appearances define every token group of the design token set, and Blueprint Studio holds the
// seven colours the brief names in their roles, plus an error red and a success colour. cssVariables gives one custom property
// per token.

const APPEARANCES: readonly Appearance[] = ["blueprint", "light"];

const GROUPS = {
  surfaces: ["background", "panel", "panelRaised"],
  text: ["text", "textMuted"],
  accent: ["accent"],
  states: ["warning", "error", "success"],
  canvas: ["canvasSurface", "canvasInk", "nodeFill", "gridMinor", "gridMajor", "selection"],
  borders: ["border", "borderStrong"],
  code: ["keyword", "string", "operator", "comment", "identifier"],
  type: ["fontSans", "fontMono"],
  shape: ["space", "radius", "borderWidth", "focusWidth"],
  motion: ["duration"],
} as const;

describe("the design token sets", () => {
  for (const appearance of APPEARANCES) {
    it(`define every token group in the ${appearance} appearance, each token a non-empty string`, () => {
      const set = new Map<string, unknown>(Object.entries(tokensFor(appearance)));
      for (const [group, names] of Object.entries(GROUPS)) {
        const tokens = new Map<string, unknown>(Object.entries((set.get(group) as object | undefined) ?? {}));
        expect(tokens.size, `the ${group} group`).toBeGreaterThan(0);
        for (const name of names) {
          const value = tokens.get(name);
          expect(typeof value === "string" && value.trim() !== "", `${group}.${name} in ${appearance}`).toBe(true);
        }
      }
    });

    it(`gives one custom property per token in the ${appearance} appearance`, () => {
      const variables = cssVariables(appearance);
      const count = Object.values(GROUPS).reduce((total, names) => total + names.length, 0);
      expect(Object.keys(variables)).toHaveLength(count);
      for (const name of Object.keys(variables)) expect(name.startsWith("--")).toBe(true);
    });
  }

  it("holds the Blueprint Studio colours the brief names, in their roles", () => {
    const { surfaces, text, accent, states } = TOKENS.blueprint;
    expect(surfaces.background).toBe("#071C30");
    expect(surfaces.panel).toBe("#0D2B45");
    expect(surfaces.panelRaised).toBe("#174565");
    expect(accent.accent).toBe("#72D7F2");
    expect(text.text).toBe("#F1E9D7");
    expect(states.warning).toBe("#E8AD63");
    expect(text.textMuted).toBe("#A9C0D0");
  });

  it("adds an error red and a success colour to Blueprint Studio that differ from the warning amber", () => {
    const { states } = TOKENS.blueprint;
    expect(new Set([states.warning, states.error, states.success]).size).toBe(3);
  });
});
