import { expect, type Locator, type Page } from "@playwright/test";

// Shared helpers for the New from Mermaid dialog (contracts/import-dialog.md).

export const START_BUTTON = "New from Mermaid…";
export const DIALOG_NAME = "New from Mermaid";
export const TEXT_LABEL = "Mermaid text";

/** The dialog, once it is open. */
export function importDialog(page: Page): Locator {
  return page.getByRole("dialog", { name: DIALOG_NAME });
}

/** Opens the dialog from the start screen with the pointer. */
export async function openImportWithPointer(page: Page): Promise<void> {
  await page.goto("#/");
  await page.getByRole("button", { name: START_BUTTON }).click();
  await expect(importDialog(page)).toBeVisible();
}

/** Pastes text into the dialog's text area. */
export async function paste(page: Page, text: string): Promise<void> {
  await importDialog(page).getByRole("textbox", { name: TEXT_LABEL }).fill(text);
}
