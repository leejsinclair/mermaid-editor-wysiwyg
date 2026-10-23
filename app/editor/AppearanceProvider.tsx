import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from "@mui/material";
import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { readAppearance, writeAppearance } from "../persistence/appearance";
import { setMermaidAppearance } from "../rendering/shared/mermaidRuntime";
import { AppearanceContext } from "../rendering/theme/appearanceContext";
import { cssVariables, muiThemeOptions, type Appearance } from "../rendering/theme/tokens";

// The appearance of the whole editor (spec 007, FR-026): read once from the browser before the first frame, applied as the
// document's `data-appearance` with that appearance's custom properties and MUI theme, and kept when the user chooses another.
// Switching is not an editing operation: it touches no diagram, selection, draft or history.

const APPEARANCES: readonly Appearance[] = ["blueprint", "light"];

const variables = Object.fromEntries(
  APPEARANCES.map((appearance) => [`:root[data-appearance="${appearance}"]`, { ...cssVariables(appearance), colorScheme: appearance === "light" ? "light" : "dark" }]),
);
const variableStyles = <GlobalStyles styles={variables} />;

export function AppearanceProvider({ children }: { readonly children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(() => readAppearance());
  const [kept, setKept] = useState(true);
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-appearance", appearance);
    // Mermaid draws in the look of the appearance from now on; it is set before any drawing effect of the children runs.
    setMermaidAppearance(appearance);
  }, [appearance]);
  const theme = useMemo(() => createTheme(muiThemeOptions(appearance)), [appearance]);
  const choose = useCallback((next: Appearance): boolean => {
    setAppearance(next);
    const saved = writeAppearance(next);
    setKept(saved);
    return saved;
  }, []);
  const state = useMemo(() => ({ appearance, choose, kept }), [appearance, choose, kept]);
  return (
    <AppearanceContext value={state}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {variableStyles}
        {children}
      </ThemeProvider>
    </AppearanceContext>
  );
}
