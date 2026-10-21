import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-016 (FR-004, US3-AS4): with no text, and again with only spaces, no error is shown, only a hint of what can be
// pasted, and Import stays disabled.

const HINT = "Paste Mermaid text here, or choose a .mmd, .md or .txt file.";

test("an empty text shows only the hint and leaves Import disabled", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  const status = dialog.getByRole("status", { name: "Import status" });

  await expect(status).toHaveText(HINT);
  await expect(dialog.getByTestId("error-line")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled();

  await paste(page, "   \n  \n ");
  await expect(status).toHaveText(HINT, { timeout: 1000 });
  await expect(dialog.getByTestId("error-line")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled();
});
