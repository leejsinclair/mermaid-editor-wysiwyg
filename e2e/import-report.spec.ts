import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-021 (FR-007, US2-AS2): activating a report entry selects the matching line of the text in the paste area.

const WITH_SUBGRAPH = ["flowchart TD", "  subgraph Billing", "    A --> B", "  end", "  C --> A"].join("\n");

test("activating a report entry selects its line in the paste area", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, WITH_SUBGRAPH);
  const dialog = importDialog(page);
  const entry = dialog.getByTestId("report-entry").first();
  await expect(entry).toHaveAttribute("data-category", "dropped");

  await entry.click();

  const selected = await dialog.getByRole("textbox", { name: "Mermaid text" }).evaluate((element) => {
    const area = element as HTMLTextAreaElement;
    return area.value.slice(area.selectionStart, area.selectionEnd);
  });
  expect(selected).toContain("subgraph Billing");
});

// VO-022 (FR-007, US2-AS4): a document with nothing unsupported says so plainly, and the report can be hidden and shown.

const FIVE_NODES = ["flowchart TD", "  A[Start] --> B{Check}", "  B -->|yes| C[Work]", "  B -->|no| D[Skip]", "  C --> E[End]", "  D --> E"].join("\n");

test("a document with nothing unsupported says so, and the report can be hidden and shown again", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  const dialog = importDialog(page);
  const report = dialog.getByRole("region", { name: "Import report" });
  await expect(report).toContainText("Nothing was dropped or approximated");

  await dialog.getByRole("button", { name: "Hide report" }).click();
  await expect(report).toHaveCount(0);

  await dialog.getByRole("button", { name: "Show report" }).click();
  await expect(dialog.getByRole("region", { name: "Import report" })).toContainText("Nothing was dropped or approximated");
});

// VO-023 (FR-013, US2-AS5): after each of two edits the number of report entries is announced in a polite status region,
// and focus stays in the text where it was.

const WITH_TWO_UNSUPPORTED = [
  "flowchart TD",
  "  subgraph Billing",
  "    A --> B",
  "  end",
  "  classDef hot fill:#f96",
  "  C --> A",
].join("\n");

test("after each edit the report count is announced politely and focus stays in the text", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  const text = dialog.getByRole("textbox", { name: "Mermaid text" });
  const status = dialog.getByRole("status", { name: "Import status" });

  await paste(page, WITH_TWO_UNSUPPORTED);
  await expect(status).toContainText("2 dropped");
  await expect(text).toBeFocused();

  await paste(page, `${WITH_TWO_UNSUPPORTED}\n  style A fill:#0f0`);
  await expect(status).toContainText("3 dropped");
  await expect(text).toBeFocused();
});

// VO-024 (FR-006): with dropped and approximated constructs Import stays enabled, and its accessible description states the
// counts; hiding the report leaves the description as it was.

const DROPPED_AND_APPROXIMATED = ["flowchart TD", "  subgraph Billing", "    A(((Double)))", "  end", "  classDef hot fill:#f96", "  C --> A"].join("\n");

test("Import stays enabled with dropped and approximated constructs and says the counts in its description", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, DROPPED_AND_APPROXIMATED);
  const dialog = importDialog(page);
  const confirm = dialog.getByRole("button", { name: "Import" });

  await expect(confirm).toBeEnabled();
  await expect(confirm).toHaveAccessibleDescription(/2 dropped/);
  await expect(confirm).toHaveAccessibleDescription(/1 approximated/);
  const before = await confirm.evaluate((element) => element.getAttribute("aria-describedby"));

  await dialog.getByRole("button", { name: "Hide report" }).click();
  await expect(confirm).toHaveAccessibleDescription(/2 dropped/);
  expect(await confirm.evaluate((element) => element.getAttribute("aria-describedby"))).toBe(before);
});

// VO-016 (FR-008, US4-AS1): an approximated entry ends by saying what the construct became, in its visible text and so
// in its accessible name (feature 006).

const ASYMMETRIC_ON_LINE_7 = ["flowchart TD", "  A --> B", "  B --> C", "  C --> D", "  D --> E", "  E --> F", "  F>Flag]"].join("\n");

test("an approximated entry names the construct, its reason and ends with what it was kept as", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, ASYMMETRIC_ON_LINE_7);
  const entry = importDialog(page).getByTestId("report-entry").filter({ hasText: "line 7" });
  await expect(entry).toHaveCount(1);
  await expect(entry).toHaveAccessibleName(/^line 7: asymmetric shape .*\. Kept as a rectangle\.$/);
});
