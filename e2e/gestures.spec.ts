import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-032 (EC-08): one Undo reverses a whole completed drag and a whole confirmed label edit; a cancelled drag and a
// cancelled label edit add no history entry; Undo or Redo pressed during a drag or a label edit leaves no partial
// change.

async function twoNodes(page: Page) {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  const rectangle = canvas.getByLabel(/^Rectangle node/);
  const circle = canvas.getByLabel(/^Circle node/);
  await expect(circle).toHaveCount(1);
  return { canvas, rectangle, circle, properties: page.getByRole("region", { name: "Properties" }) };
}

const undo = (page: Page) => page.getByRole("button", { name: "Undo", exact: true });
const redo = (page: Page) => page.getByRole("button", { name: "Redo", exact: true });
const nodes = (canvas: Locator) => canvas.locator(".react-flow__node");

async function centre(node: Locator) {
  const box = await node.boundingBox();
  if (!box) throw new Error("The node must be visible");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
}

/** Presses on a node and moves it by (dx, dy) without releasing. */
async function dragStart(page: Page, node: Locator, dx: number, dy: number) {
  const { x, y } = await centre(node);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 2, y + 2);
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
}

test("one Undo reverses a whole completed drag", async ({ page }) => {
  const { circle } = await twoNodes(page);
  const before = (await centre(circle)).box;

  await dragStart(page, circle, 120, 90);
  await page.mouse.up();
  const moved = (await centre(circle)).box;
  expect(moved.x).toBeGreaterThan(before.x + 100);

  await undo(page).click();

  await expect.poll(async () => (await centre(circle)).box.x).toBeCloseTo(before.x, -1);
  expect((await centre(circle)).box.y).toBeCloseTo(before.y, -1);
});

test("one Undo reverses a whole confirmed label edit", async ({ page }) => {
  const { circle, properties } = await twoNodes(page);
  await circle.click();

  await properties.getByRole("textbox", { name: "Label" }).fill("Renamed");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("node-label").nth(1)).toHaveText("Renamed");
  await undo(page).click();

  await expect(page.getByTestId("node-label").nth(1)).toHaveText("Circle");
});

test("a cancelled drag adds no history entry", async ({ page }) => {
  const { canvas, circle } = await twoNodes(page);
  const before = (await centre(circle)).box;

  await dragStart(page, circle, 120, 90);
  await page.keyboard.press("Escape");
  await page.mouse.up();

  expect((await centre(circle)).box.x).toBeCloseTo(before.x, -1);
  await undo(page).click();
  await expect(nodes(canvas)).toHaveCount(1);
  await expect(canvas.getByLabel(/^Circle node/)).toHaveCount(0);
});

test("a cancelled label edit adds no history entry", async ({ page }) => {
  const { canvas, circle, properties } = await twoNodes(page);
  await circle.click();

  await properties.getByRole("textbox", { name: "Label" }).fill("Discarded");
  await page.keyboard.press("Escape");
  await undo(page).click();

  await expect(canvas.getByLabel(/^Circle node/)).toHaveCount(0);
  await expect(canvas.getByLabel(/^Rectangle node/)).toHaveCount(1);
});

test("Undo during a drag of another node cancels the drag and leaves no partial change", async ({ page }) => {
  const { canvas, rectangle } = await twoNodes(page);
  const before = (await centre(rectangle)).box;

  await dragStart(page, rectangle, 60, 150);
  await page.keyboard.press("Control+z");
  await page.mouse.up();

  await expect(canvas.getByLabel(/^Circle node/)).toHaveCount(0);
  const after = (await centre(rectangle)).box;
  expect(after.x).toBeCloseTo(before.x, -1);
  expect(after.y).toBeCloseTo(before.y, -1);
  await redo(page).click();
  await expect(canvas.getByLabel(/^Circle node/)).toHaveCount(1);
  expect((await centre(rectangle)).box.x).toBeCloseTo(before.x, -1);
  await undo(page).click();
  await undo(page).click();
  await expect(nodes(canvas)).toHaveCount(0);
});

test("Undo during a label edit discards the draft and leaves no partial change", async ({ page }) => {
  const { canvas, circle, properties } = await twoNodes(page);
  await circle.click();

  await properties.getByRole("textbox", { name: "Label" }).fill("Half typed");
  await undo(page).click();

  await expect(canvas.getByLabel(/^Circle node/)).toHaveCount(0);
  await redo(page).click();
  await expect(canvas.getByLabel("Circle node: Circle", { exact: true })).toHaveCount(1);
});
