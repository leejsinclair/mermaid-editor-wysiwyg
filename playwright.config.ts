import { defineConfig, devices } from "@playwright/test";

const port = 5173;
/** The test files that time the app against a fixed budget. */
const TIMING = ["**/performance.spec.ts", "**/import-performance.spec.ts"];

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
      testIgnore: TIMING,
      // The async clipboard API (Copy Source) needs these in headless Chromium; Firefox cannot grant clipboard read.
      use: { ...devices["Desktop Chrome"], permissions: ["clipboard-read", "clipboard-write"] },
    },
    { name: "firefox", testIgnore: TIMING, use: { ...devices["Desktop Firefox"] } },
    // The tests that time the app against a fixed budget run after the rest, one at a time and one browser after the
    // other, so they measure the app rather than the other workers' load (feature 006, DN-01).
    { name: "chromium-timing", testMatch: TIMING, workers: 1, dependencies: ["chromium", "firefox"], use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-timing", testMatch: TIMING, workers: 1, dependencies: ["chromium-timing"], use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command: "npm run dev -- --port " + String(port),
    url: `http://localhost:${String(port)}`,
    reuseExistingServer: !process.env["CI"],
  },
});
