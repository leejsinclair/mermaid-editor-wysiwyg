import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-043 (FR-013, SC-007): the New from Mermaid dialog, empty, with a preview, with an error, with a report and with the
// compare view open, has no WCAG 2.2 AA violations (the same checks as e2e/wcag.spec.ts).

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const VALID = ["flowchart TD", "  A[Start] --> B[End]"].join("\n");
const SUBGRAPH = ["flowchart TD", "  subgraph Group", "    A --> B", "  end"].join("\n");
const UNCLOSED = ["flowchart TD", "  A[Start", "  A --> B"].join("\n");

async function expectNoViolations(page: Page): Promise<void> {
  // A fading dialog or a button changing colour is mid-transition and would be measured at colours it does not rest at.
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running" || animation.effect?.getComputedTiming().iterations === Infinity));
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
}

test("the dialog has no violations when empty, with a preview, with an error, with a report and with the compare view", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await expectNoViolations(page);

  await paste(page, VALID);
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 1000 });
  await expectNoViolations(page);

  await paste(page, UNCLOSED);
  await expect(dialog.getByText("error here")).toBeVisible({ timeout: 1000 });
  await expectNoViolations(page);

  await paste(page, SUBGRAPH);
  await expect(dialog.getByRole("region", { name: "Import report" })).toContainText("subgraph", { timeout: 1000 });
  await expectNoViolations(page);

  await dialog.getByRole("button", { name: "Compare" }).click();
  await expect(dialog.getByRole("region", { name: "Compare original with generated" })).toBeVisible();
  await expectNoViolations(page);
});
