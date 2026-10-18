import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-016: dragging a connected node to a free spot shows it at the new position, with its connections drawn to it.

async function dragNode(page: Page, node: Locator, by: { x: number; y: number }) {
  const box = await node.boundingBox();
  if (!box) throw new Error("The node must be visible");
  const grab = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 2, grab.y + 2);
  await page.mouse.move(grab.x + by.x, grab.y + by.y, { steps: 10 });
  await page.mouse.up();
}

/** The end points of the single drawn connection, in canvas coordinates. */
async function connectionEnds(canvas: Locator) {
  const path = await canvas.locator(".react-flow__edge-path").getAttribute("d");
  const numbers = (path ?? "").match(/-?[\d.]+/g)?.map(Number) ?? [];
  const [startX, startY] = numbers;
  const [endX, endY] = numbers.slice(-2);
  return { startX, startY, endX, endY };
}

test("a dragged connected node ends at the new position with its connection drawn to it", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 200, y: 100 } });
  await page.getByRole("button", { name: "Circle", exact: true }).dragTo(canvas, { targetPosition: { x: 520, y: 360 } });
  const rectangle = canvas.getByLabel("Rectangle node: Rectangle", { exact: true });
  const circle = canvas.getByLabel("Circle node: Circle", { exact: true });
  const handle = (node: Locator, kind: string) => node.locator(`.react-flow__handle.${kind}`);
  const [from, to] = [await handle(rectangle, "source").boundingBox(), await handle(circle, "target").boundingBox()];
  if (!from || !to) throw new Error("Both handles must be visible");
  await page.mouse.move(from.x + 3, from.y + 3);
  await page.mouse.down();
  await page.mouse.move(to.x + 3, to.y + 3, { steps: 10 });
  await page.mouse.up();
  await expect(canvas.getByLabel(/connection from Rectangle to Circle/)).toHaveCount(1);
  const before = await circle.boundingBox();
  if (!before) throw new Error("The node must be visible");

  await dragNode(page, circle, { x: 160, y: 120 });

  const after = await circle.boundingBox();
  expect(after?.x).toBeCloseTo(before.x + 160, -1);
  expect(after?.y).toBeCloseTo(before.y + 120, -1);
  const canvasBox = await canvas.boundingBox();
  const ends = await connectionEnds(canvas);
  expect(ends.endX).toBeCloseTo((after?.x ?? 0) + (after?.width ?? 0) / 2 - (canvasBox?.x ?? 0), -1);
  expect(ends.endY).toBeCloseTo((after?.y ?? 0) - (canvasBox?.y ?? 0), -1);
});
