import { expect, test, type Page } from "@playwright/test";
import { canvasRegion } from "./support/grid";

// VO-018 (FR-012, US2-AS3): the topmost element at points of each canvas that show only grid is never part of the grid; the grid
// uses the same small number of elements on a small and on an enlarged canvas; and it runs no animation.

const CASES = [
  { type: "flowchart", address: "#/new/flowchart", add: "Rectangle", elements: 2 },
  { type: "sequence diagram", address: "#/new/sequence", add: "Participant", elements: 0 },
  { type: "C4 diagram", address: "#/new/c4/context", add: "Person", elements: 0 },
] as const;

/** The elements the grid is drawn with: the flowchart's two background layers; a scrolling area's grid is a background, not an element. */
const gridElements = (page: Page): Promise<number> => canvasRegion(page).locator("svg.react-flow__background").count();

async function topmostAt(page: Page, x: number, y: number): Promise<{ inGrid: boolean; pointerEvents: string }> {
  return page.evaluate(
    ([px, py]) => {
      const element = document.elementFromPoint(px ?? 0, py ?? 0);
      return { inGrid: element?.closest("svg.react-flow__background") != null, pointerEvents: element ? getComputedStyle(element).pointerEvents : "" };
    },
    [x, y],
  );
}

for (const { type, address, add, elements } of CASES) {
  test(`in a ${type} the grid receives no pointer events, uses a fixed small number of elements and runs no animation`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await page.goto(address);
    await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }).click();
    const small = await gridElements(page);

    const box = await canvasRegion(page).boundingBox();
    if (!box) throw new Error("no canvas");
    for (const [fx, fy] of [[0.1, 0.1], [0.9, 0.15], [0.12, 0.85], [0.88, 0.9]] as const) {
      const hit = await topmostAt(page, box.x + box.width * fx, box.y + box.height * fy);
      expect(hit.inGrid, `the element at ${String(fx)}, ${String(fy)} is part of the grid`).toBe(false);
      expect(hit.pointerEvents).not.toBe("none");
    }
    const layers = await canvasRegion(page).locator("svg.react-flow__background").evaluateAll((svgs) => svgs.map((svg) => getComputedStyle(svg).pointerEvents));
    expect(layers, "pointer events of the grid layers").toEqual(Array.from({ length: elements }, () => "none"));

    await page.setViewportSize({ width: 1600, height: 1000 });
    const large = await gridElements(page);
    expect(small, "grid elements on a small canvas").toBe(elements);
    expect(large, "grid elements on an enlarged canvas").toBe(elements);
    expect(await canvasRegion(page).evaluate((region) => region.getAnimations({ subtree: true }).length), "animations on the canvas").toBe(0);
  });
}
