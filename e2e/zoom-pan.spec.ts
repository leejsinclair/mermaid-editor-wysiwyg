import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-067 (FR-020): in each type the canvas is zoomed, panned and fitted to view, and the diagram and source stay identical.

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });
const toolbox = (page: Page) => page.getByRole("region", { name: "Toolbox" });

async function source(page: Page): Promise<string> {
  const panel = page.getByRole("region", { name: /Mermaid source/ });
  if ((await panel.count()) === 0) await page.getByRole("button", { name: /Mermaid source/ }).click();
  return (await panel.textContent()) ?? "";
}

/** How large the drawing is on screen, as the width of what holds it. */
type Scale = (page: Page) => Promise<number>;

const flowchartScale: Scale = (page) =>
  canvas(page)
    .locator(".react-flow__viewport")
    .evaluate((viewport) => new DOMMatrixReadOnly(getComputedStyle(viewport).transform).a);
const svgScale: Scale = (page) => canvas(page).locator("svg").first().evaluate((svg) => svg.getBoundingClientRect().width);

async function exercise(page: Page, scale: Scale, panBy: () => Promise<unknown>, drawn: Locator) {
  const sourceBefore = await source(page);
  const drawnBefore = await drawn.allTextContents();
  const initial = await scale(page);

  await toolbar(page).getByRole("button", { name: "Zoom in" }).click();
  await toolbar(page).getByRole("button", { name: "Zoom in" }).click();
  await expect.poll(() => scale(page)).toBeGreaterThan(initial);
  const zoomed = await scale(page);

  await toolbar(page).getByRole("button", { name: "Zoom out" }).click();
  await expect.poll(() => scale(page)).toBeLessThan(zoomed);

  await panBy();

  await toolbar(page).getByRole("button", { name: "Fit to view" }).click();
  await expect(drawn.first()).toBeInViewport();

  expect(await source(page)).toBe(sourceBefore);
  expect(await drawn.allTextContents()).toEqual(drawnBefore);
}

test("a flowchart is zoomed, panned and fitted with the diagram and source unchanged", async ({ page }) => {
  await page.goto("/new/flowchart");
  await toolbox(page).getByRole("button", { name: "Rectangle", exact: true }).click();
  const nodes = canvas(page).locator(".react-flow__node");
  await expect(nodes).toHaveCount(1);

  await exercise(page, flowchartScale, async () => {
    const box = await canvas(page).boundingBox();
    if (!box) throw new Error("no canvas");
    await page.mouse.move(box.x + 40, box.y + box.height - 40);
    await page.mouse.down();
    await page.mouse.move(box.x + 140, box.y + box.height - 90, { steps: 5 });
    await page.mouse.up();
  }, nodes.locator("[data-testid=node-label]"));
});

test("a sequence diagram is zoomed, panned and fitted with the diagram and source unchanged", async ({ page }) => {
  await page.goto("/new/sequence");
  for (const role of ["Participant", "Actor"]) await toolbox(page).getByRole("button", { name: role, exact: true }).click();
  const participants = canvas(page).getByTestId("participant");
  await expect(participants).toHaveCount(2);

  await exercise(page, svgScale, async () => {
    await canvas(page).locator("svg").first().hover();
    await page.mouse.wheel(60, 40);
  }, participants);
});

test("a C4 diagram is zoomed, panned and fitted with the diagram and source unchanged", async ({ page }) => {
  await page.goto("/new/c4/context");
  for (const type of ["Person", "System"]) await toolbox(page).getByRole("button", { name: type, exact: true }).click();
  const elements = canvas(page).getByTestId("c4-element");
  await expect(elements).toHaveCount(2);

  await exercise(page, svgScale, async () => {
    await canvas(page).locator("svg").first().hover();
    await page.mouse.wheel(60, 40);
  }, elements);
});
