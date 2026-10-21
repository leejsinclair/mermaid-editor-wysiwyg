import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-026 (FR-008): after an import the developer's moves are kept: after a reload and a reopen the nodes are where they
// were left, and adding a node does not arrange the others again.

const FIVE_NODES = [
  "flowchart TD",
  "  A[Start] --> B{Check}",
  "  B -->|yes| C[Work]",
  "  B -->|no| D[Skip]",
  "  C --> E[End]",
  "  D --> E",
].join("\n");

test("moved nodes keep their place after an added node, a reload and a reopen", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, FIVE_NODES);
  await expect(importDialog(page).getByTestId("detected-type")).toBeVisible();
  await importDialog(page).getByRole("button", { name: "Import" }).click();
  await expect(page).toHaveURL(/#\/d\/[^/]+$/);

  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const start = canvas.locator(".react-flow__node", { hasText: "Start" });
  const before = await start.boundingBox();
  if (before === null) throw new Error("the Start node is not drawn");
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width / 2 + 120, before.y + before.height / 2 + 40, { steps: 8 });
  await page.mouse.up();
  const moved = await start.boundingBox();
  if (moved === null) throw new Error("the moved Start node is not drawn");
  // The drag must really have moved the node, or the test below would prove nothing.
  expect(Math.abs(moved.x - before.x)).toBeGreaterThan(50);

  await addShape(page, canvas, "Rectangle", { x: 600, y: 80 });
  await expect(canvas.locator(".react-flow__node")).toHaveCount(6);

  await page.reload();
  const reloaded = page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node", { hasText: "Start" });
  const afterReload = await reloaded.boundingBox();
  expect(afterReload?.x).toBeCloseTo(moved.x, 0);
  expect(afterReload?.y).toBeCloseTo(moved.y, 0);

  await page.goto("#/");
  await page.getByRole("region", { name: "Saved diagrams" }).getByRole("link").first().click();
  const reopened = page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node", { hasText: "Start" });
  const afterReopen = await reopened.boundingBox();
  expect(afterReopen?.x).toBeCloseTo(moved.x, 0);
  expect(afterReopen?.y).toBeCloseTo(moved.y, 0);
});
