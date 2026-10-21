import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, TEXT_LABEL } from "./support/import";

// VO-056 (FR-002, US5-AS2): choosing a file with Choose file… loads its text into the text area and checks it like pasted
// text: a valid file shows a picture, and a broken file shows its error.

const VALID = ["flowchart TD", "  A[Start] --> B[End]"].join("\n");
const BROKEN = ["flowchart TD", "  A[Start"].join("\n");

test("a chosen valid file loads its text and shows a picture", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await dialog.locator('input[type="file"]').setInputFiles({ name: "flow.mmd", mimeType: "text/plain", buffer: Buffer.from(VALID) });

  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(VALID, { timeout: 1000 });
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 1000 });
});

test("a chosen broken file loads its text and shows the error", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await dialog.locator('input[type="file"]').setInputFiles({ name: "broken.mmd", mimeType: "text/plain", buffer: Buffer.from(BROKEN) });

  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(BROKEN, { timeout: 1000 });
  await expect(dialog.getByRole("status", { name: "Import status" })).toContainText(/Line 2, column \d+:/, { timeout: 1000 });
  await expect(dialog.getByText("error here")).toBeVisible({ timeout: 1000 });
});
