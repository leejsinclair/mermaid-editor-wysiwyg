import { expect, type Locator, type Page } from "@playwright/test";

// Timings of the actions the redesign must not slow down (SC-007, VO-045): dragging an item, panning (scrolling) the canvas
// and zooming it, on a diagram of 100 elements and 150 relationships. Each action is timed from the request until the page
// has painted twice, and the median of its samples is taken so one slow frame does not decide the result.

export const DRAGS = 20;
export const PANS = 20;
export const ZOOMS = 10;

export interface Medians {
  readonly drag: number;
  readonly pan: number;
  readonly zoom: number;
}
export type Scenario = "flowchart" | "sequence" | "c4";
export const SCENARIOS: readonly Scenario[] = ["flowchart", "sequence", "c4"];

const canvas = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });
const toolbar = (page: Page): Locator => page.getByRole("toolbar", { name: "Diagram actions" });

/** Opens the 100-element fixture of a type through the start screen, as a user opens a file. */
export async function openFixture(page: Page, scenario: Scenario): Promise<void> {
  await page.goto("#/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open file…" }).click();
  await (await chooser).setFiles(`e2e/fixtures/performance-${scenario}.mermaid-editor.json`);
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(items(page, scenario)).toHaveCount(100);
}

function items(page: Page, scenario: Scenario): Locator {
  if (scenario === "flowchart") return canvas(page).locator(".react-flow__node");
  return canvas(page).getByTestId(scenario === "sequence" ? "participant" : "c4-element");
}

/** Resolves after the page has painted twice, so the work an action caused is included in its time. */
function settle(page: Page): Promise<void> {
  return page.evaluate(
    () =>
      new Promise<void>((done) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            done();
          });
        });
      }),
  );
}

async function timeIt(page: Page, action: () => Promise<void>): Promise<number> {
  const started = performance.now();
  await action();
  await settle(page);
  return performance.now() - started;
}

export function median(samples: readonly number[]): number {
  const ordered = [...samples].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1 ? (ordered.at(middle) ?? 0) : ((ordered.at(middle - 1) ?? 0) + (ordered.at(middle) ?? 0)) / 2;
}

/** Drags the item out and back to where it started, so the diagram ends as it began. */
async function dragOutAndBack(page: Page, item: Locator): Promise<void> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The dragged item must be on screen");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 80, y + 40, { steps: 6 });
  await page.mouse.move(x, y, { steps: 6 });
  await page.mouse.up();
}

/** Pans a flowchart by dragging empty canvas, and scrolls a sequence or C4 canvas with the wheel; direction alternates. */
async function panOnce(page: Page, scenario: Scenario, index: number): Promise<void> {
  const sign = index % 2 === 0 ? 1 : -1;
  if (scenario === "flowchart") {
    const box = await canvas(page).boundingBox();
    if (!box) throw new Error("no canvas");
    const x = box.x + box.width - 60;
    const y = box.y + box.height - 40;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - sign * 60, y - sign * 40, { steps: 5 });
    await page.mouse.up();
    return;
  }
  await canvas(page).locator("svg").first().hover();
  await page.mouse.wheel(sign * 60, sign * 40);
}

/** The median time of each action for one type, measured on the page that has its fixture open. */
export async function measure(page: Page, scenario: Scenario): Promise<Medians> {
  const target = items(page, scenario).nth(3);
  const drags: number[] = [];
  for (let index = 0; index < DRAGS; index += 1) drags.push(await timeIt(page, () => dragOutAndBack(page, target)));
  const pans: number[] = [];
  for (let index = 0; index < PANS; index += 1) pans.push(await timeIt(page, () => panOnce(page, scenario, index)));
  const zooms: number[] = [];
  for (let index = 0; index < ZOOMS; index += 1) {
    const name = index < ZOOMS / 2 ? "Zoom in" : "Zoom out";
    zooms.push(await timeIt(page, () => toolbar(page).getByRole("button", { name }).click()));
  }
  return { drag: median(drags), pan: median(pans), zoom: median(zooms) };
}
