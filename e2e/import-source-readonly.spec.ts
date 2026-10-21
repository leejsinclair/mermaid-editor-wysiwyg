import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";
import { sourceOf } from "./support/items";

// VO-047 (FR-015): after an import, the source panel offers no editing: it has no text field and no editable content, and
// typing into it changes nothing. Nothing outside the start dialog accepts Mermaid text.

const VALID = ["flowchart TD", "  A[Start] --> B[End]"].join("\n");

test("the imported diagram's source panel offers no editing", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, VALID);
  const dialog = importDialog(page);
  await expect(dialog.getByRole("button", { name: "Import" })).toBeEnabled({ timeout: 1000 });
  await dialog.getByRole("button", { name: "Import" }).click();
  await expect(page).toHaveURL(/#\/d\//);

  const before = await sourceOf(page);
  expect(before).toContain("flowchart");
  const panel = page.getByRole("region", { name: "Mermaid source" });
  await expect(panel.getByRole("textbox")).toHaveCount(0);
  await expect(page.locator('textarea, [contenteditable="true"]')).toHaveCount(0);

  await panel.click();
  await page.keyboard.type("Z");
  expect(await sourceOf(page)).toBe(before);
});
