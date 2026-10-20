import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { addShape } from "./support/flowchart";
import { canvas as c4Canvas, handlesOf, openNew, toolboxButton } from "./support/c4";

// VO-033 (FR-008, DC-01): a flowchart node has four connection handles; every one starts a line and receives one; each line
// is drawn between the nearest facing sides and is redrawn when a node moves; a saved file holds no handle side and keeps the
// current format version; a C4 element and a Deployment node show four handles and a boundary shows none.

const SIDES = ["top", "right", "bottom", "left"] as const;
const OPPOSITE = new Map<string, string>([["top", "bottom"], ["right", "left"], ["bottom", "top"], ["left", "right"]]);

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const handle = (item: Locator, side: string): Locator => item.locator(`[data-side="${side}"]`);

/** The middle of an element, in page coordinates. */
async function centreOf(item: Locator): Promise<{ x: number; y: number }> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Drags from one handle to another with the mouse, in steps. */
async function drag(page: Page, from: Locator, to: Locator): Promise<void> {
  const start = await centreOf(from);
  const end = await centreOf(to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
}

/** The two ends of an edge's path, in page coordinates. */
async function endsOf(edge: Locator): Promise<readonly [{ x: number; y: number }, { x: number; y: number }]> {
  return edge.locator("path.react-flow__edge-path").evaluate((path: SVGPathElement) => {
    const matrix = path.getScreenCTM();
    if (!matrix) throw new Error("The edge must be drawn");
    const at = (length: number) => {
      const point = path.getPointAtLength(length);
      return { x: point.x * matrix.a + point.y * matrix.c + matrix.e, y: point.x * matrix.b + point.y * matrix.d + matrix.f };
    };
    return [at(0), at(path.getTotalLength())] as const;
  });
}

const near = (actual: { x: number; y: number }, expected: { x: number; y: number }) => {
  expect(Math.abs(actual.x - expected.x)).toBeLessThan(4);
  expect(Math.abs(actual.y - expected.y)).toBeLessThan(4);
};

async function twoNodes(page: Page, second: { x: number; y: number }) {
  await page.goto("#/new/flowchart");
  await addShape(page, canvas(page), "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas(page), "Circle", second);
  const rectangle = canvas(page).getByLabel(/^Rectangle node/);
  const circle = canvas(page).getByLabel(/^Circle node/);
  await expect(circle).toHaveCount(1);
  return { rectangle, circle, edges: canvas(page).locator(".react-flow__edge") };
}

test("every handle of a flowchart node starts a line and receives one", async ({ page }) => {
  const { rectangle, circle, edges } = await twoNodes(page, { x: 600, y: 320 });
  await expect(handle(rectangle, "top")).toHaveCount(1);
  for (const side of SIDES) await expect(handle(rectangle, side)).toHaveCount(1);

  let count = 0;
  for (const side of SIDES) {
    await drag(page, handle(rectangle, side), handle(circle, OPPOSITE.get(side) ?? ""));
    count += 1;
    await expect(edges).toHaveCount(count);
    await drag(page, handle(circle, side), handle(rectangle, OPPOSITE.get(side) ?? ""));
    count += 1;
    await expect(edges).toHaveCount(count);
  }
});

test("a line is drawn between the nearest facing sides and is redrawn when a node moves", async ({ page }) => {
  const { rectangle, circle, edges } = await twoNodes(page, { x: 600, y: 100 });
  // Drawn from the top handle, the line still joins the sides that face each other.
  await drag(page, handle(rectangle, "top"), handle(circle, "bottom"));
  await expect(edges).toHaveCount(1);
  let [start, end] = await endsOf(edges);
  near(start, await centreOf(handle(rectangle, "right")));
  near(end, await centreOf(handle(circle, "left")));

  // The circle moves below the rectangle: the facing sides are now bottom and top.
  const body = await centreOf(circle);
  await page.mouse.move(body.x, body.y);
  await page.mouse.down();
  await page.mouse.move(body.x - 2, body.y + 2);
  await page.mouse.move(body.x - 380, body.y + 260, { steps: 10 });
  await page.mouse.up();
  [start, end] = await endsOf(edges);
  near(start, await centreOf(handle(rectangle, "bottom")));
  near(end, await centreOf(handle(circle, "top")));
});

test("a saved file holds no handle side and keeps the current format version, and reopens the same", async ({ page }) => {
  const { rectangle, circle, edges } = await twoNodes(page, { x: 600, y: 100 });
  await drag(page, handle(rectangle, "right"), handle(circle, "left"));
  await expect(edges).toHaveCount(1);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();
  const file = await (await download).path();
  const text = await readFile(file, "utf8");
  expect(text).not.toMatch(/handle|side/i);
  expect((JSON.parse(text) as { formatVersion: number }).formatVersion).toBe(1);

  await page.goto("#/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open file…" }).click();
  await (await chooser).setFiles(file);
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(canvas(page).locator(".react-flow__node")).toHaveCount(2);
  await expect(canvas(page).locator(".react-flow__edge")).toHaveCount(1);
});

test("a C4 element shows four connection handles and a boundary shows none", async ({ page }) => {
  await openNew(page, "container");
  await toolboxButton(page, "Person").click();
  await toolboxButton(page, "System boundary").click();
  const element = c4Canvas(page).getByTestId("c4-element");
  const boundary = c4Canvas(page).getByTestId("c4-boundary");
  await expect(element).toHaveCount(1);
  await expect(await handlesOf(element)).toHaveCount(4);
  for (const side of SIDES) await expect(await handlesOf(element, side)).toHaveCount(1);
  await expect(await handlesOf(boundary)).toHaveCount(0);

});

test("a Deployment node shows four connection handles", async ({ page }) => {
  await openNew(page, "deployment");
  await toolboxButton(page, "Deployment node").click();
  const node = c4Canvas(page).getByTestId("c4-node");
  await expect(await handlesOf(node)).toHaveCount(4);
  for (const side of SIDES) await expect(await handlesOf(node, side)).toHaveCount(1);
});
