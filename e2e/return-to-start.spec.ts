import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { delayStorageCompletion } from "./support/storage";

// VO-066 (FR-043): returning to the start screen from a diagram with changes lists it, and it opens unchanged.

test("Start screen lists the changed diagram, and it opens unchanged", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 500, y: 250 });
  await expect(canvas.locator(".react-flow__node")).toHaveCount(2);

  await page.getByRole("button", { name: "Start screen" }).click();

  await expect(page).toHaveURL(/#\/$/);
  const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Untitled flowchart");
  await items.first().getByRole("link").click();
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(canvas.locator(".react-flow__node")).toHaveCount(2);
  await expect(canvas.getByLabel(/^Rectangle node/)).toHaveCount(1);
  await expect(canvas.getByLabel(/^Circle node/)).toHaveCount(1);
});

test("Start screen waits for a write still under way, so the diagram is listed with its changes", async ({ page }) => {
  await delayStorageCompletion(page);
  await page.goto("#/new/flowchart");
  await page.evaluate(() => {
    (window as unknown as { __idbDelay: number }).__idbDelay = 1200;
  });
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saving…");

  await page.getByRole("button", { name: "Start screen" }).click();

  await expect(page).toHaveURL(/#\/$/);
  await page.evaluate(() => {
    (window as unknown as { __idbDelay: number }).__idbDelay = 0;
  });
  await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(1);
});
