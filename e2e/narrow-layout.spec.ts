import { expect, test, type Page } from "@playwright/test";

// VO-033 (FR-010, US5-AS1): at 800 × 900 and at 360 × 740 a labelled "Tools" control opens the toolbox and properties and the
// "Mermaid source" disclosure opens the source view; with both closed the canvas covers at least half the window's width and half
// its height.

const SIZES = [
  { width: 800, height: 900 },
  { width: 360, height: 740 },
] as const;

async function openFlowchart(page: Page): Promise<void> {
  await page.goto("#/new/flowchart");
  await expect(page.getByRole("region", { name: "Diagram canvas" })).toBeVisible();
}

for (const size of SIZES) {
  test(`at ${String(size.width)} × ${String(size.height)} the tools and source are panels opened by labelled controls and the canvas keeps the window`, async ({ page }) => {
    await page.setViewportSize(size);
    await openFlowchart(page);

    const tools = page.getByRole("button", { name: "Tools", exact: true });
    await expect(tools).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("region", { name: "Toolbox" })).toBeHidden();
    await expect(page.getByRole("region", { name: "Properties" })).toBeHidden();

    const canvas = await page.getByRole("region", { name: "Diagram canvas" }).boundingBox();
    if (!canvas) throw new Error("no canvas");
    expect(canvas.width, "canvas width against the window").toBeGreaterThanOrEqual(size.width / 2);
    expect(canvas.height, "canvas height against the window").toBeGreaterThanOrEqual(size.height / 2);

    await tools.click();
    await expect(tools).toHaveAttribute("aria-expanded", "true");
    const panel = page.getByRole("region", { name: "Tools", exact: true });
    await expect(panel.getByRole("region", { name: "Toolbox" })).toBeVisible();
    await expect(panel.getByRole("region", { name: "Properties" })).toBeVisible();
    await tools.click();
    await expect(tools).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("region", { name: "Toolbox" })).toBeHidden();

    await page.getByRole("button", { name: /Mermaid source/ }).click();
    await expect(page.getByRole("region", { name: /Mermaid source/ })).toBeVisible();
  });
}

// Spec 008, VO-020 and VO-050 (FR-034, US6-AS2, EC-10): at 360 px, with an element selected on the canvas, the Tools panel opens
// on that element's properties and actions, with no sideways page scroll.
test("at 360 × 740 a selected element's properties and actions are in view when Tools opens", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openFlowchart(page);
  const tools = page.getByRole("button", { name: "Tools", exact: true });
  await tools.click();
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await page.getByTestId("inline-label-editor").press("Enter");
  await tools.click();

  await page.locator(".react-flow__node").first().click();
  await tools.click();

  const properties = page.getByRole("region", { name: "Properties" });
  await expect(properties.getByText("Selected: Rectangle node", { exact: true })).toBeInViewport();
  await expect(properties.getByRole("button", { name: "Delete", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page scrolls sideways").toBe(true);
});
