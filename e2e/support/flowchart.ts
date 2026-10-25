import { expect, type Locator, type Page } from "@playwright/test";

/** Draws a connection by dragging from a node's bottom handle to another node's top handle. */
export async function connect(page: Page, canvas: Locator, from: Locator, to: Locator, edgesAfter: number) {
  const start = await from.locator('[data-side="bottom"]').boundingBox();
  const end = await to.locator('[data-side="top"]').boundingBox();
  if (!start || !end) throw new Error("Both handles must be visible");
  await page.mouse.move(start.x + 3, start.y + 3);
  await page.mouse.down();
  await page.mouse.move(end.x + 3, end.y + 3, { steps: 10 });
  await page.mouse.up();
  await expect(canvas.locator(".react-flow__edge")).toHaveCount(edgesAfter);
}

/** Drops a toolbox shape on the canvas at a point relative to its top-left corner, and leaves its label editor open (spec 008, FR-004). */
export async function dropShape(page: Page, canvas: Locator, shape: string, at: { x: number; y: number }) {
  await page.getByRole("button", { name: shape, exact: true }).dragTo(canvas, { targetPosition: at });
}

/** Closes the label editor of a shape just added and clears its selection, as a canvas that was only drawn on has it. */
export async function settleNewShape(page: Page) {
  const editor = page.getByTestId("inline-label-editor");
  await expect(editor).toBeVisible();
  await editor.press("Escape");
  await expect(editor).toHaveCount(0);
  await page.keyboard.press("Escape");
  // Closing the editor hands focus back to the node; the tests that follow start with nothing focused.
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
}

/** Drops a toolbox shape on the canvas at a point relative to its top-left corner, with nothing left open or selected. */
export async function addShape(page: Page, canvas: Locator, shape: string, at: { x: number; y: number }) {
  await dropShape(page, canvas, shape, at);
  await settleNewShape(page);
}
