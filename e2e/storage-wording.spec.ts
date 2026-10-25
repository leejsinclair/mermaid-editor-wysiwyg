import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { fillStorage } from "./support/storage";

// VO-017, VO-018, VO-033, VO-044 (FR-026 to FR-031, EC-04): a failed save shows a visible not-saved message that stays
// after the preview; "Save file" names only the file action; validity is a status of its own, apart from the save status.

const FAILED = "The diagram was not saved.";
const STATUS = "Save status";

test("a failed save shows a visible message that the diagram was not saved", async ({ page }) => {
  await fillStorage(page);
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });

  await expect(page.getByText(FAILED)).toBeVisible();
  await expect(page.getByRole("status", { name: STATUS })).not.toHaveText("Saved");
});

test("a successful save shows no failure message", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });

  await expect(page.getByRole("status", { name: STATUS })).toHaveText("Saved");
  await expect(page.getByText(FAILED)).toHaveCount(0);
});

test("Save file names only the file action and Copy only the clipboard actions", async ({ page }) => {
  await fillStorage(page);
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });

  await expect(page.getByRole("button", { name: /Save file/ })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Copy/ })).toHaveCount(2);
  await expect(page.getByRole("button", { name: /Copy.*Save file|Save file.*Copy/ })).toHaveCount(0);
  await expect(page.getByRole("status", { name: STATUS })).not.toContainText("Save file");
  await expect(page.getByText(FAILED)).toBeVisible();
});

test("validity is shown as its own status, apart from the save status", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });

  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  const save = page.getByRole("status", { name: STATUS });
  await expect(save).toHaveText("Saved");
  await expect(save).not.toContainText(/valid/i);
});

test("a save that fails while the preview is open is still not saved on return to editing", async ({ page }) => {
  await fillStorage(page);
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  const toggle = page.getByRole("button", { name: "Preview as Mermaid draws it" });

  await toggle.click();
  await expect(page.getByRole("region", { name: "Preview as Mermaid draws it" })).toBeVisible();
  await toggle.click();

  await expect(page.getByText(FAILED)).toBeVisible();
  await expect(page.getByRole("status", { name: STATUS })).not.toHaveText("Saved");
});
