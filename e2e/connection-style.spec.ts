import { expect, test, type Locator, type Page } from "@playwright/test";
import { handlesOf } from "./support/c4";

// VO-020 (FR-015, US2-AS5): while a line is drawn, the valid ends are ringed with a thin dashed ring and the end under the pointer
// with a thick solid ring, both in the canvas ink, and the line being drawn is visible in the canvas ink.

const INK = "rgb(241, 233, 215)";

interface Ring {
  readonly dashed: boolean;
  readonly width: number;
  readonly colour: string;
}

async function ringOf(ring: Locator): Promise<Ring> {
  return ring.evaluate((element) => {
    const style = getComputedStyle(element);
    const border = Number.parseFloat(style.borderTopWidth);
    const stroke = Number.parseFloat(style.strokeWidth);
    const dashed = style.borderTopStyle === "dashed" || (style.strokeDasharray !== "none" && style.strokeDasharray !== "");
    return { dashed, width: border > 0 && style.borderTopStyle !== "none" ? border : stroke, colour: style.borderTopStyle !== "none" && border > 0 ? style.borderTopColor : style.stroke };
  });
}

async function startLine(page: Page, from: Locator, towards: Locator): Promise<void> {
  const start = await from.boundingBox();
  const end = await towards.boundingBox();
  if (!start || !end) throw new Error("Both ends must be on screen");
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
}

const CASES = [
  {
    type: "flowchart",
    address: "#/new/flowchart",
    add: ["Rectangle", "Diamond"],
    item: ".react-flow__node",
    handle: (item: Locator) => Promise.resolve(item.locator('[data-side="bottom"]').first()),
    preview: ".react-flow__connection-path",
  },
  {
    type: "sequence diagram",
    address: "#/new/sequence",
    add: ["Participant", "Actor"],
    item: '[data-testid="participant"]',
    handle: (item: Locator) => Promise.resolve(item.getByTestId("lifeline")),
    preview: '[data-testid="connection-preview"]',
  },
  {
    type: "C4 diagram",
    address: "#/new/c4/context",
    add: ["Person", "System"],
    item: '[data-testid="c4-element"]',
    handle: (item: Locator) => handlesOf(item, "bottom"),
    preview: '[data-testid="connection-preview"]',
  },
] as const;

for (const { type, address, add, item, handle, preview } of CASES) {
  test(`in a ${type} valid ends have a thin dashed ring, the end under the pointer a thick solid ring, and the line is drawn in ink`, async ({ page }) => {
    await page.goto(address);
    for (const name of add) await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true }).click();
    const items = page.locator(item);
    await expect(items).toHaveCount(2);
    const [first, second] = [items.nth(0), items.nth(1)];
    await first.hover();
    await startLine(page, await handle(first), second);

    const valid = page.locator('[data-target="valid"] [data-target-ring]').first();
    const drop = page.locator('[data-target="drop"] [data-target-ring]').first();
    const thin = await ringOf(valid);
    const thick = await ringOf(drop);
    expect(thin.dashed, "a valid end's ring is dashed").toBe(true);
    expect(thick.dashed, "the ring of the end under the pointer is solid").toBe(false);
    expect(thick.width, "the ring under the pointer is thicker").toBeGreaterThan(thin.width);
    expect(thin.colour).toBe(INK);
    expect(thick.colour).toBe(INK);
    expect(await page.locator(preview).first().evaluate((element) => getComputedStyle(element).stroke)).toBe(INK);
    await page.mouse.up();
  });
}
