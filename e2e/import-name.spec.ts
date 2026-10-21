import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-034 (FR-011): the name is shown in the dialog and can be changed there; the opened diagram and the saved list carry
// the new name, and a blank name cannot be confirmed.

const FIVE_NODES = [
  "flowchart TD",
  "  A[Start] --> B{Check}",
  "  B -->|yes| C[Work]",
  "  B -->|no| D[Skip]",
  "  C --> E[End]",
  "  D --> E",
].join("\n");

test("the name can be changed in the dialog and carries to the opened diagram and the saved list; blank cannot be imported", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  const dialog = importDialog(page);
  const name = dialog.getByRole("textbox", { name: "Diagram name" });
  await expect(name).not.toHaveValue("");

  await name.fill("");
  await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled();

  await name.fill("Renamed flow");
  await dialog.getByRole("button", { name: "Import" }).click();
  await expect(page).toHaveURL(/#\/d\/[^/]+$/);

  await page.goto("#/");
  await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("link", { name: "Renamed flow" })).toHaveCount(1);
});
