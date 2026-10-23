import { GlobalStyles } from "@mui/material";
import { Outlet } from "react-router";
import { AppearanceProvider } from "./editor/AppearanceProvider";

// The system font stack and no network font or icon (002 FR-021); the colours come from the appearance's tokens (spec 007).

// A drawn item that has keyboard focus shows a ring and a glow: the ring where the browser draws one on the item, the
// glow where it does not (SVG items in some browsers). The accent meets 3:1 against every surface it sits on (WCAG 2.4.7, 2.4.11).
const FOCUS = { outline: "var(--focus-width) solid var(--accent)", outlineOffset: "2px", filter: "drop-shadow(0 0 3px var(--accent))" };
// React Flow's attribution link stays, drawn muted but readable and large enough to hit (WCAG 1.4.3, 2.5.8).
const ATTRIBUTION = { color: "var(--text-muted)", fontSize: "12px", display: "inline-block", minHeight: "24px", lineHeight: "24px", padding: "0 6px" };
const focusStyles = (
  <GlobalStyles
    styles={{
      "svg [tabindex]:focus-visible, .react-flow__node:focus-visible, .react-flow__edge:focus-visible": FOCUS,
      ".react-flow__attribution a": ATTRIBUTION,
      // A person who asks their system for reduced motion gets none: every transition and animation is switched off (FR-022, EC-10).
      "@media (prefers-reduced-motion: reduce)": {
        "*, *::before, *::after": { transitionDuration: "0s !important", animationDuration: "0s !important", scrollBehavior: "auto !important" },
      },
    }}
  />
);

export default function Root() {
  return (
    <AppearanceProvider>
      {focusStyles}
      <Outlet />
    </AppearanceProvider>
  );
}
