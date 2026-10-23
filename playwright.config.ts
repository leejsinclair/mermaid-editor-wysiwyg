import { defineConfig, devices } from "@playwright/test";

const port = 5173;
/** The test files that time the app against a fixed budget. */
const TIMING = ["**/performance.spec.ts", "**/import-performance.spec.ts", "**/redesign-performance.spec.ts"];
/** The touch tests run only on the emulated phones (feature 007): they drive touch through Playwright, in Chromium and WebKit. */
const TOUCH = "**/touch/**";

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
      // The async clipboard API (Copy Source) needs these in headless Chromium; Firefox cannot grant clipboard read.
      use: { ...devices["Desktop Chrome"], permissions: ["clipboard-read", "clipboard-write"] },
    },
    { name: "firefox", testIgnore: [...TIMING, TOUCH], use: { ...devices["Desktop Firefox"] } },
    // Emulated phones (feature 007): Chrome on Android and Safari on iOS, each running only the touch suite.
    { name: "mobile-android", testMatch: "**/touch/**/*.spec.ts", use: { ...devices["Pixel 7"], permissions: ["clipboard-read", "clipboard-write"] } },
    { name: "mobile-ios", testMatch: "**/touch/**/*.spec.ts", use: { ...devices["iPhone 15"] } },
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
