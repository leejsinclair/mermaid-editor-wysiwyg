import { expect, test } from "@playwright/test";
import { savedRecord, seedRecords } from "./support/storage";

// VO-084 (FR-049): a file that is not a valid diagram file from this editor is refused with its explanation,
// nothing is opened, and the saved list is unchanged.

const refusals = [
  { file: "not-json", text: "This file is not a diagram file from this editor. Nothing was opened." },
  { file: "other-json", text: "This file is not a diagram file from this editor. Nothing was opened." },
  { file: "newer-version", text: "This file was saved by a newer version of the editor and cannot be opened here. Nothing was opened." },
  { file: "damaged", text: "This file is damaged:" },
  { file: "too-large", text: "This file is larger than 5 MB, so it is not a diagram file from this editor. Nothing was opened." },
];

for (const { file, text } of refusals) {
  test(`a ${file} file is refused with its explanation and nothing is opened`, async ({ page }) => {
    await page.goto("/");
    await seedRecords(page, [savedRecord("keep", "Keep me", "flowchart", "2026-01-01T00:00:00.000Z")]);
    await page.reload();
    const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
    await expect(items).toHaveCount(1);

    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Open file…" }).click();
    await (await chooser).setFiles(`e2e/fixtures/${file}.mermaid-editor.json`);

    await expect(page.getByRole("status", { name: "Messages" })).toContainText(text);
    await expect(page).toHaveURL(/\/$/);
    await page.reload();
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText("Keep me");
  });
}
