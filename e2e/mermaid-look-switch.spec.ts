import { expect, test } from "@playwright/test";
import { openPreviewOfEveryShape, previewRegion, readDrawing } from "./support/preview";

// VO-027 (FR-019, US4-AS2): with the preview open in Blueprint Studio, choosing Light redraws it in Mermaid's default look without
// closing it, and choosing Blueprint Studio again redraws it in the blueprint look.

const BLUEPRINT_FILL = "rgb(13, 43, 69)";
const MERMAID_DEFAULT_FILL = "rgb(236, 236, 255)";

test("the open preview is redrawn when the appearance is chosen", async ({ page }) => {
  await openPreviewOfEveryShape(page);
  expect((await readDrawing(page)).nodes[0]?.fill).toBe(BLUEPRINT_FILL);

  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(previewRegion(page)).toBeVisible();
  await expect.poll(async () => (await readDrawing(page)).nodes[0]?.fill).toBe(MERMAID_DEFAULT_FILL);
  await expect(previewRegion(page).locator("svg g.node")).toHaveCount(9);

  await page.getByRole("button", { name: "Blueprint Studio", exact: true }).click();
  await expect.poll(async () => (await readDrawing(page)).nodes[0]?.fill).toBe(BLUEPRINT_FILL);
});
