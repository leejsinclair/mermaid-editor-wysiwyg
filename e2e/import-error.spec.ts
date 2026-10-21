import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-012 (FR-005, US3-AS1): a flowchart with an unclosed bracket shows its line and column and Mermaid's message, marks
// the offending line with a visible marker and the accessible text "error here", shows no picture, and disables Import.

const UNCLOSED = ["flowchart TD", "  A[Start", "  A --> B"].join("\n");

test("an unclosed bracket shows the line and column, marks the line, shows no picture and disables Import", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, UNCLOSED);
  const dialog = importDialog(page);

  await expect(dialog.getByRole("status", { name: "Import status" })).toContainText(/Line 2, column \d+:/, { timeout: 1000 });
  await expect(dialog.getByText("error here")).toBeVisible({ timeout: 1000 });
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled();
});

// VO-014 (FR-005, US3-AS2): after an error, correcting the text clears it, and the picture appears within one second of the
// last keystroke.
const CORRECTED = ["flowchart TD", "  A[Start] --> B[Done]"].join("\n");

test("correcting the text clears the error and draws the picture within one second", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, UNCLOSED);
  const dialog = importDialog(page);
  await expect(dialog.getByText("error here")).toBeVisible({ timeout: 1000 });

  await paste(page, CORRECTED);
  await expect(dialog.getByText("error here")).toHaveCount(0, { timeout: 1000 });
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 1000 });
  await expect(dialog.getByRole("button", { name: "Import" })).toBeEnabled();
});
