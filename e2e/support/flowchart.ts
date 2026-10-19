import { expect, type Locator, type Page } from "@playwright/test";

/** Draws a connection by dragging from a node's bottom handle to another node's top handle. */
export async function connect(page: Page, canvas: Locator, from: Locator, to: Locator, edgesAfter: number) {
  const start = await from.locator(".react-flow__handle.source").boundingBox();
  const end = await to.locator(".react-flow__handle.target").boundingBox();
  if (!start || !end) throw new Error("Both handles must be visible");
  await page.mouse.move(start.x + 3, start.y + 3);
  await page.mouse.down();
  await page.mouse.move(end.x + 3, end.y + 3, { steps: 10 });
  await page.mouse.up();
  await expect(canvas.locator(".react-flow__edge")).toHaveCount(edgesAfter);
}

/** Drops a toolbox shape on the canvas at a point relative to its top-left corner. */
export async function addShape(page: Page, canvas: Locator, shape: string, at: { x: number; y: number }) {
  await page.getByRole("button", { name: shape, exact: true }).dragTo(canvas, { targetPosition: at });
}
