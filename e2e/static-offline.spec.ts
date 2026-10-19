import { expect, test, type Page, type Request } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

// VO-091 (FR-021, FR-052, SC-010): the built app is served as static files and a full session is run in each type:
// edit, undo, redo, preview, copy, save a file, open a file, reopen. After load the browser makes no request to any
// other origin and no request that is not a plain fetch of a static file, the whole session works with the network
// cut, and the build output holds only static files.

const BUILD = join(process.cwd(), "build", "client");
const STATIC_EXTENSIONS = new Set([".html", ".js", ".css", ".json", ".map", ".svg", ".ico", ".png", ".woff2", ".txt", ".webmanifest"]);
const TYPES = ["flowchart", "sequence", "C4"] as const;

// One build and one server for the whole file, so the sessions run one after the other in a single worker.
test.describe.configure({ mode: "serial" });

// The build writes to one folder, so it is made once, by the Chromium run; what it checks does not depend on the browser.
test.beforeEach(({ browserName }) => {
  // Skipped outside Chromium on purpose: the one build above is made by the Chromium run alone.
  test.skip(browserName !== "chromium", "The build is made once, by the Chromium run");
});

let server: Server | undefined;
let origin = "";

test.beforeAll(async ({ browserName }) => {
  if (browserName !== "chromium") return;
  test.setTimeout(240_000);
  execFileSync(process.execPath, [join(process.cwd(), "node_modules", "@react-router", "dev", "bin.cjs"), "build"], { stdio: "ignore" });
  server = createServer((request, response) => {
    const path = normalize(decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/")).replace(/^(\.\.[/\\])+/, "");
    let file = join(BUILD, path);
    // A path with no file behind it is a route of the single-page app: it gets the one HTML page.
    try {
      if (!statSync(file).isFile()) file = join(BUILD, "index.html");
    } catch {
      file = extname(path) === "" ? join(BUILD, "index.html") : "";
    }
    if (file === "") {
      response.writeHead(404).end();
      return;
    }
    const type = new Map([[".html", "text/html"], [".js", "text/javascript"], [".css", "text/css"], [".json", "application/json"]]).get(extname(file));
    response.writeHead(200, { "content-type": type ?? "application/octet-stream" }).end(readFileSync(file));
  });
  const listening = server;
  await new Promise<void>((resolve) => listening.listen(0, "127.0.0.1", resolve));
  const address = listening.address();
  origin = `http://127.0.0.1:${String(typeof address === "object" && address ? address.port : 0)}`;
});

test.afterAll(() => {
  server?.close();
});

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? filesUnder(join(directory, entry.name)) : [join(directory, entry.name)]));
}

/** One session in the editor: edit, undo, redo, copy, save a file. Returns the saved file's path. */
async function session(page: Page, name: string): Promise<string> {
  const toolbox = page.getByRole("region", { name: "Toolbox" });
  const first = new Map([["flowchart", "Rectangle"], ["sequence", "Participant"], ["C4", "Person"]]).get(name) ?? "";
  const items = page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node, [data-testid=participant], [data-testid=c4-element]");
  await toolbox.getByRole("button", { name: first, exact: true }).click();
  await expect(items).toHaveCount(1);
  await page.keyboard.press("Enter").catch(() => undefined);
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await items.first().focus();
  await page.keyboard.press("Enter");
  await label.fill("Edited");
  await label.press("Enter");
  await expect(items.first()).toContainText("Edited");

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(items.first()).not.toContainText("Edited");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(items.first()).toContainText("Edited");

  if (name === "flowchart") {
    await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();
    await expect(page.getByRole("region", { name: "Preview as Mermaid draws it" }).getByRole("application").locator("svg").first()).toBeVisible();
    await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();
  }

  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText(/Source copied/);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();
  return await (await download).path();
}

/** Starts a new diagram from the start screen, which loads the editor's code over the network while there is one. */
async function startNew(page: Page, name: (typeof TYPES)[number]): Promise<void> {
  const choices = page.getByRole("region", { name: "New diagram" });
  if (name === "C4") {
    await choices.getByRole("button", { name: "C4" }).click();
    await page.getByRole("dialog", { name: "Choose a C4 kind" }).getByRole("button", { name: "Context" }).click();
  } else {
    await choices.getByRole("button", { name: name === "flowchart" ? "Flowchart" : "Sequence" }).click();
  }
  await expect(page.getByRole("region", { name: "Diagram canvas" })).toBeVisible();
}

for (const name of TYPES) {
  test(`a full ${name} session runs from the built files, with no request but static ones and with the network cut`, async ({ page, context }) => {
    const requests: Request[] = [];
    page.on("request", (request) => requests.push(request));
    await page.goto(`${origin}/`);
    await startNew(page, name);
    const file = await session(page, name);

    // Everything the session needs has been loaded now: open a file and reopen the saved diagram with the network cut.
    await context.setOffline(true);
    await page.getByRole("button", { name: "Start screen" }).click();
    await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(1);
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Open file…" }).click();
    await (await chooser).setFiles(file);
    await expect(page).toHaveURL(/\/d\/[\w-]+$/);
    await expect(page.getByRole("region", { name: "Diagram canvas" })).toContainText("Edited");
    await page.getByRole("button", { name: "Start screen" }).click();
    const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
    await expect(items).toHaveCount(2);
    await items.first().getByRole("link").click();
    await expect(page.getByRole("region", { name: "Diagram canvas" })).toContainText("Edited");
    await context.setOffline(false);

    expect(requests.filter((request) => !request.url().startsWith(origin)).map((request) => request.url())).toEqual([]);
    expect(requests.filter((request) => request.method() !== "GET").map((request) => `${request.method()} ${request.url()}`)).toEqual([]);
    expect(requests.filter((request) => ["fetch", "xhr", "websocket", "eventsource", "ping"].includes(request.resourceType())).map((request) => request.url())).toEqual([]);
  });
}

test("the build output holds only static files", () => {
  const files = filesUnder(join(process.cwd(), "build"));
  expect(files.length).toBeGreaterThan(0);
  // A single-page app has no server: the build leaves no server code beside the files that are served.
  expect(files.filter((file) => file.startsWith(join(process.cwd(), "build", "server")))).toEqual([]);

  expect(files.filter((file) => !STATIC_EXTENSIONS.has(extname(file)))).toEqual([]);
  expect(statSync(join(BUILD, "index.html")).isFile()).toBe(true);
});
