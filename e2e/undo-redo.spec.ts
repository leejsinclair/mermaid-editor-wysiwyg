import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-030: Undo and Redo are unavailable when there is nothing to undo or redo, and say so to assistive technology.

const nodes = (page: Page) => page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node");

async function twoNodes(page: Page) {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await expect(nodes(page)).toHaveCount(2);
  return canvas;
}

test("Undo and Redo are disabled when unavailable and enabled when not", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();

  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await expect(undo).toBeEnabled();
  await expect(redo).toBeDisabled();

  await undo.click();
  await expect(nodes(page)).toHaveCount(1);
  await expect(redo).toBeEnabled();
  await undo.click();
  await expect(nodes(page)).toHaveCount(0);
  await expect(undo).toBeDisabled();
  await expect(redo).toBeEnabled();

  await redo.click();
  await redo.click();
  await expect(nodes(page)).toHaveCount(2);
  await expect(redo).toBeDisabled();
  await expect(undo).toBeEnabled();
});

test("the keyboard shortcuts Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y undo and redo", async ({ page }) => {
  const canvas = await twoNodes(page);
  await canvas.locator(".react-flow__pane").click({ position: { x: 20, y: 20 } });

  await page.keyboard.press("Control+z");
  await expect(nodes(page)).toHaveCount(1);
  await page.keyboard.press("Control+Shift+Z");
  await expect(nodes(page)).toHaveCount(2);
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+z");
  await expect(nodes(page)).toHaveCount(0);
  await page.keyboard.press("Control+y");
  await expect(nodes(page)).toHaveCount(1);
});

test("Ctrl+Z inside the label field undoes typing, not the diagram", async ({ page }) => {
  const canvas = await twoNodes(page);
  await canvas.locator(".react-flow__node").first().click();
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await label.fill("typed text");

  await page.keyboard.press("Control+z");

  await expect(nodes(page)).toHaveCount(2);
});
