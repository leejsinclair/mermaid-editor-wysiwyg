import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { openEditor, openItem, openPair, panelLabel, VIEWS } from "./support/items";

// VO-045 (FR-001, EC-04): zooming and panning, even until the label is off screen, keeps the editor open on its label with
// its text. VO-046 (FR-004, EC-05): another tab taking over editing drops the edit and commits nothing. VO-047 (FR-002,
// EC-06): reloading with uncommitted editor text asks for confirmation.

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });

/** Fires the browser's own leave-page event and says whether the page asked to stop it. */
async function asksBeforeLeaving(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
}

for (const view of VIEWS) {
  test(`in a ${view} diagram, zooming and panning keep the editor open with its text, even with the label off screen`, async ({ page }) => {
    const [first] = await openPair(page, view);
    const editor = await openEditor(first);
    await editor.fill("still here");

    for (let step = 0; step < 3; step += 1) await toolbar(page).getByRole("button", { name: "Zoom in" }).click();
    await expect(editor).toBeVisible();
    await expect(editor).toHaveValue("still here");
    const item = await first.item.boundingBox();
    const box = await editor.boundingBox();
    if (!item || !box) throw new Error("The item and the editor must be visible");
    expect(box.x + box.width / 2).toBeGreaterThanOrEqual(item.x);
    expect(box.x + box.width / 2).toBeLessThanOrEqual(item.x + item.width);

    // Pan until the label is off screen: the wheel zooms a flowchart about the pointer and scrolls the other views.
    const area = await canvas(page).boundingBox();
    if (!area) throw new Error("The canvas must be visible");
    await page.mouse.move(area.x + 6, area.y + area.height - 6);
    for (let step = 0; step < 6; step += 1) await page.mouse.wheel(view === "flowchart" ? 0 : 400, view === "flowchart" ? -400 : 400);
    await expect(editor).toHaveCount(1);
    await expect(editor).toHaveValue("still here");

    await toolbar(page).getByRole("button", { name: "Fit to view" }).click();
    await expect(editor).toBeVisible();
    await expect(editor).toHaveValue("still here");
  });
}

test("another tab taking over editing drops the open label edit and commits nothing", async ({ page, context }) => {
  await page.goto("#/new/flowchart");
  await addShape(page, canvas(page), "Rectangle", { x: 200, y: 100 });
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  const address = page.url();
  await canvas(page).getByTestId("node-label").dblclick();
  const editor = page.getByTestId("inline-label-editor");
  await editor.fill("Unconfirmed words");

  const second = await context.newPage();
  await second.goto(address);
  await second.getByRole("dialog", { name: "Open in another tab" }).getByRole("button", { name: "Edit here instead" }).click();

  await expect(page.getByRole("dialog", { name: "Editing moved to another tab" })).toBeVisible();
  await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
  await expect(second.getByRole("region", { name: "Diagram canvas" }).getByTestId("node-label")).toHaveText("Rectangle");
  await page.getByRole("dialog", { name: "Editing moved to another tab" }).getByRole("button", { name: "Take it back" }).click();
  await expect(canvas(page).getByTestId("node-label")).toHaveText("Rectangle");
});

test("reloading with uncommitted editor text asks for confirmation, and not once the edit is closed", async ({ page }) => {
  const opened = await openItem(page, "node");
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  expect(await asksBeforeLeaving(page)).toBe(false);

  const editor = await openEditor(opened);
  await editor.fill("not yet committed");
  expect(await asksBeforeLeaving(page)).toBe(true);

  await editor.press("Escape");
  await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
  await expect(panelLabel(page)).toHaveValue("Rectangle");
  expect(await asksBeforeLeaving(page)).toBe(false);
});
