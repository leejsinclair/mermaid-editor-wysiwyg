import { expect, test, type Page } from "@playwright/test";
import { addShape, connect } from "./support/flowchart";
import { c4Record, canvas as c4Canvas, handlesOf, itemLabelled, sourceLines } from "./support/c4";
import { addMessage, addParticipants, canvas as sequenceCanvas } from "./support/sequence";
import { seedRecords } from "./support/storage";

// VO-022 (FR-010, FR-018, US4-AS1, SC-002, EC-12): every connection handle and end handle is at least 24 x 24 screen px at the
// smallest, default and largest zoom; where items are too small to hold handles they show none, still move by their body,
// still accept a dropped line, and are still connected from the Properties panel.

const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });
const zoomIn = (page: Page) => toolbar(page).getByRole("button", { name: "Zoom in" }).click();
const zoomOut = (page: Page) => toolbar(page).getByRole("button", { name: "Zoom out" }).click();

/** The size on screen of every handle and end handle that matches `selector`. */
async function sizes(page: Page, selector: string): Promise<{ width: number; height: number }[]> {
  return page.evaluate((query) => [...document.querySelectorAll(query)].map((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }), selector);
}

function expectBigEnough(found: readonly { width: number; height: number }[]): void {
  for (const box of found) {
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
}

const HANDLES = '[data-zone="connect"]';
const ENDS = '[class~="react-flow__edgeupdater"], [data-zone="end"]';

test("a flowchart's handles and end grips are at least 24 px at every zoom, and too-small nodes show no handles but still work", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 150, y: 140 });
  await addShape(page, canvas, "Circle", { x: 450, y: 140 });
  await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
  const node = canvas.getByLabel(/^Rectangle node/);

  const atDefault = await sizes(page, HANDLES);
  expect(atDefault).toHaveLength(8);
  expectBigEnough(atDefault);
  expectBigEnough(await sizes(page, ENDS));

  for (let step = 0; step < 4; step += 1) await zoomIn(page);
  await expect.poll(async () => (await sizes(page, HANDLES)).length).toBeGreaterThan(0);
  expectBigEnough(await sizes(page, HANDLES));
  expectBigEnough(await sizes(page, ENDS));

  for (let step = 0; step < 8; step += 1) await zoomOut(page);
  await expect.poll(async () => (await sizes(page, HANDLES)).length).toBe(0);
  expectBigEnough(await sizes(page, ENDS));

  // A node too small for handles is still moved by its body and still connected from the Properties panel.
  const before = await node.boundingBox();
  if (!before) throw new Error("The node must be on screen");
  const grab = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 3, grab.y + 3);
  await page.mouse.move(grab.x + 60, grab.y + 40, { steps: 8 });
  await page.mouse.up();
  const after = await node.boundingBox();
  expect(Math.abs((after?.x ?? 0) - before.x) + Math.abs((after?.y ?? 0) - before.y)).toBeGreaterThan(30);
  await node.click();
  await expect(page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Connect…" })).toBeVisible();
});

test("a Sequence diagram's lifelines and end handles are at least 24 px at every zoom", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  await addMessage(page, "Solid arrow", "A", "B");
  const message = sequenceCanvas(page).getByTestId("message").first();
  await message.focus();
  await page.keyboard.press("Enter");

  for (const clicks of [0, 8, -16]) {
    for (let step = 0; step < Math.abs(clicks); step += 1) await (clicks > 0 ? zoomIn(page) : zoomOut(page));
    const lifelines = (await sizes(page, HANDLES)).map((box) => ({ width: box.width, height: Math.max(box.height, 24) }));
    expect(lifelines.length).toBeGreaterThan(0);
    expectBigEnough(lifelines);
    expectBigEnough(await sizes(page, ENDS));
  }
});

test("a C4 diagram's handles and end handles are at least 24 px, and a too-small element shows none but still works", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [
    c4Record("tiny", "Tiny", "deployment", [
      { item: "deployment-node", id: 1, label: "Server", children: [{ item: "element", id: 2, elementType: "container", label: "App" }] },
      { item: "element", id: 3, elementType: "container", label: "Cache" },
    ], [{ id: 4, from: 2, to: 3 }]),
  ]);
  await page.goto("#/d/tiny");
  await page.reload();
  await expect(c4Canvas(page)).toBeVisible();
  const cache = itemLabelled(page, "Cache");
  const server = itemLabelled(page, "Server");

  const atDefault = await sizes(page, HANDLES);
  expect(atDefault).toHaveLength(12);
  expectBigEnough(atDefault);
  await c4Canvas(page).getByTestId("c4-relationship").first().focus();
  await page.keyboard.press("Enter");
  expectBigEnough(await sizes(page, ENDS));

  // Zoom out until the element is too small to hold handles while the node holding the app still can.
  for (let step = 0; step < 4; step += 1) await zoomOut(page);
  expect(await (await handlesOf(cache)).count()).toBe(0);
  expect(await (await handlesOf(server)).count()).toBe(4);
  expectBigEnough(await sizes(page, HANDLES));
  expectBigEnough(await sizes(page, ENDS));

  // The small element still accepts a line drawn from the node's handle, and still moves by its body.
  const from = await (await handlesOf(server, "right")).boundingBox();
  const to = await cache.boundingBox();
  if (!from || !to) throw new Error("The handle and the element must be on screen");
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 40, from.y + 10);
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(c4Canvas(page).getByTestId("c4-relationship")).toHaveCount(2);

  const body = await cache.boundingBox();
  const inside = await server.boundingBox();
  if (!body || !inside) throw new Error("The element and the node must be on screen");
  await page.mouse.move(body.x + body.width / 2, body.y + body.height / 2);
  await page.mouse.down();
  await page.mouse.move(body.x + body.width / 2 - 4, body.y + body.height / 2);
  await page.mouse.move(inside.x + inside.width / 2, inside.y + inside.height - 8, { steps: 12 });
  await page.mouse.up();
  const lines = await sourceLines(page);
  const open = lines.findIndex((line) => line.includes('"Server"'));
  expect(lines.findIndex((line) => line.includes('"Cache"'))).toBeGreaterThan(open);
  expect(lines.findIndex((line) => line.includes('"Cache"'))).toBeLessThan(lines.lastIndexOf("}"));

  await cache.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Connect…" })).toBeVisible();
});
