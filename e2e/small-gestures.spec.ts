import { expect, test } from "@playwright/test";
import { openItem, panelLabel, sourceOf, type ItemKind } from "./support/items";

// VO-038 (FR-006, EC-01): a press that moves 3 px and is released is a click: it selects and nothing else. VO-048 (FR-001,
// EC-08): double-clicking empty canvas creates, selects and edits nothing and does not zoom.

const ONE_PER_VIEW: readonly ItemKind[] = ["node", "participant", "c4-element"];

for (const kind of ONE_PER_VIEW) {
  test(`a press on a ${kind} that moves 3 px is a click: it selects and moves nothing`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await page.keyboard.press("Escape");
    const sourceBefore = await sourceOf(page);
    await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
    await opened.body.scrollIntoViewIfNeeded();
    const before = await opened.item.boundingBox();
    const box = await opened.body.boundingBox();
    if (!box) throw new Error("The item must be visible");
    const x = box.x + 10;
    const y = box.y + 10;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 3, y, { steps: 3 });
    await page.mouse.up();

    await expect(panelLabel(page)).toHaveValue(opened.text);
    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    if (kind === "node") expect(await opened.item.boundingBox()).toEqual(before);
    expect(await sourceOf(page)).toBe(sourceBefore);
    await expect(page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__edge, [data-testid='message'], [data-testid='c4-relationship']")).toHaveCount(0);
  });

  test(`double-clicking empty canvas in a ${kind} view creates, selects and edits nothing and does not zoom`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const canvas = page.getByRole("region", { name: "Diagram canvas" });
    const view = canvas.locator(".react-flow__viewport, svg").first();
    const zoomAttribute = kind === "node" ? "style" : "width";
    const zoomBefore = await view.getAttribute(zoomAttribute);
    const sourceBefore = await sourceOf(page);

    await canvas.dblclick({ position: { x: 24, y: 24 } });

    await expect(opened.item).toHaveCount(1);
    await expect(panelLabel(page)).toHaveCount(0);
    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await view.getAttribute(zoomAttribute)).toBe(zoomBefore);
    expect(await sourceOf(page)).toBe(sourceBefore);
  });
}
