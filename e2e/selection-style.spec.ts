import { expect, test, type Locator } from "@playwright/test";

// VO-019 (FR-015, US2-AS4, EC-07): in each diagram type an unselected item is drawn in the canvas ink on the node fill (an
// external C4 element on the raised panel colour); hovering it shows the dashed hover outline; and the selected item's outline is
// in the cyan selection colour, wider than an unselected one's and different from the hover outline.

const INK = "rgb(241, 233, 215)";
const NODE_FILL = "rgb(13, 43, 69)";
const SELECTION = "rgb(114, 215, 242)";

interface Look {
  readonly fill: string;
  readonly stroke: string;
  readonly width: number;
  readonly label: string;
}

const CASES = [
  {
    type: "flowchart",
    address: "#/new/flowchart",
    add: "Rectangle",
    item: ".react-flow__node",
    shape: (item: Locator) => item.locator("svg > *").first(),
    label: (item: Locator) => item.getByTestId("node-label"),
    hoverOn: (item: Locator) => item,
  },
  {
    type: "sequence diagram",
    address: "#/new/sequence",
    add: "Participant",
    item: '[data-testid="participant"]',
    shape: (item: Locator) => item.locator('rect[rx="4"]').first(),
    label: (item: Locator) => item.locator("text").first(),
    // The hover outline belongs to the participant's header; the middle of the whole participant is its lifeline.
    hoverOn: (item: Locator) => item.getByTestId("participant-header"),
  },
  {
    type: "C4 diagram",
    address: "#/new/c4/context",
    add: "Person",
    item: '[data-testid="c4-element"]',
    shape: (item: Locator) => item.locator('rect[rx="6"]').last(),
    label: (item: Locator) => item.getByTestId("item-label"),
    hoverOn: (item: Locator) => item,
  },
] as const;

const looks = (shape: Locator, label: Locator): Promise<Look> =>
  Promise.all([
    shape.evaluate((element) => {
      const style = getComputedStyle(element);
      return { fill: style.fill, stroke: style.stroke, width: Number.parseFloat(style.strokeWidth) };
    }),
    label.evaluate((element) => {
      const style = getComputedStyle(element);
      return element instanceof SVGElement ? style.fill : style.color;
    }),
  ]).then(([drawn, text]) => ({ ...drawn, label: text }));

for (const { type, address, add, item, shape, label, hoverOn } of CASES) {
  test(`in a ${type} an item is drawn in ink on the node fill, shows a dashed outline on hover and a cyan, wider outline when selected`, async ({ page }) => {
    await page.goto(address);
    await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }).click();
    const drawn = page.locator(item).first();
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("Escape");

    const unselected = await looks(shape(drawn), label(drawn));
    expect(unselected.stroke, "outline").toBe(INK);
    expect(unselected.fill, "fill").toBe(NODE_FILL);
    expect(unselected.label, "label").toBe(INK);

    await hoverOn(drawn).hover();
    const hover = drawn.locator("[data-hover-outline]").first();
    await expect(hover).toHaveCSS("opacity", "1");
    const dashed = await hover.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.borderTopStyle === "dashed" || (style.strokeDasharray !== "none" && style.strokeDasharray !== "");
    });
    expect(dashed, "the hover outline is dashed").toBe(true);

    await drawn.click();
    const selected = await looks(shape(drawn), label(drawn));
    expect(selected.stroke, "selected outline").toBe(SELECTION);
    expect(selected.width, "selected outline is wider").toBeGreaterThan(unselected.width);
    expect(selected.stroke, "selected outline differs from the hover outline").not.toBe(INK);
  });
}
