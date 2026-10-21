import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-029 (FR-010, US4-AS1): with a valid document, the Compare toggle opens the region "Compare original with generated"
// with both texts side by side. Each differing line carries a text marker, data-change and a style, not colour alone.

// Indented differently from the text the editor generates, so the comparison has differing lines.
const INDENTED = ["flowchart TD", "        A[Start] --> B[End]"].join("\n");

test("Compare shows both texts side by side, with each differing line marked as text and by data-change", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, INDENTED);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  await dialog.getByRole("button", { name: "Compare" }).click();
  const compare = dialog.getByRole("region", { name: "Compare original with generated" });
  await expect(compare).toBeVisible();
  await expect(compare).toContainText("A[Start] --> B[End]");
  const changed = compare.locator('[data-change="changed"]').first();
  await expect(changed).toBeVisible();
  await expect(changed).toContainText("~");
});

// VO-030 (US4-AS2): a document already in the editor's normal form is compared, and the view says so.
const NORMAL_FORM = ["flowchart TD", '  n1["Start"]', '  n2["End"]', "  n1 --> n2"].join("\n");

test("a document already in the editor's normal form says so in the compare view", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, NORMAL_FORM);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  await dialog.getByRole("button", { name: "Compare" }).click();
  await expect(dialog.getByRole("region", { name: "Compare original with generated" })).toContainText("The original already matches the generated text.", { timeout: 1000 });
});

// VO-031 (US4-AS3): a document with a dropped construct is compared, and the construct's original lines show as removed.
const WITH_SUBGRAPH = ["flowchart TD", "  subgraph Group", "    A --> B", "  end"].join("\n");

test("a dropped construct's original lines show as removed in the compare view", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, WITH_SUBGRAPH);
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  await dialog.getByRole("button", { name: "Compare" }).click();
  const compare = dialog.getByRole("region", { name: "Compare original with generated" });
  await expect(compare.locator('[data-change="removed"]').filter({ hasText: "subgraph Group" })).toBeVisible({ timeout: 1000 });
});

// VO-022 (FR-010, US5-AS2): a document whose generated text differs on nearly every line passes the work limit; the
// compare view still shows both texts and says the marking was simplified (feature 006).
test("a document too different from its generated text to compare exactly says the marking was simplified", async ({ page }) => {
  // Unlinked nodes keep under Mermaid's edge limit; each line differs from the generated `n1["Node 1"]` form.
  const lines = ["flowchart TD", ...Array.from({ length: 2100 }, (_, index) => `n${String(index + 1)}[Node ${String(index + 1)}]`)];
  await openImportWithPointer(page);
  await paste(page, lines.join("\n"));
  const dialog = importDialog(page);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 20000 });

  await dialog.getByRole("button", { name: "Compare" }).click();
  const compare = dialog.getByRole("region", { name: "Compare original with generated" });
  await expect(compare).toContainText("shown in simple form because the texts are very large");
  await expect(compare).toContainText("n1[Node 1]");
  await expect(compare.locator('[data-change="changed"]').first()).toBeVisible();
});
