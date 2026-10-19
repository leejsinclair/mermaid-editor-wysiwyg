import { defineConfig, devices } from "@playwright/test";

const port = 5173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // The unbundled dev server is slow to serve many pages at once, so keep parallelism modest and assertions patient.
  workers: process.env["CI"] ? 2 : 4,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${String(port)}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      // The async clipboard API (Copy Source) needs these in headless Chromium; Firefox cannot grant clipboard read.
      use: { ...devices["Desktop Chrome"], permissions: ["clipboard-read", "clipboard-write"] },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command: "npm run dev -- --port " + String(port),
    url: `http://localhost:${String(port)}`,
    reuseExistingServer: !process.env["CI"],
  },
});
