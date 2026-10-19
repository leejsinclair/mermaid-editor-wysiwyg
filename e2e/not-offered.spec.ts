import { expect, test, type Page } from "@playwright/test";

// VO-092 (AC17): the source is shown read-only in an expandable panel, and no screen offers source editing or import,
// image export, collaboration, version history, cloud storage, multi-select, copy and paste of items, grid snapping
// or auto-arrange.

// Words that would name an excluded feature on a control.
const EXCLUDED_WORDS = [/export|image|png|svg|pdf/i, /share|collaborat|invite|comment/i, /version|history|cloud|\bsync\b/i, /import|paste|duplicate/i, /snap|grid|arrange|auto.?layout|select all|multi/i];
const isExcluded = (name: string): boolean => EXCLUDED_WORDS.some((words) => words.test(name));

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });

/** The accessible names of every control on the page: buttons, links, switches, checkboxes and text fields. */
async function controlNames(page: Page): Promise<string[]> {
  const names: string[] = [];
  for (const role of ["button", "link", "switch", "checkbox", "textbox", "combobox", "menuitem", "tab"] as const) {
    for (const control of await page.getByRole(role).all()) {
      names.push((await control.getAttribute("aria-label")) ?? ((await control.textContent()) ?? "").trim());
    }
  }
  return names.filter((name) => name !== "");
}

async function expectNothingExcludedOffered(page: Page): Promise<void> {
  expect((await controlNames(page)).filter(isExcluded)).toEqual([]);
}

test("the start screen offers none of the excluded features", async ({ page }) => {
  await page.goto("#/");

  await expectNothingExcludedOffered(page);
});

for (const { name, path } of [
  { name: "flowchart", path: "#/new/flowchart" },
  { name: "sequence", path: "#/new/sequence" },
  { name: "C4", path: "#/new/c4/context" },
]) {
  test(`the ${name} editor shows its source read-only in an expandable panel and offers none of the excluded features`, async ({ page }) => {
    await page.goto(path);
    const toggle = page.getByRole("button", { name: /Mermaid source/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panel = page.getByRole("region", { name: /Mermaid source/ });
    await expect(panel).toBeVisible();
    await expect(panel.locator("input, textarea, [contenteditable]:not([contenteditable=false])")).toHaveCount(0);
    expect(await panel.evaluate((element) => (element as HTMLElement).isContentEditable)).toBe(false);
    const properties = page.getByRole("region", { name: "Properties" });
    expect(await properties.getByRole("textbox").count()).toBeLessThanOrEqual(1);
    await expectNothingExcludedOffered(page);
  });
}

async function twoNodes(page: Page) {
  await page.goto("#/new/flowchart");
  await page.reload();
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Circle", exact: true }).click();
  const nodes = canvas(page).locator(".react-flow__node");
  await expect(nodes).toHaveCount(2);
  return nodes;
}

const selectedCount = (page: Page) => canvas(page).locator(".react-flow__node[aria-current=true]").count();

test("flowchart nodes cannot be multi-selected", async ({ page }) => {
  const nodes = await twoNodes(page);

  // Shift or Ctrl clicks still select one node only.
  await nodes.nth(0).click();
  await nodes.nth(1).click({ modifiers: ["Shift"] });
  await nodes.nth(0).click({ modifiers: ["ControlOrMeta"] });
  expect(await selectedCount(page)).toBe(1);
  // A selection rectangle dragged over both nodes does not select both.
  const box = await canvas(page).boundingBox();
  if (!box) throw new Error("no canvas");
  await page.keyboard.down("Shift");
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 5, box.y + box.height - 5, { steps: 5 });
  await page.mouse.up();
  await page.keyboard.up("Shift");
  expect(await selectedCount(page)).toBeLessThanOrEqual(1);
});

test("flowchart nodes cannot be copied and pasted", async ({ page }) => {
  const nodes = await twoNodes(page);
  await nodes.nth(0).click();

  await page.keyboard.press("ControlOrMeta+C");
  await page.keyboard.press("ControlOrMeta+V");
  await page.keyboard.press("ControlOrMeta+D");

  await expect(nodes).toHaveCount(2);
});

test("flowchart nodes do not snap to a grid", async ({ page }) => {
  const nodes = await twoNodes(page);
  const before = await nodes.nth(1).boundingBox();
  const other = await nodes.nth(0).boundingBox();
  if (!before || !other) throw new Error("no node");
  // Upwards when the node is above the other one, so that the move is not corrected for an overlap.
  const away = before.y <= other.y ? -1 : 1;

  // The first 2 pixels start the drag; the 5 after them move the node by exactly 5, not to a grid line.
  const grab = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 2, grab.y + 2 * away);
  await page.mouse.move(grab.x + 7, grab.y + 7 * away, { steps: 4 });
  await page.mouse.up();

  const after = await nodes.nth(1).boundingBox();
  expect(Math.round((after?.x ?? 0) - before.x)).toBe(5);
  expect(Math.round(((after?.y ?? 0) - before.y) * away)).toBe(5);
});
