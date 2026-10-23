import { expect, test, type Locator, type Page } from "@playwright/test";
import { canvasRegion, frameOf, type GridFrame } from "./support/grid";

// VO-017 (FR-013, US2-AS2, EC-04, EC-05, SC-006): an item keeps its place against the grid lines, scaled by the zoom, to within 1 px,
// after the canvas is panned (flowchart) or scrolled (sequence, C4) and zoomed to its minimum, default and maximum; at the zoom
// where minor lines would be under 6 px apart only the major grid is drawn.

const CASES = [
  { type: "flowchart", address: "#/new/flowchart", add: "Rectangle", shape: ".react-flow__node" },
  { type: "sequence diagram", address: "#/new/sequence", add: "Participant", shape: '[data-testid="participant"] rect[rx="4"]' },
  { type: "C4 diagram", address: "#/new/c4/context", add: "Person", shape: '[data-testid="c4-element"] rect[rx="6"]' },
] as const;

const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });
/** Waits until the item's place against the grid has stopped changing: two reads, 150 ms apart, agree (a button zoom is animated). */
async function settledFrame(region: Locator, item: Locator): Promise<GridFrame> {
  let previous = "";
  let frame: GridFrame | undefined;
  await expect
    .poll(
      async () => {
        frame = await frameOf(region, item);
        const now = JSON.stringify(frame);
        const same = now === previous;
        previous = now;
        return same;
      },
      { intervals: [150] },
    )
    .toBe(true);
  if (!frame) throw new Error("No frame was read");
  return frame;
}

/** Presses Zoom in or Zoom out until the zoom stops changing, and returns the settled place of the item against the grid and the zoom. */
async function zoomAsFarAs(page: Page, region: Locator, item: Locator, direction: "Zoom in" | "Zoom out"): Promise<{ frame: GridFrame; zoom: number }> {
  let last = await settledFrame(region, item);
  for (let press = 0; press < 14; press += 1) {
    await toolbar(page).getByRole("button", { name: direction }).click();
    const now = await settledFrame(region, item);
    if (now.gap === last.gap) break;
    last = now;
  }
  return { frame: last, zoom: (last.gap / 80) * 100 };
}

/** The distance between two positions on a ring of the given size, the short way round. */
const apart = (a: number, b: number, ring: number): number => {
  const difference = Math.abs(a - b) % ring;
  return Math.min(difference, ring - difference);
};

function expectKept(now: GridFrame, before: GridFrame, label: string): void {
  const scale = now.gap / before.gap;
  expect(apart(now.x, (before.x * scale) % now.gap, now.gap), `${label}: horizontal offset from the grid`).toBeLessThanOrEqual(1);
  expect(apart(now.y, (before.y * scale) % now.gap, now.gap), `${label}: vertical offset from the grid`).toBeLessThanOrEqual(1);
}

for (const { type, address, add, shape } of CASES) {
  test(`in a ${type} an item keeps its place against the grid after panning and at minimum, default and maximum zoom`, async ({ page }) => {
    await page.goto(address);
    await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }).click();
    const item = page.locator(shape).first();
    await expect(item).toBeVisible();
    const region = canvasRegion(page);
    const start = await frameOf(region, item);
    expect(start.gap).toBe(80);

    // Pan (flowchart) or scroll (sequence and C4).
    if (type === "flowchart") {
      const box = await region.boundingBox();
      if (!box) throw new Error("no canvas");
      await page.mouse.move(box.x + box.width - 80, box.y + box.height - 80);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 190, box.y + box.height - 143, { steps: 6 });
      await page.mouse.up();
    } else {
      await region.locator("svg").first().hover();
      await page.mouse.wheel(37, 23);
    }
    expectKept(await settledFrame(region, item), start, "after panning");

    const minimum = await zoomAsFarAs(page, region, item, "Zoom out");
    expectKept(minimum.frame, start, "at minimum zoom");
    expect(minimum.frame.hasMinor, "a minor grid at minimum zoom").toBe(16 * (minimum.zoom / 100) >= 6);

    const maximum = await zoomAsFarAs(page, region, item, "Zoom in");
    expect(maximum.zoom).toBeGreaterThan(minimum.zoom);
    expectKept(maximum.frame, start, "at maximum zoom");
  });
}
