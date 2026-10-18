import { chromium, expect, firefox, test, type BrowserContext, type Page } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addShape, connect } from "./support/flowchart";
import { addItem, addRelationship, canvas as c4Canvas, itemNames, itemLabelled, relationshipNames, select, sourceLines as c4SourceLines } from "./support/c4";
import { addMessage, addParticipants, canvas as sequenceCanvas, messageTexts, participantNames, relabel } from "./support/sequence";

// VO-075 (FR-042, FR-043): diagrams with positions are saved, the browser is closed and reopened, and each opens
// exactly as last saved, with Undo unavailable until a new change. Flowchart positions, Sequence order, and C4 order,
// boundaries and title.

/** Each node's address and where it sits on the canvas, as React Flow places it. */
async function layout(page: Page, count: number): Promise<string[]> {
  const nodes = page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node");
  await expect(nodes).toHaveCount(count);
  return nodes.evaluateAll((nodes) =>
    nodes.map((node) => `${node.getAttribute("data-id") ?? ""}:${node.getAttribute("aria-label") ?? ""}:${(node as HTMLElement).style.transform}`),
  );
}

test("diagrams reopen exactly as last saved after the browser is closed and opened again", async ({ browserName, baseURL }) => {
  const launcher = browserName === "firefox" ? firefox : chromium;
  const profile = await mkdtemp(join(tmpdir(), "mermaid-editor-profile-"));
  const open = (): Promise<BrowserContext> => launcher.launchPersistentContext(profile, baseURL === undefined ? {} : { baseURL });
  try {
    // First session: build and save two diagrams.
    let context = await open();
    let page = await context.newPage();
    await page.goto("/new/flowchart");
    const canvas = page.getByRole("region", { name: "Diagram canvas" });
    await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
    await addShape(page, canvas, "Circle", { x: 520, y: 360 });
    await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
    await canvas.getByLabel(/^Circle node/).click();
    await page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" }).fill("Renamed circle");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(page).toHaveURL(/\/d\/[\w-]+$/);
    const firstUrl = page.url();
    const firstLayout = await layout(page, 2);

    await page.goto("/new/flowchart");
    await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Diamond", { x: 100, y: 50 });
    await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(page).toHaveURL(/\/d\/[\w-]+$/);
    const secondUrl = page.url();
    const secondLayout = await layout(page, 1);
    await context.close();

    // Second session: a new browser process on the same profile.
    context = await open();
    page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(2);

    await page.goto(firstUrl);
    await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await expect(page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__edge")).toHaveCount(1);
    expect(await layout(page, 2)).toEqual(firstLayout);

    await page.goto(secondUrl);
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    expect(await layout(page, 1)).toEqual(secondLayout);

    // A new change makes Undo available again, and only for that change.
    await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Circle", { x: 400, y: 300 });
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await context.close();
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});

test("a sequence diagram reopens with its participants and messages in the order last saved", async ({ browserName, baseURL }) => {
  const launcher = browserName === "firefox" ? firefox : chromium;
  const profile = await mkdtemp(join(tmpdir(), "mermaid-editor-profile-"));
  const open = (): Promise<BrowserContext> => launcher.launchPersistentContext(profile, baseURL === undefined ? {} : { baseURL });
  try {
    let context = await open();
    let page = await context.newPage();
    await page.goto("/new/sequence");
    await addParticipants(page, ["Participant", "A"], ["Actor", "B"], ["Participant", "C"]);
    await addMessage(page, "Solid arrow", "A", "B");
    await relabel(page, sequenceCanvas(page).getByTestId("message").nth(0), "one");
    await addMessage(page, "Dashed cross", "B", "C");
    await relabel(page, sequenceCanvas(page).getByTestId("message").nth(1), "two");
    await sequenceCanvas(page).getByTestId("message").nth(1).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Move up", exact: true }).click();
    await sequenceCanvas(page).getByTestId("participant").nth(2).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Move up", exact: true }).click();
    await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(page).toHaveURL(/\/d\/[\w-]+$/);
    const address = page.url();
    const names = await participantNames(page);
    const texts = await messageTexts(page);
    expect(names).toEqual(["Participant: A", "Participant: C", "Actor: B"]);
    expect(texts).toEqual(["two", "one"]);
    await context.close();

    context = await open();
    page = await context.newPage();
    await page.goto(address);
    await expect(sequenceCanvas(page).getByTestId("participant")).toHaveCount(3);
    expect(await participantNames(page)).toEqual(names);
    expect(await messageTexts(page)).toEqual(texts);
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await context.close();
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});

test("a C4 diagram reopens with its order, boundaries, relationships and title as last saved", async ({ browserName, baseURL }) => {
  const launcher = browserName === "firefox" ? firefox : chromium;
  const profile = await mkdtemp(join(tmpdir(), "mermaid-editor-profile-"));
  const open = (): Promise<BrowserContext> => launcher.launchPersistentContext(profile, baseURL === undefined ? {} : { baseURL });
  try {
    let context = await open();
    let page = await context.newPage();
    await page.goto("/new/c4/container");
    await addItem(page, "Person", "Customer");
    await addItem(page, "System boundary", "Zone");
    await addItem(page, "Container", "Api");
    await addItem(page, "System", "Shop");
    await select(page, itemLabelled(page, "Api"));
    await page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Move to…", exact: true }).click();
    await page.getByRole("dialog", { name: "Move to" }).getByRole("button", { name: /^Zone/ }).click();
    await addRelationship(page, "One-way relationship", "Customer", "Api");
    await addRelationship(page, "Two-way relationship", "Api", "Shop");
    await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 5, y: 5 } });
    await page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Title", exact: true }).fill("Shop overview");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(page).toHaveURL(/\/d\/[\w-]+$/);
    const address = page.url();
    const names = await itemNames(page);
    const links = await relationshipNames(page);
    const source = await c4SourceLines(page);
    expect(links).toHaveLength(2);
    expect(source).toContain("title Shop overview");
    await context.close();

    context = await open();
    page = await context.newPage();
    await page.goto(address);
    await expect(c4Canvas(page).getByTestId("c4-relationship")).toHaveCount(2);
    expect(await itemNames(page)).toEqual(names);
    expect(await relationshipNames(page)).toEqual(links);
    expect(await c4SourceLines(page)).toEqual(source);
    await expect(c4Canvas(page).getByTestId("c4-title")).toHaveText("Shop overview");
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
    await context.close();
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
