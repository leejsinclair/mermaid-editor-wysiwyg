import { expect, test, type Locator, type Page } from "@playwright/test";
import { handlesOf } from "./support/c4";
import { openItem, type ItemKind } from "./support/items";

// VO-023 (FR-009, US4-AS2): at rest no connection handle is visible; hovered or selected, an item's handles are visible with a
// dot at least 16 px across at 100% zoom, in each view.

const ONE_PER_VIEW: readonly ItemKind[] = ["node", "participant", "c4-element"];

/** An item's connection handles. */
async function handlesIn(opened: { item: Locator }, kind: ItemKind): Promise<Locator> {
  return kind === "c4-element" ? handlesOf(opened.item) : opened.item.locator('[data-zone="connect"]');
}

const opacities = (handles: Locator): Promise<string[]> => handles.evaluateAll((items) => items.map((item) => getComputedStyle(item).opacity));

/** How wide the visible dot of a handle is on screen: the dot is a child of an SVG handle and a pseudo-element of a flowchart one. */
const dotWidth = (handle: Locator): Promise<number> =>
  handle.evaluate((element) => {
    // A C4 handle holds its dot; a Sequence lifeline sits beside its dot in the participant.
    const dot = element.querySelector("[data-handle-dot]") ?? element.parentElement?.querySelector("[data-handle-dot]") ?? null;
    if (dot) return dot.getBoundingClientRect().width;
    return Number.parseFloat(getComputedStyle(element, "::after").width);
  });

async function park(page: Page): Promise<void> {
  await page.mouse.move(2, 2);
}

for (const kind of ONE_PER_VIEW) {
  test(`a ${kind}'s handles are hidden at rest and shown, with a 16 px dot, when it is hovered`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await page.keyboard.press("Escape");
    await park(page);
    const handles = await handlesIn(opened, kind);
    expect(await handles.count()).toBeGreaterThan(0);
    expect(new Set(await opacities(handles))).toEqual(new Set(["0"]));

    const body = await opened.item.locator('[data-zone="body"]').first().boundingBox();
    if (!body) throw new Error("The body must be on screen");
    await page.mouse.move(body.x + 14, body.y + 14);

    expect(new Set(await opacities(handles))).toEqual(new Set(["1"]));
    expect(await dotWidth(handles.first())).toBeGreaterThanOrEqual(16);
  });

  test(`a selected ${kind} shows its handles with a 16 px dot while the pointer is elsewhere`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await opened.item.focus();
    await page.keyboard.press("Enter");
    await park(page);
    const handles = await handlesIn(opened, kind);

    expect(new Set(await opacities(handles))).toEqual(new Set(["1"]));
    expect(await dotWidth(handles.first())).toBeGreaterThanOrEqual(16);
  });
}
