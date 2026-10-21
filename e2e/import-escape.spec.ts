import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste, START_BUTTON, TEXT_LABEL } from "./support/import";

// VO-052 (EC-10): Escape on an empty dialog closes it at once, without asking. Escape on a dialog with text closes it, and
// when the dialog is opened again in the same visit the text is still there.

const TYPED = ["flowchart TD", "  A[Kept] --> B[Too]"].join("\n");

test("Escape closes an empty dialog at once", async ({ page }) => {
  await openImportWithPointer(page);
  await page.keyboard.press("Escape");
  await expect(importDialog(page)).toBeHidden({ timeout: 1000 });
});

test("Escape keeps the text for the rest of the visit", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, TYPED);
  await expect(importDialog(page).getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  await page.keyboard.press("Escape");
  await expect(importDialog(page)).toBeHidden({ timeout: 1000 });

  await page.getByRole("button", { name: START_BUTTON }).click();
  await expect(importDialog(page).getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(TYPED, { timeout: 1000 });
});
