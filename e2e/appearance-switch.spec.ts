import { expect, test } from "@playwright/test";

// VO-011 (FR-026, US1-AS4): with a node selected, a label draft open in Properties and an undoable edit made, choosing the other
// appearance changes the page, the header, the tools area and the canvas to the other token set at once, and leaves the selection,
// the draft text, Undo's availability and the generated source as they were; choosing Blueprint Studio changes them back.

const BLUEPRINT = { page: "rgb(7, 28, 48)", panel: "rgb(13, 43, 69)", canvas: "rgb(7, 28, 48)" };
const LIGHT = { page: "rgb(255, 255, 255)", panel: "rgb(245, 247, 250)", canvas: "rgb(255, 255, 255)" };

test("choosing the other appearance changes every surface at once and nothing of the diagram", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  const node = page.locator(".react-flow__node").first();
  await node.click();
  await page.getByRole("button", { name: /Mermaid source/ }).click();
  const source = page.getByRole("region", { name: /Mermaid source/ });
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await label.fill("Draft label");
  const sourceBefore = await source.textContent();
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeEnabled();

  const surfaces = async (expected: typeof LIGHT) => {
    await expect(page.locator("body")).toHaveCSS("background-color", expected.page);
    await expect(page.getByRole("banner")).toHaveCSS("background-color", expected.panel);
    await expect(page.getByRole("region", { name: "Toolbox" })).toHaveCSS("background-color", expected.panel);
    await expect(page.getByRole("region", { name: "Properties" })).toHaveCSS("background-color", expected.panel);
    await expect(page.getByRole("region", { name: "Diagram canvas" })).toHaveCSS("background-color", expected.canvas);
  };
  const unchanged = async () => {
    await expect(node).toHaveClass(/selected/);
    await expect(label).toHaveValue("Draft label");
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeEnabled();
    expect(await source.textContent()).toBe(sourceBefore);
  };

  await surfaces(BLUEPRINT);
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await surfaces(LIGHT);
  await unchanged();

  await page.getByRole("button", { name: "Blueprint Studio", exact: true }).click();
  await surfaces(BLUEPRINT);
  await unchanged();
});
