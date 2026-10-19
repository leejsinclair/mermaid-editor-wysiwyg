import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-012 (EC-06): the preview shows the diagram as Mermaid draws it, read-only, with zoom, pan and fit; it updates
// within a second of each change, Undo and Redo; and a render failure replaces the picture with an explanation.

const TOGGLE = "Preview as Mermaid draws it";

async function withRectangle(page: Page) {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  return canvas;
}

const preview = (page: Page) => page.getByRole("region", { name: TOGGLE });

test("the preview opens by pointer and by keyboard, and shows the diagram drawn by Mermaid", async ({ page }) => {
  await withRectangle(page);
  const toggle = page.getByRole("button", { name: TOGGLE });
  await expect(preview(page)).toHaveCount(0);

  await toggle.click();
  await expect(preview(page).getByRole("application").locator("svg").first()).toBeVisible();
  await expect(preview(page)).toContainText("Rectangle");

  await toggle.click();
  await expect(preview(page)).toHaveCount(0);

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(preview(page)).toContainText("Rectangle");
  await page.keyboard.press("Space");
  await expect(preview(page)).toHaveCount(0);
});

test("the preview is read-only and offers zoom, pan and fit", async ({ page }) => {
  await withRectangle(page);
  await page.getByRole("button", { name: TOGGLE }).click();
  const region = preview(page);
  const svg = region.getByRole("application").locator("svg").first();
  const viewBoxWidth = async () => Number(((await svg.getAttribute("viewBox")) ?? "").split(/\s+/)[2]);
  await expect(svg).toBeVisible();
  const fitted = await viewBoxWidth();

  await region.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect.poll(viewBoxWidth).toBeLessThan(fitted);
  await region.getByRole("button", { name: "Zoom out", exact: true }).click();
  await region.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect.poll(viewBoxWidth).toBeGreaterThan(fitted);
  await region.getByRole("button", { name: "Fit to view", exact: true }).click();
  await expect.poll(viewBoxWidth).toBeCloseTo(fitted, 0);

  const before = (await svg.getAttribute("viewBox")) ?? "";
  const box = await svg.boundingBox();
  if (!box) throw new Error("The preview must be visible");
  await region.getByRole("button", { name: "Zoom in", exact: true }).click();
  const zoomed = (await svg.getAttribute("viewBox")) ?? "";
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
  expect(before).not.toBe("");
  await expect.poll(async () => svg.getAttribute("viewBox")).not.toBe(zoomed);

  await expect(region.getByRole("textbox")).toHaveCount(0);
  await expect(region.locator("[contenteditable='true'], input, textarea")).toHaveCount(0);
});

test("the preview updates within a second of each change, Undo and Redo", async ({ page }) => {
  const canvas = await withRectangle(page);
  await page.getByRole("button", { name: TOGGLE }).click();
  await expect(preview(page)).toContainText("Rectangle");

  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await expect(preview(page)).toContainText("Circle", { timeout: 1000 });

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(preview(page)).not.toContainText("Circle", { timeout: 1000 });

  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(preview(page)).toContainText("Circle", { timeout: 1000 });
});

test("when Mermaid cannot draw the diagram, the preview says why in place of any picture", async ({ page }) => {
  // Mermaid parses the source normally but fails to render it.
  await page.route("**/.vite/deps/mermaid*", async (route) => {
    if (route.request().resourceType() !== "script") return route.continue();
    return route.fulfill({
      contentType: "text/javascript",
      body: `export default {
        initialize() {},
        parse: async () => ({ diagramType: "flowchart" }),
        render: async () => { throw new Error("forced failure"); },
      };`,
    });
  });
  await withRectangle(page);

  await page.getByRole("button", { name: TOGGLE }).click();

  await expect(preview(page)).toContainText("Mermaid could not draw this diagram: forced failure");
  await expect(preview(page).getByRole("application")).toHaveCount(0);
});
