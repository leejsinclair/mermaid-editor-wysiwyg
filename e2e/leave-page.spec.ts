import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { breakStorageOpen, delayStorageCompletion, fillStorage } from "./support/storage";

// VO-065 (FR-044): closing, reloading or leaving asks for confirmation while saving has failed, while storage is
// unavailable, while a save is in flight and while a label edit is open; while everything is saved it does not.

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const saveStatus = (page: Page) => page.getByRole("status", { name: "Save status" });

/** Fires the browser's own leave-page event and says whether the page asked to stop it. */
async function asksBeforeLeaving(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
}

async function addOneNode(page: Page): Promise<void> {
  await addShape(page, canvas(page), "Rectangle", { x: 200, y: 100 });
  await expect(canvas(page).locator(".react-flow__node")).toHaveCount(1);
}

test("a diagram with nothing changed and a diagram that is saved do not ask", async ({ page }) => {
  await page.goto("#/new/flowchart");
  expect(await asksBeforeLeaving(page)).toBe(false);

  await addOneNode(page);
  await expect(saveStatus(page)).toHaveText("Saved");

  expect(await asksBeforeLeaving(page)).toBe(false);
});

test("when saving has failed it asks", async ({ page }) => {
  await fillStorage(page);
  await page.goto("#/new/flowchart");

  await addOneNode(page);

  await expect(saveStatus(page)).toHaveText("Not saved. Save a file to keep a copy.");
  expect(await asksBeforeLeaving(page)).toBe(true);
});

test("when storage is unavailable it asks", async ({ page }) => {
  await breakStorageOpen(page);
  await page.goto("#/new/flowchart");

  await addOneNode(page);

  await expect(saveStatus(page)).toHaveText("Browser storage is unavailable. Save a file to keep a copy.");
  expect(await asksBeforeLeaving(page)).toBe(true);
});

test("while a save is still in flight it asks, and once saved it stops asking", async ({ page }) => {
  await delayStorageCompletion(page);
  await page.goto("#/new/flowchart");
  await page.evaluate(() => {
    (window as unknown as { __idbDelay: number }).__idbDelay = 1500;
  });

  await addOneNode(page);

  await expect(saveStatus(page)).toHaveText("Saving…");
  expect(await asksBeforeLeaving(page)).toBe(true);
  await expect(saveStatus(page)).toHaveText("Saved");
  expect(await asksBeforeLeaving(page)).toBe(false);
});

test("while a label edit is open it asks, and once the edit is cancelled it stops asking", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await addOneNode(page);
  await expect(saveStatus(page)).toHaveText("Saved");
  await canvas(page).locator(".react-flow__node").first().click();
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });

  await label.fill("Half typed");

  expect(await asksBeforeLeaving(page)).toBe(true);
  await label.press("Escape");
  expect(await asksBeforeLeaving(page)).toBe(false);
});

test("closing the tab shows the browser's own confirmation while saving has failed", async ({ page }) => {
  await fillStorage(page);
  await page.goto("#/new/flowchart");
  await addOneNode(page);
  await expect(saveStatus(page)).toHaveText("Not saved. Save a file to keep a copy.");
  const prompt = new Promise<string>((resolve) => {
    page.on("dialog", (dialog) => {
      resolve(dialog.type());
      void dialog.dismiss();
    });
  });

  await page.close({ runBeforeUnload: true });

  expect(await prompt).toBe("beforeunload");
});
