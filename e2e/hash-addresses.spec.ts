import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-001 (FR-015, US1-AS3, EC-02): every in-app address names its view after `#`, so a reload or a new tab opens the
// same view from the one real page and nothing before `#` ever varies between views.

const beforeHash = (url: string): string => url.split("#")[0] ?? "";
const canvasOf = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });

test("the start screen and a new-diagram address open their own views", async ({ page }) => {
  await page.goto("#/");
  await expect(page.getByRole("region", { name: "New diagram" })).toBeVisible();
  const base = beforeHash(page.url());

  await page.goto("#/new/flowchart");
  await expect(canvasOf(page)).toBeVisible();
  expect(beforeHash(page.url())).toBe(base);
});

test("a saved diagram's address names its view after the hash and survives a reload", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const base = beforeHash(page.url());
  await addShape(page, canvasOf(page), "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");

  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  expect(beforeHash(page.url())).toBe(base);

  await page.reload();
  await expect(canvasOf(page).locator(".react-flow__node")).toHaveCount(1);
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
});

test("the saved address opened in a new tab shows the same diagram", async ({ page, context }) => {
  await page.goto("#/new/flowchart");
  await addShape(page, canvasOf(page), "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  const saved = page.url();
  // One tab edits a diagram at a time, so the first tab is closed before the address is opened in a new one.
  await page.close();

  const second = await context.newPage();
  await second.goto(saved);
  await expect(canvasOf(second).locator(".react-flow__node")).toHaveCount(1);
});
