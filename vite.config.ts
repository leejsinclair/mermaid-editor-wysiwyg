import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  // The browser's harmless "ResizeObserver loop" notice would otherwise cover the page with Vite's error overlay.
  server: { hmr: { overlay: false } },
});
