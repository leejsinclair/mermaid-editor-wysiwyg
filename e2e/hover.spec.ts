import { expect, test, type Locator, type Page } from "@playwright/test";
import { handlesOf } from "./support/c4";
import { openItem, type ItemKind } from "./support/items";

// VO-015 (FR-009, FR-013, US3-AS1): the pointer resting on an item's body shows a move cursor, a hover outline that differs
// from the selection outline in width or pattern, and the item's handles. VO-016 (FR-013, US3-AS2): resting on a connection
// handle shows a crosshair and a handle that is drawn larger.

const ONE_PER_VIEW: readonly ItemKind[] = ["node", "participant", "c4-element"];

interface Point {
  x: number;
  y: number;
}

/** The cursor in force at a point of the page. */
const cursorAt = (page: Page, point: Point): Promise<string> =>
  page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    return element ? getComputedStyle(element).cursor : "none";
  }, point);

async function centreOf(item: Locator): Promise<Point> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** A point on the body of the item, near its top-left corner and away from its handles. */
async function bodyPoint(body: Locator): Promise<Point> {
  const box = await body.boundingBox();
  if (!box) throw new Error("The body must be on screen");
  return { x: box.x + 14, y: box.y + 14 };
}

for (const kind of ONE_PER_VIEW) {
  test(`resting on the body of a ${kind} shows a move cursor, a dashed hover outline and the handles`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await page.keyboard.press("Escape");
    await page.mouse.move(5, 5);
    const zone = opened.item.locator('[data-zone="body"]').first();
    const outline = opened.item.locator("[data-hover-outline]").first();
    await expect(outline).toHaveCount(1);
    const opacityAtRest = await outline.evaluate((element) => getComputedStyle(element).opacity);
    expect(opacityAtRest).toBe("0");

    const point = await bodyPoint(zone);
    await page.mouse.move(point.x, point.y);

    expect(await cursorAt(page, point)).toBe("move");
    const style = await outline.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { opacity: computed.opacity, dashed: computed.borderTopStyle === "dashed" || (computed.strokeDasharray !== "none" && computed.strokeDasharray !== ""), width: parseFloat(computed.borderTopWidth) || parseFloat(computed.strokeWidth) };
    });
    expect(style.opacity).toBe("1");
    expect(style.dashed).toBe(true);
    // The selection outline is 3 to 4 px and solid; the hover outline is thinner as well as dashed.
    expect(style.width).toBeLessThanOrEqual(1);
    const handles = kind === "c4-element" ? await handlesOf(opened.item) : opened.item.locator('[data-zone="connect"]');
    expect(await handles.count()).toBeGreaterThan(0);
    expect(await handles.first().evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  });

  test(`resting on a connection handle of a ${kind} shows a crosshair and a larger or highlighted handle`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await page.keyboard.press("Escape");
    const handle = (kind === "c4-element" ? await handlesOf(opened.item) : opened.item.locator('[data-zone="connect"]')).first();
    // A flowchart handle and a C4 handle are drawn as dots; a Sequence lifeline is drawn as a strip, which is highlighted.
    const dot = kind === "c4-element" ? handle.locator("circle").first() : handle;
    const look = (): Promise<{ width: number; fill: string }> =>
      dot.evaluate((element) => ({ width: element.getBoundingClientRect().width, fill: getComputedStyle(element).fill + getComputedStyle(element).fillOpacity }));
    const body = await bodyPoint(opened.item.locator('[data-zone="body"]').first());
    await page.mouse.move(body.x, body.y);
    const before = await look();

    const at = await centreOf(handle);
    await page.mouse.move(at.x, at.y);

    expect(await cursorAt(page, at)).toBe("crosshair");
    const after = await look();
    expect(after.width > before.width || after.fill !== before.fill).toBe(true);
  });
}
