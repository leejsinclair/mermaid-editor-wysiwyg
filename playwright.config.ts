import { defineConfig, devices } from "@playwright/test";

const port = 5173;
/** The test files that time the app against a fixed budget. */
const TIMING = ["**/performance.spec.ts", "**/import-performance.spec.ts", "**/redesign-performance.spec.ts"];
/** The touch tests run only on the emulated phones (feature 007): they drive touch through Playwright, in Chromium. */
const TOUCH = "**/touch/**";

/** Hosted runs (publishing from `main`) cover desktop Chromium only: the emulated phone is run locally. */
const CHROMIUM_ONLY = !!process.env["CI"];

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
      testIgnore: [...TIMING, TOUCH],
      // The async clipboard API (Copy Source) needs these in headless Chromium.
      use: { ...devices["Desktop Chrome"], permissions: ["clipboard-read", "clipboard-write"] },
    },
    // Emulated phone (feature 007): Chrome on Android, running only the touch suite. Safari on iOS is not tested.
    { name: "mobile-android", testMatch: "**/touch/**/*.spec.ts", use: { ...devices["Pixel 7"], permissions: ["clipboard-read", "clipboard-write"] } },
    // The tests that time the app against a fixed budget run after the rest, one at a time, so they measure the app
    // rather than the other workers' load (feature 006, DN-01).
    { name: "chromium-timing", testMatch: TIMING, workers: 1, dependencies: ["chromium"], use: { ...devices["Desktop Chrome"] } },
  ].filter(({ name }) => !CHROMIUM_ONLY || name.startsWith("chromium")),
  webServer: {
    command: "npm run dev -- --port " + String(port),
    url: `http://localhost:${String(port)}`,
    reuseExistingServer: !process.env["CI"],
  },
});
