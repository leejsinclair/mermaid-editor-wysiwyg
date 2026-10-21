import { expect, test, type Page } from "@playwright/test";
import { importDialog, START_BUTTON, TEXT_LABEL } from "./support/import";

// VO-038 (FR-002, US5-AS1): while a file is dragged over the start screen a drop overlay shows, and dropping a supported
// file opens the dialog with the file's text loaded.

const FILE_TEXT = ["flowchart TD", "  A[Start] --> B[End]"].join("\n");

/** Fires a drag of one text file over the start screen's button, which the drag events bubble up from. */
async function dragFile(page: Page, name: string, content: string, type: "dragenter" | "drop"): Promise<void> {
  const dataTransfer = await page.evaluateHandle(
    ({ fileName, fileContent }) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([fileContent], fileName, { type: "text/plain" }));
      return transfer;
    },
    { fileName: name, fileContent: content },
  );
  await page.getByRole("button", { name: START_BUTTON }).dispatchEvent(type, { dataTransfer });
}

test("a file dragged over the start screen shows the overlay, and dropping it opens the dialog with its text", async ({ page }) => {
  await page.goto("#/");
  await expect(page.getByRole("button", { name: START_BUTTON })).toBeVisible();

  await dragFile(page, "flow.mmd", FILE_TEXT, "dragenter");
  await expect(page.getByTestId("drop-overlay")).toBeVisible({ timeout: 1000 });

  await dragFile(page, "flow.mmd", FILE_TEXT, "drop");
  const dialog = importDialog(page);
  await expect(dialog).toBeVisible({ timeout: 1000 });
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(FILE_TEXT, { timeout: 1000 });
  await expect(page.getByTestId("drop-overlay")).toHaveCount(0);
});
