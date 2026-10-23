import { expect, test, type Locator, type Page } from "@playwright/test";
import { centreOf, doubleTap, emptyPair, emptyPoint, openWithItem, Touches, zoomShown, zoomUntilScrollable, type DiagramKind } from "./support";

// VO-041 (FR-028, SC-009): on the emulated phones, in each diagram type, one finger dragged across empty canvas pans the flowchart
// or scrolls the sequence and C4 canvas by the drag; two fingers pinching together and apart change the zoom shown, while the
// page's own scale stays 1 and the header keeps its size; and a double-tap on an item opens it for renaming.

const KINDS: readonly DiagramKind[] = ["flowchart", "sequence", "c4"];

const canvasRegion = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });

/** Where the drawing sits: the flowchart's viewport translation, or a scrolling area's scroll offsets. */
async function placeOf(page: Page, kind: DiagramKind): Promise<{ x: number; y: number }> {
  if (kind === "flowchart") {
    return page.locator(".react-flow__viewport").evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { x: matrix.e, y: matrix.f };
    });
  }
  return canvasRegion(page).evaluate((region) => {
    const scroller = [...region.querySelectorAll("div")].find((candidate) => getComputedStyle(candidate).overflow === "auto");
    return { x: scroller?.scrollLeft ?? Number.NaN, y: scroller?.scrollTop ?? Number.NaN };
  });
}

const headerHeight = async (page: Page): Promise<number> => (await page.getByRole("banner").boundingBox())?.height ?? Number.NaN;

for (const kind of KINDS) {
  test(`in a ${kind} one finger pans, two fingers pinch and a double-tap renames`, async ({ page, browserName }) => {
    // The flowchart takes touch events, which Playwright's WebKit cannot be sent (no Touch constructor): there only the tap is tried.
    const dragsAndPinches = !(browserName === "webkit" && kind === "flowchart");
    test.info().annotations.push({ type: "limitation", description: dragsAndPinches ? "none" : "touch drags and pinches cannot be sent to a flowchart in Playwright's WebKit" });
    const item = await openWithItem(page, kind);
    const touches = await Touches.attach(page);
    if (dragsAndPinches) {
      if (kind !== "flowchart") await zoomUntilScrollable(page);
      const empty = await emptyPoint(page);
      const before = await placeOf(page, kind);
      await touches.drag(empty, { x: empty.x - 70, y: empty.y - 50 }, 8);
      await expect.poll(() => placeOf(page, kind).then((now) => Math.abs(now.x - before.x) + Math.abs(now.y - before.y))).toBeGreaterThan(30);
      const after = await placeOf(page, kind);
      if (kind === "flowchart") {
        expect(after.x - before.x, "the flowchart moves with the finger").toBeLessThan(-40);
        expect(after.y - before.y).toBeLessThan(-25);
      } else {
        expect(after.x - before.x, "the area scrolls the way the finger dragged").toBeGreaterThanOrEqual(0);
        expect(after.y - before.y).toBeGreaterThanOrEqual(0);
      }

      const header = await headerHeight(page);
      const startZoom = await zoomShown(page);
      // Both fingers go down on empty canvas, 200 px apart, and move together to 70 px apart, then apart again.
      const [left, right] = await emptyPair(page, 200);
      const middle = { x: (left.x + right.x) / 2, y: left.y };
      await touches.press(left, right);
      await touches.slide(8, { x: middle.x - 35, y: middle.y }, { x: middle.x + 35, y: middle.y });
      await touches.lift();
      await expect.poll(() => zoomShown(page)).toBeLessThan(startZoom);
      const shrunk = await zoomShown(page);
      const [apartLeft, apartRight] = await emptyPair(page, 70);
      await touches.press(apartLeft, apartRight);
      await touches.slide(8, { x: apartLeft.x - 60, y: apartLeft.y }, { x: apartRight.x + 60, y: apartRight.y });
      await touches.lift();
      await expect.poll(() => zoomShown(page)).toBeGreaterThan(shrunk);
      expect(await page.evaluate(() => window.visualViewport?.scale), "the page's own scale").toBe(1);
      expect(await headerHeight(page), "the header's size").toBe(header);
    }

    await page.getByRole("button", { name: "Fit to view" }).click();
    await expect(item).toBeVisible();
    // A participant's header, not its lifeline, is what a double-tap renames.
    await doubleTap(page, kind === "sequence" ? item.getByTestId("participant-header") : item);
    await expect(page.getByRole("textbox", { name: /^Label of/ })).toBeVisible();
    expect((await centreOf(item)).x).toBeGreaterThan(0);
  });
}
