import { expect, test, type Page } from "@playwright/test";
import { importDialog, openImportWithPointer, paste, START_BUTTON, TEXT_LABEL } from "./support/import";

// VO-044 (FR-013): an import is completed with the keyboard alone, in the order text area, Choose file…, report entries,
// Compare, name, Cancel, Import. Every control is named, focus starts in the text area, and Escape closes the dialog and
// returns focus to New from Mermaid….

const SUBGRAPH = ["flowchart TD", "  subgraph Group", "    A --> B", "  end"].join("\n");
const ORDER = ["Choose file…", "Compare", "Diagram name", "Cancel", "Import"];

/** The accessible name of the element that has focus: its aria-label, its label, or its text. */
async function focusedName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return "";
    const labelText = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? Array.from(element.labels ?? [], (label) => label.textContent).join(" ") : "";
    const ariaLabel = element.getAttribute("aria-label") ?? "";
    return (ariaLabel || labelText || element.textContent || "").trim();
  });
}

test("an import is completed with the keyboard alone, in order, and Escape returns focus to the start button", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await paste(page, SUBGRAPH);
  await expect(dialog.getByRole("region", { name: "Import report" })).toContainText("subgraph", { timeout: 1000 });
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toBeFocused();

  const visited: string[] = [];
  for (let step = 0; step < 40 && visited.at(-1) !== "Import"; step += 1) {
    await page.keyboard.press("Tab");
    visited.push(await focusedName(page));
  }
  expect(visited.every((name) => name !== "")).toBe(true);
  const positions = ORDER.map((name) => visited.indexOf(name));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect([...positions].sort((x, y) => x - y)).toEqual(positions);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: START_BUTTON })).toBeFocused();
});
