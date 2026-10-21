import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste, TEXT_LABEL } from "./support/import";

// VO-050 (EC-07, SC-005, Chromium): a 100-node document shows its picture within one second, and typing into a 500-node
// document delays no keystroke by more than 100 ms, measured from each input event to the next painted frame. Both
// browsers run it: the budget must hold in each.

/** A flowchart of `count` nodes in a chain, one per line. */
function chain(count: number): string {
  const lines = ["flowchart LR"];
  for (let index = 1; index < count; index += 1) lines.push(`  n${String(index)}[Node ${String(index)}] --> n${String(index + 1)}[Node ${String(index + 1)}]`);
  return lines.join("\n");
}

test("a 100-node document shows its picture within one second", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  // The first picture of a session also loads Mermaid, which is not the budget (SC-005 is about use once the editor is
  // ready): a small document is drawn first, then the 100-node document is timed.
  await paste(page, "flowchart TD\n  A --> B");
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 10000 });
  await paste(page, chain(100));
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 1000 });
});

test("typing into a 500-node document delays no keystroke by more than 100 ms", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, chain(500));
  const dialog = importDialog(page);
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg").first()).toBeVisible({ timeout: 20000 });

  const area = dialog.getByRole("textbox", { name: TEXT_LABEL });
  await area.evaluate((element) => {
    const latencies: number[] = [];
    (window as unknown as { latencies: number[] }).latencies = latencies;
    element.addEventListener("input", () => {
      const started = performance.now();
      requestAnimationFrame(() => {
        latencies.push(performance.now() - started);
      });
    });
  });
  await area.click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type("x".repeat(20));
  await page.waitForFunction(() => (window as unknown as { latencies: number[] }).latencies.length >= 20);
  const latencies = await page.evaluate(() => (window as unknown as { latencies: number[] }).latencies);
  expect(Math.max(...latencies)).toBeLessThanOrEqual(100);
});
