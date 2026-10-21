import { expect, test, type Locator } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// Selecting a report entry selects its line once; typing afterwards edits the text at the caret (feature 006, FR-005).

const WITH_TWO_ENTRIES = ["flowchart TD", "  subgraph Billing", "    A --> B", "  end", "  C --> A", "  classDef hot fill:#f96"].join("\n");

/** The text selected in the paste area. */
async function selectedText(area: Locator): Promise<string> {
  return area.evaluate((element) => {
    const textArea = element as HTMLTextAreaElement;
    return textArea.value.slice(textArea.selectionStart, textArea.selectionEnd);
  });
}

// VO-008 (FR-005, US2-AS4)
test("after a report entry is selected, typed characters go in at the caret and replace nothing", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, WITH_TWO_ENTRIES);
  const dialog = importDialog(page);
  const area = dialog.getByRole("textbox", { name: "Mermaid text" });
  await dialog.getByTestId("report-entry").first().click();
  await expect.poll(() => selectedText(area)).toContain("subgraph Billing");

  await area.click();
  await area.press("Control+End");
  const typed = "abcdefghijklmnopqrst";
  await page.keyboard.type(typed);

  await expect(area).toHaveValue(WITH_TWO_ENTRIES + typed);
});

// VO-009 (FR-005, US2-AS5)
test("after typing, selecting the same entry and then another highlights each line once", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, WITH_TWO_ENTRIES);
  const dialog = importDialog(page);
  const area = dialog.getByRole("textbox", { name: "Mermaid text" });
  const entries = dialog.getByTestId("report-entry");
  await entries.first().click();
  await area.click();
  await area.press("Control+End");
  await page.keyboard.type("xy");
  await expect(entries).toHaveCount(2);

  await entries.first().click();
  await expect.poll(() => selectedText(area)).toBe("  subgraph Billing");
  await entries.last().click();
  await expect.poll(() => selectedText(area)).toBe("  classDef hot fill:#f96xy");

  await area.press("ArrowRight");
  await page.keyboard.type("z");
  await expect(area).toHaveValue(`${WITH_TWO_ENTRIES}xyz`);
  expect(await selectedText(area)).toBe("");
});

// VO-010 (FR-005, EC-07)
test("selecting an entry whose line no longer exists does nothing and raises no error", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  await openImportWithPointer(page);
  await paste(page, WITH_TWO_ENTRIES);
  const dialog = importDialog(page);
  const area = dialog.getByRole("textbox", { name: "Mermaid text" });
  const lastEntry = dialog.getByTestId("report-entry").last();
  await expect(lastEntry).toContainText("line 6");
  const shortened = WITH_TWO_ENTRIES.split("\n").slice(0, 5).join("\n");

  // The last line is removed, the caret is put at the start, and the old entry is activated before the report is read again.
  await area.evaluate((element, next) => {
    const textArea = element as HTMLTextAreaElement;
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(textArea, next);
    textArea.dispatchEvent(new Event("input", { bubbles: true }));
    textArea.setSelectionRange(0, 0);
  }, shortened);
  await lastEntry.click();

  await expect(area).toHaveValue(shortened);
  const range = await area.evaluate((element) => [(element as HTMLTextAreaElement).selectionStart, (element as HTMLTextAreaElement).selectionEnd]);
  expect(range).toEqual([0, 0]);
  expect(errors).toEqual([]);
});
