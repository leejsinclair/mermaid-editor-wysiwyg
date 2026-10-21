import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-002 (FR-002, FR-003, US1-AS2): a valid five-node flowchart shows, within one second, its detected type, a picture
// of the diagram, and an Import report saying nothing was dropped.

const FIVE_NODES = [
  "flowchart TD",
  "  A[Start] --> B{Check}",
  "  B -->|yes| C[Work]",
  "  B -->|no| D[Skip]",
  "  C --> E[End]",
  "  D --> E",
].join("\n");

test("a valid flowchart shows its type, a picture and a report that nothing was dropped, within one second", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  const dialog = importDialog(page);

  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 1000 });
  await expect(dialog.getByRole("region", { name: "Import report" })).toContainText("Nothing was dropped or approximated", { timeout: 1000 });
});
