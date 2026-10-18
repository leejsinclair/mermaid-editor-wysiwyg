import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";

// VO-014: Copy for Markdown puts the source inside a mermaid code fence on the clipboard, shows success only
// after the copy, and explains a refusal without claiming success.

async function withOneNode(page: Page) {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
}

test("Copy for Markdown leaves the source inside a mermaid code fence on the clipboard", async ({ page }) => {
  await withOneNode(page);

  await page.getByRole("button", { name: "Copy for Markdown" }).click();

  await expect(page.getByRole("status", { name: "Messages" })).toContainText("copied for Markdown");
  expect(await readClipboard(page)).toBe('```mermaid\nflowchart TD\n  n1["Rectangle"]\n```');
});

test("with the clipboard refused, Copy for Markdown explains the failure and shows no success", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException("Write denied", "NotAllowedError")) },
    });
  });
  await withOneNode(page);
  const messages = page.getByRole("status", { name: "Messages" });

  await page.getByRole("button", { name: "Copy for Markdown" }).click();

  await expect(messages).toContainText("could not be copied");
  await expect(messages).not.toContainText("copied for Markdown");
});
