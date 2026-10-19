import type { Config } from "@react-router/dev/config";
import { rm } from "node:fs/promises";
import { join } from "node:path";

// Client-only single-page app: no server component (persistence and export are out of scope).
export default {
  ssr: false,
  // A single-page app is served as static files alone (FR-021): the build leaves a server stub that nothing uses, so it goes.
  buildEnd: async ({ reactRouterConfig }) => {
    await rm(join(reactRouterConfig.buildDirectory, "server"), { recursive: true, force: true });
  },
} satisfies Config;
