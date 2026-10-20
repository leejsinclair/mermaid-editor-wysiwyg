import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { handlesOf } from "./support/c4";
import { openEditor, openPair, VIEWS, type OpenedItem, type View } from "./support/items";

// VO-042 (FR-022, SC-008): each view, with handles visible, with a line being drawn and with the inline editor open, shows no WCAG 2.2
// AA violation; the hover outline, the handle dots and the target marks each have at least 3:1 contrast with what they sit on; and the
// drop target differs from the other valid targets in stroke width or pattern, not in colour alone.

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running" || animation.effect?.getComputedTiming().iterations === Infinity));
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
}

interface Point {
  x: number;
  y: number;
}

async function centreOf(box: { boundingBox: () => Promise<{ x: number; y: number; width: number; height: number } | null> }): Promise<Point> {
  const found = await box.boundingBox();
  if (!found) throw new Error("The element must be on screen");
  return { x: found.x + found.width / 2, y: found.y + found.height / 2 };
}

type Paint = "stroke" | "fill" | "border" | "background";

interface PaintArgs {
  paint: string;
  pseudo?: string;
}

/**
 * The contrast, as a ratio, between what an element draws with (its stroke, fill, border or background, at its opacity) and the
 * first opaque background behind it. It runs in the page, so it holds everything it uses.
 */
const contrastInPage = (element: Element, { paint, pseudo }: PaintArgs): number => {
  const parse = (text: string) => {
    const found = /rgba?\(([^)]+)\)/.exec(text);
    if (!found?.[1]) return null;
    const [r = 0, g = 0, b = 0, a = 1] = found[1].split(",").map((part) => Number.parseFloat(part));
    return { r, g, b, a };
  };
  const linear = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  const blend = (top: { r: number; g: number; b: number; a: number }, under: { r: number; g: number; b: number }) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
  });
  let background = { r: 255, g: 255, b: 255 };
  const behind: Element[] = [];
  for (let node = element.parentElement; node; node = node.parentElement) behind.push(node);
  behind.reverse();
  for (const node of behind) {
    const colour = parse(getComputedStyle(node).backgroundColor);
    if (colour && colour.a > 0) background = blend(colour, background);
  }
  const style = getComputedStyle(element, pseudo);
  const colours = new Map<string, string>([["stroke", style.stroke], ["fill", style.fill], ["border", style.borderTopColor], ["background", style.backgroundColor]]);
  const own = parse(colours.get(paint) ?? "");
  if (!own) return 0;
  const drawn = blend({ ...own, a: own.a * Number.parseFloat(style.opacity) }, background);
  const [light = 0, dark = 0] = [luminance(drawn), luminance(background)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** The contrast of the dot drawn on an item's handle: a pseudo-element of a flowchart handle, a circle beside or in the others. */
async function dotContrast(page: Page, view: View, item: OpenedItem): Promise<number> {
  if (view === "flowchart") return item.item.locator('[data-zone="connect"]').first().evaluate(contrastInPage, { paint: "background", pseudo: "::after" });
  if (view === "sequence") return item.item.locator("[data-handle-dot]").first().evaluate(contrastInPage, { paint: "fill" });
  return (await handlesOf(item.item)).first().locator("circle").evaluate(contrastInPage, { paint: "fill" });
}

async function startLine(page: Page, from: Point, towards: Point): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 6, from.y + 6);
  await page.mouse.move(towards.x, towards.y, { steps: 10 });
}

/** The handle of the first item to draw from, and the second item's centre to draw towards. */
async function handleAndTarget(page: Page, view: View, pair: readonly [OpenedItem, OpenedItem]): Promise<{ from: Point; to: Point }> {
  const [first, second] = pair;
  const handles = new Map<View, () => Promise<ReturnType<Page["locator"]>>>([
    ["flowchart", () => Promise.resolve(first.item.locator('[data-zone="connect"]').first())],
    ["sequence", () => Promise.resolve(first.item.getByTestId("lifeline"))],
    ["c4", async () => (await handlesOf(first.item, "right")).first()],
  ]);
  const handle = await (handles.get(view) ?? handles.get("flowchart"))?.();
  if (!handle) throw new Error("No handle");
  const box = await handle.boundingBox();
  if (!box) throw new Error("The handle must be on screen");
  return { from: { x: box.x + box.width / 2, y: view === "sequence" ? box.y + 24 : box.y + box.height / 2 }, to: await centreOf(second.item) };
}

for (const view of VIEWS) {
  test(`a ${view} diagram has no violations with its handles visible, with a line being drawn and with the editor open`, async ({ page }) => {
    const pair = await openPair(page, view);
    await pair[0].item.focus();
    await page.keyboard.press("Enter");
    await page.mouse.move(2, 2);
    await expectNoViolations(page);

    const { from, to } = await handleAndTarget(page, view, pair);
    await startLine(page, from, to);
    await expectNoViolations(page);
    await page.mouse.up();

    await page.keyboard.press("Escape");
    await openEditor(pair[1]);
    await expectNoViolations(page);
  });

  test(`in a ${view} diagram the hover outline, the handle dots and the target marks have at least 3:1 contrast, and the drop target differs by more than colour`, async ({ page }) => {
    const pair = await openPair(page, view);
    const [first, second] = pair;
    await page.keyboard.press("Escape");
    await page.mouse.move(2, 2);

    // The hover outline, with the pointer resting on the first item's body.
    const body = await first.item.locator('[data-zone="body"]').first().boundingBox();
    if (!body) throw new Error("The body must be on screen");
    await page.mouse.move(body.x + 14, body.y + 14);
    const outline = first.item.locator("[data-hover-outline]").first();
    expect(await outline.evaluate(contrastInPage, { paint: view === "flowchart" ? "border" : "stroke" })).toBeGreaterThanOrEqual(3);

    // The handle dot, shown while the item is hovered.
    expect(await dotContrast(page, view, first)).toBeGreaterThanOrEqual(3);

    // The marks of a line being drawn: a thin dashed ring on a valid end, a thick solid ring on the drop target.
    const { from, to } = await handleAndTarget(page, view, pair);
    await startLine(page, from, to);
    const ring = (item: OpenedItem) => item.item.locator("[data-target-ring]").first();
    const ringPaint: Paint = view === "flowchart" ? "border" : "stroke";
    expect(await ring(first).evaluate(contrastInPage, { paint: ringPaint })).toBeGreaterThanOrEqual(3);
    expect(await ring(second).evaluate(contrastInPage, { paint: ringPaint })).toBeGreaterThanOrEqual(3);
    const shape = (item: OpenedItem) => ring(item).evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: Number.parseFloat(style.strokeWidth) || Number.parseFloat(style.borderTopWidth), dashed: style.borderTopStyle === "dashed" || (style.strokeDasharray !== "none" && style.strokeDasharray !== "") };
    });
    const [valid, drop] = [await shape(first), await shape(second)];
    expect(drop.width !== valid.width || drop.dashed !== valid.dashed).toBe(true);
    await page.mouse.up();
  });
}
