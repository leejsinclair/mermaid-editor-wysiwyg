import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { fillStorage } from "./support/storage";

// VO-070 (FR-020): rejections, copy results, file results and save status changes are each announced through a live
// region or status without moving focus, and failures are announced.

const messages = (page: Page) => page.getByRole("status", { name: "Messages" });

async function expectAnnouncedWithoutMovingFocus(page: Page, region: Locator, text: string | RegExp, act: () => Promise<void>) {
  // The control that has focus, held by identity: its text may change as the announcement is made.
  const before = await page.evaluateHandle(() => document.activeElement);
  await act();
  await expect(region).toContainText(text);
  expect(await page.evaluate((element) => element === document.activeElement, before)).toBe(true);
}

test("every announcing region is a polite live region that is present from the start", async ({ page }) => {
  await page.goto("/new/flowchart");

  await expect(messages(page)).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("status", { name: "Save status" })).toBeVisible();
  await page.goto("/");
  await expect(messages(page)).toHaveAttribute("aria-live", "polite");
});

test("a rejection, the copy results and the file result are announced without moving focus", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");

  await canvas.locator(".react-flow__node").first().click();
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await label.fill("   ");
  await expectAnnouncedWithoutMovingFocus(page, messages(page), "A label needs at least one visible character.", () => label.press("Enter"));

  const copy = page.getByRole("button", { name: "Copy Source" });
  await copy.focus();
  await expectAnnouncedWithoutMovingFocus(page, messages(page), "Source copied.", () => copy.press("Enter"));

  const markdown = page.getByRole("button", { name: "Copy for Markdown" });
  await markdown.focus();
  await expectAnnouncedWithoutMovingFocus(page, messages(page), "Source copied for Markdown.", () => markdown.press("Enter"));

  const save = page.getByRole("button", { name: "Save file" });
  await save.focus();
  await expectAnnouncedWithoutMovingFocus(page, messages(page), "The file was offered for download.", () => save.press("Enter"));
});

test("a failed copy and a refused file are announced as failures without moving focus", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await page.goto("/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  const copy = page.getByRole("button", { name: "Copy Source" });
  await copy.focus();

  await expectAnnouncedWithoutMovingFocus(page, messages(page), "The source could not be copied", () => copy.press("Enter"));
  await expect(messages(page).getByRole("presentation")).toBeVisible();

  await page.goto("/");
  const chooser = page.waitForEvent("filechooser");
  const open = page.getByRole("button", { name: "Open file…" });
  await open.focus();
  await open.press("Enter");
  await (await chooser).setFiles("e2e/fixtures/not-json.mermaid-editor.json");
  await expect(messages(page)).toContainText("Nothing was opened.");
  await expect(open).toBeFocused();
});

test("save status changes are announced in the Save status region, failures included", async ({ page }) => {
  await page.goto("/new/flowchart");
  const status = page.getByRole("status", { name: "Save status" });
  await expect(status).toHaveText("Not saved yet");

  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(status).toHaveText("Saved");

  const failing = await page.context().newPage();
  await fillStorage(failing);
  await failing.goto("/new/flowchart");
  await addShape(failing, failing.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(failing.getByRole("status", { name: "Save status" })).toHaveText("Not saved. Save a file to keep a copy.");
});
