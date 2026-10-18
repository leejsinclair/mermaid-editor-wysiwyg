import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-006: with two nodes, choosing a connection type and drawing it between them adds that connection.

async function dragBetween(page: Page, from: Locator, to: Locator) {
  const start = await from.boundingBox();
  const end = await to.boundingBox();
  if (!start || !end) throw new Error("Both handles must be visible");
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 });
  await page.mouse.up();
}

test("drawing a chosen connection type between two nodes adds exactly that connection", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 200, y: 120 } });
  await page.getByRole("button", { name: "Circle", exact: true }).dragTo(canvas, { targetPosition: { x: 520, y: 360 } });
  const rectangle = canvas.getByLabel("Rectangle node: Rectangle", { exact: true });
  const circle = canvas.getByLabel("Circle node: Circle", { exact: true });

  await page.getByRole("button", { name: "Dotted arrow", exact: true }).click();
  await dragBetween(page, rectangle.locator(".react-flow__handle.source"), circle.locator(".react-flow__handle.target"));

  await expect(canvas.getByLabel("Dotted arrow connection from Rectangle to Circle", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mermaid source" }).click();
  await expect(page.getByRole("region", { name: "Mermaid source" })).toHaveText(
    /^flowchart TD\s+n1\["Rectangle"\]\s+n2\(\("Circle"\)\)\s+n1 -\.-> n2$/,
  );
});
