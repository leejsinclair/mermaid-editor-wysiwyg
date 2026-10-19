import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { addShape } from "./support/flowchart";

// VO-002 (FR-004, FR-005, FR-014, US1-AS1, US1-AS3, EC-01, DC-01): the production build is served the way GitHub Pages
// serves it, real files only, no fallback page, once from a sub-folder and once from the root. A visitor loads the page,
// builds a diagram and reloads its address: every own file is answered, the console stays clean, the same view returns.

const CONTENT_TYPES = new Map([
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".css", "text/css"],
  [".json", "application/json"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

// One build for the whole file, in a folder of its own so it cannot race the other build-output test.
test.describe.configure({ mode: "serial" });
test.beforeEach(({ browserName }) => {
  // Skipped outside Chromium on purpose: the one build is made by the Chromium run alone.
  test.skip(browserName !== "chromium", "The build is made once, by the Chromium run");
});

let out = "";
const servers: Server[] = [];

test.beforeAll(({ browserName }) => {
  if (browserName !== "chromium") return;
  test.setTimeout(240_000);
  out = mkdtempSync(join(tmpdir(), "published-build-"));
  // BUILD_OUT_DIR names the folder the build writes to (vite.config.ts), so this build cannot race the one in static-offline.
  execFileSync(process.execPath, [join(process.cwd(), "node_modules", "vite", "bin", "vite.js"), "build"], { stdio: "ignore", env: { ...process.env, BUILD_OUT_DIR: out } });
});

test.afterAll(() => {
  for (const server of servers) server.close();
  if (out !== "") rmSync(out, { recursive: true, force: true });
});

/** Serves `out` under `prefix` like a host of real files: a path with no file behind it is a 404. */
async function serve(prefix: string): Promise<string> {
  const server = createServer((request, response) => {
    const path = normalize(decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/"));
    const relative = path.startsWith(prefix) ? path.slice(prefix.length) : undefined;
    let file = relative === undefined ? "" : join(out, relative);
    try {
      if (file !== "" && statSync(file).isDirectory()) file = join(file, "index.html");
      if (file !== "" && !statSync(file).isFile()) file = "";
    } catch {
      file = "";
    }
    if (file === "") {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": CONTENT_TYPES.get(extname(file)) ?? "application/octet-stream" }).end(readFileSync(file));
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return `http://127.0.0.1:${String(typeof address === "object" && address ? address.port : 0)}`;
}

function watch(page: Page): { failed: string[]; errors: string[]; seen: () => number } {
  const failed: string[] = [];
  const errors: string[] = [];
  let seen = 0;
  page.on("response", (response) => {
    seen += 1;
    if (response.status() >= 400) failed.push(`${String(response.status())} ${response.url()}`);
  });
  page.on("requestfailed", (request) => failed.push(`failed ${request.url()}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return { failed, errors, seen: () => seen };
}

for (const prefix of ["/mermaid-editor-wysiwyg/", "/"]) {
  test(`served from ${prefix}, the page loads clean and a saved diagram's address survives a reload and a new tab`, async ({ page, context }) => {
    const origin = await serve(prefix);
    const watched = watch(page);

    await page.goto(`${origin}${prefix}`);
    await expect(page.getByRole("region", { name: "New diagram" })).toBeVisible();

    await page.goto(`${origin}${prefix}#/new/flowchart`);
    const canvas = page.getByRole("region", { name: "Diagram canvas" });
    await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
    await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
    const saved = page.url();

    await page.reload();
    await expect(canvas.locator(".react-flow__node")).toHaveCount(1);

    // One tab edits a diagram at a time, so the first tab is closed before the address is opened in a new one.
    await page.close();
    const second = await context.newPage();
    const watchedSecond = watch(second);
    await second.goto(saved);
    await expect(second.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node")).toHaveCount(1);

    expect(watched.seen()).toBeGreaterThan(0);
    expect([...watched.failed, ...watchedSecond.failed]).toEqual([]);
    expect([...watched.errors, ...watchedSecond.errors]).toEqual([]);
  });
}
