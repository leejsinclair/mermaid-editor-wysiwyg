import type { Page } from "@playwright/test";

/** Reads the clipboard by pasting into a scratch text field; works in Chromium and Firefox (research R14). */
export async function readClipboard(page: Page): Promise<string> {
  await page.evaluate(() => {
    const field = document.createElement("textarea");
    field.id = "scratch-clipboard-field";
    document.body.append(field);
    field.focus();
  });
  await page.keyboard.press("ControlOrMeta+V");
  const text = await page.locator("#scratch-clipboard-field").inputValue();
  await page.evaluate(() => {
    document.querySelector("#scratch-clipboard-field")?.remove();
  });
  return text;
}
