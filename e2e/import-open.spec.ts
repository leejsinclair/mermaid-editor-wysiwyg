import { expect, test } from "@playwright/test";
import { DIALOG_NAME, START_BUTTON, TEXT_LABEL, importDialog, openImportWithPointer } from "./support/import";

// VO-001 (FR-001, US1-AS1): New from Mermaid… sits beside the three type buttons; the dialog opens with a paste area and a
// file button, and focus is in the paste area, whether opened with the pointer or with the keyboard alone.

test("the pointer opens the dialog with focus in the paste area, beside the three type buttons", async ({ page }) => {
  await page.goto("#/");
  const start = page.getByRole("button", { name: START_BUTTON });
  const flowchart = page.getByRole("button", { name: "Flowchart" });
  await expect(start).toBeVisible();
  const startBox = await start.boundingBox();
  const flowBox = await flowchart.boundingBox();
  expect(startBox?.y).toBeCloseTo(flowBox?.y ?? -1, 0);

  await start.click();
  const dialog = importDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toBeFocused();
  await expect(dialog.getByRole("button", { name: "Choose file…" })).toBeVisible();
});

test("the keyboard alone opens the dialog with focus in the paste area", async ({ page }) => {
  await page.goto("#/");
  await page.getByRole("button", { name: START_BUTTON }).focus();
  await page.keyboard.press("Enter");
  const dialog = importDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toBeFocused();
});

test("the dialog is named New from Mermaid", async ({ page }) => {
  await openImportWithPointer(page);
  await expect(page.getByRole("dialog", { name: DIALOG_NAME })).toBeVisible();
});
