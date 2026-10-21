import { expect, test, type Page } from "@playwright/test";
import { importDialog, START_BUTTON } from "./support/import";

// VO-039 (FR-012, EC-02): a Markdown file with two mermaid blocks is dropped; only the first block is imported, and the
// report lists the second as ignored, with its starting line and its first line.

const MARKDOWN = [
  "# Notes",
  "",
  "```mermaid",
  "flowchart TD",
  "  A --> B",
  "```",
  "",
  "```mermaid",
  "flowchart LR",
  "  C --> D",
  "```",
  "",
].join("\n");

async function dropFile(page: Page, name: string, content: string): Promise<void> {
  const dataTransfer = await page.evaluateHandle(
    ({ fileName, fileContent }) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([fileContent], fileName, { type: "text/plain" }));
      return transfer;
    },
    { fileName: name, fileContent: content },
  );
  await page.getByRole("button", { name: START_BUTTON }).dispatchEvent("drop", { dataTransfer });
}

test("a dropped Markdown file imports its first Mermaid block and reports the second as ignored", async ({ page }) => {
  await page.goto("#/");
  await dropFile(page, "notes.md", MARKDOWN);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  const ignored = dialog.locator('[data-testid="report-entry"][data-category="ignored"]');
  await expect(ignored).toHaveCount(1, { timeout: 1000 });
  await expect(ignored).toContainText("flowchart LR");
  await expect(ignored).toContainText("line 8:");
});
