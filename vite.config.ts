import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Files are referred to by relative URL, so one build works at the domain root, under a repository sub-path and in any folder.
  base: "./",
  // BUILD_OUT_DIR lets a test write its own build without racing another test's (e2e/published-build.spec.ts).
  build: { outDir: process.env["BUILD_OUT_DIR"] ?? "build/client", emptyOutDir: true },
  // The browser's harmless "ResizeObserver loop" notice would otherwise cover the page with Vite's error overlay.
  server: { hmr: { overlay: false } },
});
