import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from "@mui/material";
import { en } from "./text/en";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

// One light theme and the system font stack: no network font or icon (FR-021, FR-022).
const theme = createTheme({
  palette: { mode: "light", primary: { main: "#1565c0" } },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

// A drawn item that has keyboard focus shows a ring and a glow: the ring where the browser draws one on the item, the
// glow where it does not (SVG items in some browsers). The blue meets 3:1 against the white canvas (WCAG 2.4.7, 2.4.11).
const FOCUS = { outline: "3px solid #1565c0", outlineOffset: "2px", filter: "drop-shadow(0 0 3px #1565c0)" };
// React Flow's attribution link stays, drawn dark enough to read and large enough to hit (WCAG 1.4.3, 2.5.8).
const ATTRIBUTION = { color: "#333333", fontSize: "12px", display: "inline-block", minHeight: "24px", lineHeight: "24px", padding: "0 6px" };
const focusStyles = (
  <GlobalStyles
    styles={{
      "svg [tabindex]:focus-visible, .react-flow__node:focus-visible, .react-flow__edge:focus-visible": FOCUS,
      ".react-flow__attribution a": ATTRIBUTION,
    }}
  />
);

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:," />
        <title>{en.start.heading}</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {focusStyles}
      <Outlet />
    </ThemeProvider>
  );
}

export function HydrateFallback() {
  return <p>Loading…</p>;
}
