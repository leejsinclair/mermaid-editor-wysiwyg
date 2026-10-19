import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { savedRecord, seedRecords } from "./support/storage";

// VO-079 (FR-046, EC-13): deleting a saved diagram and confirming removes only it, permanently; cancelling keeps it;
// for a diagram open in another tab, Delete is not offered and "Open in another tab" is shown.

const records = () => [
  savedRecord("keep", "Keep me", "flowchart", "2026-05-01T00:00:00.000Z"),
  savedRecord("drop", "Drop me", "sequence", "2026-04-01T00:00:00.000Z"),
];

test("confirming Delete removes only that diagram, permanently", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, records());
  await page.reload();
  const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
  await expect(items).toHaveCount(2);

  await items.filter({ hasText: "Drop me" }).getByRole("button", { name: "Delete…" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete diagram?" });
  await expect(dialog).toContainText("Drop me");
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(dialog).toHaveCount(0);
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Keep me");
  await page.reload();
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Keep me");
});

test("cancelling keeps the diagram", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, records());
  await page.reload();
  const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");

  await items.filter({ hasText: "Drop me" }).getByRole("button", { name: "Delete…" }).click();
  await page.getByRole("dialog", { name: "Delete diagram?" }).getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByRole("dialog", { name: "Delete diagram?" })).toHaveCount(0);
  await expect(items).toHaveCount(2);
});

test("a diagram open in another tab cannot be deleted; the list says it is open there", async ({ page, context }) => {
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");

  const other = await context.newPage();
  await other.goto("#/");

  const row = other.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem").filter({ hasText: "Untitled flowchart" });
  await expect(row).toContainText("Open in another tab");
  await expect(row.getByRole("button", { name: "Delete…" })).toHaveCount(0);

  // Once the editing tab is closed the lock is released and Delete is offered.
  await page.close();
  await expect(async () => {
    await other.reload();
    await expect(row).toBeVisible();
    await expect(row.getByRole("button", { name: "Delete…" })).toHaveCount(1, { timeout: 1000 });
  }).toPass({ timeout: 15000 });
});
