import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-051 (EC-09, SC-005): when a second text is pasted while the first is still waiting to be read, only the second text's
// picture and report are ever shown. The first text's report entry never appears.

const FIRST = ["flowchart TD", "  subgraph Group", "    A --> B", "  end"].join("\n");
const SECOND = ["flowchart LR", "  C --> D"].join("\n");

test("a text pasted over a pending one replaces it: only the later text's report is shown", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  const report = dialog.getByRole("region", { name: "Import report" });

  await paste(page, FIRST);
  await paste(page, SECOND);

  await expect(report).toContainText("Nothing was dropped or approximated", { timeout: 1000 });
  await expect(report).not.toContainText("subgraph");
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 1000 });
});

// VO-051 (SC-005, contracts/import-dialog.md, "Checking"): while a text is still being read, the status says "Checking…", the
// previous picture is dimmed, and typing is not blocked.
test("while a text is being checked the status says so, the previous picture is dimmed and typing is not blocked", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  // The first picture is set-up: Mermaid loads on first use, which can exceed the one-second budget under parallel load.
  await paste(page, SECOND);
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 10000 });

  await paste(page, FIRST);
  await expect(dialog.getByRole("status", { name: "Import status" })).toHaveText("Checking…", { timeout: 1000 });
  await expect(dialog.getByTestId("picture-wrap")).toHaveCSS("opacity", "0.5");
  await paste(page, SECOND);
  await expect(dialog.getByRole("textbox", { name: "Mermaid text" })).toHaveValue(SECOND);
});
