import { expect, test } from "@playwright/test";

// VO-042 (FR-026): when the browser refuses to keep the appearance for the next visit, choosing the other appearance still changes
// it for the session and a notice says the choice could not be saved for next time; when it can be kept, there is no notice.

const NOTICE = "Your appearance choice could not be saved for next time.";

test("with storage refusing the choice, the appearance changes and a notice says it was not kept", async ({ page }) => {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- the original is called back with the storage as `this` below
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key === "mermaid-editor.appearance") throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.goto("#/new/flowchart");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.getByRole("status", { name: "Messages" })).toContainText(NOTICE);
});

test("with storage keeping the choice, no notice appears", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.getByRole("status", { name: "Messages" })).toHaveText("");
});
