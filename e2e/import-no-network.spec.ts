import { expect, test } from "@playwright/test";
import { importDialog, paste, START_BUTTON } from "./support/import";

// VO-045 (FR-014, EC-12): a document with a link, a click handler and HTML in a label is imported while every request but
// the app's own files is blocked. No other request is made, nothing is followed or run, and each such construct is shown as
// text, not as markup.

const RISKY = [
  "flowchart LR",
  '  A["<a href=\'https://example.com/x\'>Go</a> now"] --> B["<img src=x onerror=alert(1)>"]',
  '  click A "https://example.com/click" "tip"',
].join("\n");

test("a document with a link, a click handler and HTML makes no request, runs nothing and shows its constructs as text", async ({ page }) => {
  const external: string[] = [];
  let dialogs = 0;
  page.on("dialog", (dialog) => {
    dialogs += 1;
    void dialog.dismiss();
  });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      void route.continue();
    } else {
      external.push(url.href);
      void route.abort();
    }
  });

  await page.goto("#/");
  await page.getByRole("button", { name: START_BUTTON }).click();
  const dialog = importDialog(page);
  await paste(page, RISKY);
  await expect(dialog.getByRole("region", { name: "Import report" })).toContainText("click", { timeout: 1000 });

  const preview = dialog.getByRole("region", { name: "Preview" });
  await expect(preview.locator("img, svg")).toHaveCount(1, { timeout: 1000 });
  await expect(preview.locator("a, script, img[onerror]")).toHaveCount(0);
  expect(external).toEqual([]);
  expect(dialogs).toBe(0);
});
