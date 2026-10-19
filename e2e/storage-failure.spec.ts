import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { breakStorageOpen, fillStorage, recordSaveStatuses, savedRecord, savedStatuses, seedRecords } from "./support/storage";

// VO-085 (FR-045, EC-12): with storage full or unavailable, editing continues, the status says the diagram is not
// saved and suggests saving a file, "Saved" is never shown, and diagrams saved earlier open unchanged.

const NOT_SAVED = "Not saved. Save a file to keep a copy.";
const UNAVAILABLE = "Browser storage is unavailable. Save a file to keep a copy.";

test("with storage full, editing continues, the status says not saved and Saved is never shown", async ({ page }) => {
  await recordSaveStatuses(page);
  await fillStorage(page);
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });

  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 400, y: 200 });

  await expect(page.getByRole("status", { name: "Save status" })).toHaveText(NOT_SAVED);
  await expect(canvas.locator(".react-flow__node")).toHaveCount(2);
  expect(await savedStatuses(page)).not.toContain("Saved");
});

test("with storage unavailable, editing continues and the status says storage is unavailable", async ({ page }) => {
  await recordSaveStatuses(page);
  await breakStorageOpen(page);
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });

  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });

  await expect(page.getByRole("status", { name: "Save status" })).toHaveText(UNAVAILABLE);
  await expect(canvas.locator(".react-flow__node")).toHaveCount(1);
  expect(await savedStatuses(page)).not.toContain("Saved");
});

test("diagrams saved earlier open unchanged after a failed save", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [savedRecord("early", "Saved earlier", "flowchart", "2026-01-01T00:00:00.000Z")]);
  await fillStorage(page);
  await page.goto("#/new/flowchart");
  await page.reload();
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText(NOT_SAVED);

  await page.goto("#/d/early");
  await page.reload();

  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  await expect(page.getByText("Saved earlier")).toBeVisible();
  await expect(page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node")).toHaveCount(0);
});
