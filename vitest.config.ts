import { defineConfig } from "vitest/config";

// Plain Vite config: the React Router plugin is not needed (and not wanted) for the pure layers.
export default defineConfig({
  test: {
    include: ["app/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    environment: "node",
  },
});
