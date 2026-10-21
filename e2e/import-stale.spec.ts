import { expect, test, type Page } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// Import is offered only for a preview read from the text now in the paste area (feature 006, FR-003, FR-004). The
// preview is read after a 300 ms pause, so each check below is made well inside that pause.

const PAUSE_MS = 300;
const FLOWCHART = "flowchart TD\n  A[Alpha] --> B[Beta]";

for (const [what, emptied] of [
  ["emptied", ""],
  ["left holding only spaces", "   \n  "],
] as const) {
  // VO-005 (FR-003, US2-AS1, EC-02)
  test(`a paste area ${what} makes Import unavailable and removes the preview at once`, async ({ page }) => {
    await openImportWithPointer(page);
    const dialog = importDialog(page);
    await paste(page, FLOWCHART);
    await expect(dialog.getByRole("button", { name: "Import" })).toBeEnabled({ timeout: 10000 });
    await expect(dialog.getByTestId("picture-wrap")).toBeVisible();

    await paste(page, emptied);

    await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled({ timeout: PAUSE_MS / 2 });
    await expect(dialog.getByTestId("picture-wrap")).toBeHidden({ timeout: PAUSE_MS / 2 });
  });
}

/** True when a new diagram was opened within the time a wrongly accepted Import would take to open it. */
async function openedADiagram(page: Page): Promise<boolean> {
  return page.waitForURL(/#\/d\//, { timeout: PAUSE_MS * 3 }).then(
    () => true,
    () => false,
  );
}

/** Empties the paste area as one input event, so the next action follows with no pause in between. */
async function emptyAtOnce(page: Page): Promise<void> {
  await importDialog(page)
    .getByRole("textbox", { name: "Mermaid text" })
    .evaluate((area) => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(area, "");
      area.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

// VO-006 (FR-004, US2-AS2)
test("Import activated by pointer straight after the text is emptied creates no diagram", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await paste(page, FLOWCHART);
  const importButton = dialog.getByRole("button", { name: "Import" });
  await expect(importButton).toBeEnabled({ timeout: 10000 });

  await emptyAtOnce(page);
  await importButton.evaluate((button: HTMLButtonElement) => {
    button.click();
  });

  expect(await openedADiagram(page)).toBe(false);
  await expect(dialog).toBeVisible();
});

test("Import activated by keyboard straight after the text is emptied creates no diagram", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await paste(page, FLOWCHART);
  const importButton = dialog.getByRole("button", { name: "Import" });
  await expect(importButton).toBeEnabled({ timeout: 10000 });
  await importButton.focus();

  await emptyAtOnce(page);
  await page.keyboard.press("Enter");

  expect(await openedADiagram(page)).toBe(false);
  await expect(dialog).toBeVisible();
});

// VO-007 (FR-003, FR-004, US2-AS3, EC-01)
test("after the text changes from A to B, Import waits for B's preview and then creates B, never A", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  const importButton = dialog.getByRole("button", { name: "Import" });
  await paste(page, "flowchart TD\n  A1[Apple one] --> A2[Apple two]");
  await expect(importButton).toBeEnabled({ timeout: 10000 });

  await paste(page, "flowchart TD\n  B1[Berry one] --> B2[Berry two]");
  await expect(importButton).toBeDisabled({ timeout: PAUSE_MS / 2 });
  await expect(dialog.getByTestId("picture-wrap").getByText("Berry one")).toBeVisible({ timeout: 10000 });
  await expect(importButton).toBeEnabled();
  await importButton.click();

  await expect(page).toHaveURL(/#\/d\/[^/]+$/);
  await expect(page.getByText("Berry one").first()).toBeVisible();
  await expect(page.getByText("Berry two").first()).toBeVisible();
  await expect(page.getByText("Apple one")).toHaveCount(0);
  await expect(page.getByText("Apple two")).toHaveCount(0);
});
