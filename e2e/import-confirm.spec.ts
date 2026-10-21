import { expect, test, type Page } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-003 (FR-003, US1-AS3): with a shown preview, Import creates one new diagram and opens it; Cancel creates nothing.

const FIVE_NODES = [
  "flowchart TD",
  "  A[Start] --> B{Check}",
  "  B -->|yes| C[Work]",
  "  B -->|no| D[Skip]",
  "  C --> E[End]",
  "  D --> E",
].join("\n");

const savedList = (page: Page) => page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");

test("Import with a shown preview creates one new diagram and opens it in the editor", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toBeVisible();

  await dialog.getByRole("button", { name: "Import" }).click();

  await expect(page).toHaveURL(/#\/d\/[^/]+$/);
  await page.goto("#/");
  await expect(savedList(page)).toHaveCount(1);
});

test("Cancel with a shown preview leaves the saved list exactly as it was", async ({ page }) => {
  await page.goto("#/");
  await expect(savedList(page)).toHaveCount(0);
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toBeVisible();

  await dialog.getByRole("button", { name: "Cancel" }).click();

  await expect(dialog).toBeHidden();
  await page.goto("#/");
  await expect(savedList(page)).toHaveCount(0);
});
