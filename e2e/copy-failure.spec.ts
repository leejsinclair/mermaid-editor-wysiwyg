import { expect, test, type Page } from "@playwright/test";

// VO-009 (EC-07): when the clipboard write is refused or unavailable, Copy Source explains the failure,
// shows no success, and leaves the diagram unchanged.

const broken = [
  [
    "refused",
    () => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new DOMException("Write denied", "NotAllowedError")) },
      });
    },
  ],
  [
    "unavailable",
    () => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    },
  ],
] as const;

async function withOneNode(page: Page) {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
}

for (const [name, breakClipboard] of broken) {
  test(`when the clipboard write is ${name}, Copy Source explains the failure and changes nothing`, async ({ page }) => {
    await page.addInitScript(breakClipboard);
    await withOneNode(page);
    const messages = page.getByRole("status", { name: "Messages" });

    await page.getByRole("button", { name: "Copy Source" }).click();

    await expect(messages).toContainText("could not be copied");
    await expect(messages).not.toContainText("Source copied");
    await expect(page.getByLabel("Rectangle node: Rectangle", { exact: true })).toHaveCount(1);
    await page.getByRole("button", { name: /Mermaid source/ }).click();
    await expect(page.getByRole("region", { name: /Mermaid source/ })).toHaveText(/^flowchart TD\s+n1\["Rectangle"\]$/);
  });
}
