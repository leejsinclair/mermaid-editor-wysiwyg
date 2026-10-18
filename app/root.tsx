import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

// One light theme and the system font stack: no network font or icon (FR-021, FR-022).
const theme = createTheme({
  palette: { mode: "light" },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:," />
        <title>Mermaid diagram editor</title>
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
      <Outlet />
    </ThemeProvider>
  );
}

export function HydrateFallback() {
  return <p>Loading…</p>;
}
