import { expect, test } from "@playwright/test";
import { fillStorage } from "./support/storage";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-036 (FR-011): if browser storage fails when the developer confirms, nothing is created, the dialog stays open with its
// text, and a message says the diagram could not be saved in this browser and why.

const FIVE_NODES = [
  "flowchart TD",
  "  A[Start] --> B{Check}",
  "  B -->|yes| C[Work]",
  "  B -->|no| D[Skip]",
  "  C --> E[End]",
  "  D --> E",
].join("\n");

test("a storage failure on Import creates nothing, keeps the dialog and its text, and says why", async ({ page }) => {
  // The init script applies to the next real navigation, so storage is filled before the first load.
  await fillStorage(page);
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toBeVisible();

  await dialog.getByRole("button", { name: "Import" }).click();

  await expect(dialog.getByRole("status")).toContainText("The diagram could not be saved in this browser", { timeout: 15_000 });
  await expect(dialog.getByRole("status")).toContainText("Nothing was created.");
  await expect(dialog.getByRole("textbox", { name: "Mermaid text" })).toHaveValue(FIVE_NODES);
  await page.goto("#/");
  await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(0);
});
