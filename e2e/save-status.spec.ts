import { expect, test } from "@playwright/test";
import { delayStorageCompletion, setStorageDelay } from "./support/storage";
import { addShape } from "./support/flowchart";

// VO-073 (FR-042, FR-043): after a committed change, an Undo and a Redo, "Saved" is shown only after each write has
// succeeded, and within a second of the change.

test("Saved is shown within a second of a change, an Undo and a Redo", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const status = page.getByRole("status", { name: "Save status" });
  await expect(status).toHaveText("Not saved yet");

  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await expect(status).toHaveText("Saved", { timeout: 1000 });

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(status).toHaveText("Saved", { timeout: 1000 });

  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(status).toHaveText("Saved", { timeout: 1000 });
});

test("Saved appears only after the write has completed; until then the status says Saving", async ({ page }) => {
  await delayStorageCompletion(page);
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const status = page.getByRole("status", { name: "Save status" });
  await setStorageDelay(page, 1500);

  const started = Date.now();
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await expect(status).toHaveText("Saving…");
  await expect(status).toHaveText("Saved", { timeout: 4000 });
  expect(Date.now() - started).toBeGreaterThanOrEqual(1400);

  // Two writes in a row: the status stays Saving until the latest one completes.
  await setStorageDelay(page, 1200);
  const second = Date.now();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(status).toHaveText("Saving…");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(status).toHaveText("Saving…");
  await expect(status).toHaveText("Saved", { timeout: 5000 });
  expect(Date.now() - second).toBeGreaterThanOrEqual(1100);
});
