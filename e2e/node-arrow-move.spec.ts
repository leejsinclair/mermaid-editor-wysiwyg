import { expect, test } from "@playwright/test";

// VO-063 (FR-019): arrow keys move a selected flowchart node by a fixed step; uninterrupted moves are one undo step.

test("arrow keys move the selected node and consecutive moves undo as one step", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  const node = canvas.locator(".react-flow__node").first();
  await node.click();
  const before = await node.boundingBox();

  await node.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");

  await expect.poll(async () => (await node.boundingBox())?.x).toBeGreaterThan((before?.x ?? 0) + 20);
  const moved = await node.boundingBox();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => (await node.boundingBox())?.x).toBeCloseTo(before?.x ?? 0, 0);
  expect(moved?.x).not.toBeCloseTo(before?.x ?? 0, 0);
});
