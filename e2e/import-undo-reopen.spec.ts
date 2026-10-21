import { expect, test } from "@playwright/test";
import { panelLabel } from "./support/items";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-004 (FR-011, US1-AS4): an imported diagram starts with an empty Undo; it can be edited, saved and reopened with the
// edit and everything imported.

const FIVE_NODES = [
  "flowchart TD",
  "  A[Start] --> B{Check}",
  "  B -->|yes| C[Work]",
  "  B -->|no| D[Skip]",
  "  C --> E[End]",
  "  D --> E",
].join("\n");

test("after an import Undo is unavailable, an edit is kept across a reload and when the diagram is reopened", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  await expect(importDialog(page).getByTestId("detected-type")).toBeVisible();
  await importDialog(page).getByRole("button", { name: "Import" }).click();
  await expect(page).toHaveURL(/#\/d\/[^/]+$/);

  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
  await expect(canvas.locator(".react-flow__node")).toHaveCount(5);

  await canvas.locator(".react-flow__node", { hasText: "Start" }).click();
  await panelLabel(page).fill("Begin");
  await panelLabel(page).press("Enter");
  await expect(canvas.locator(".react-flow__node", { hasText: "Begin" })).toHaveCount(1);

  await page.reload();
  const reloaded = page.getByRole("region", { name: "Diagram canvas" });
  await expect(reloaded.locator(".react-flow__node")).toHaveCount(5);
  await expect(reloaded.locator(".react-flow__node", { hasText: "Begin" })).toHaveCount(1);

  await page.goto("#/");
  await page.getByRole("region", { name: "Saved diagrams" }).getByRole("link").first().click();
  const reopened = page.getByRole("region", { name: "Diagram canvas" });
  await expect(reopened.locator(".react-flow__node")).toHaveCount(5);
  await expect(reopened.locator(".react-flow__node", { hasText: "Begin" })).toHaveCount(1);
});
