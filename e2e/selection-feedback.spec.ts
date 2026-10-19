import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-101 (AC4): in each type selecting an item shows it visibly distinct from unselected items (a non-colour cue as
// well as colour) and exposes aria-pressed or aria-current, selecting another item moves the cue, and clicking empty
// canvas or pressing Escape clears it.

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const toolbox = (page: Page) => page.getByRole("region", { name: "Toolbox" });

/** The widths and outlines drawn on an item and its parts: what makes a selected item look different without colour. */
const lines = (item: Locator): Promise<string> =>
  item.evaluate((element) =>
    [element, ...element.querySelectorAll("*")]
      .map((part) => {
        const style = getComputedStyle(part);
        return [style.strokeWidth, style.borderTopWidth, style.outlineWidth, style.boxShadow].join(",");
      })
      .join(";"),
  );

/** Whether the item says it is the selected one to assistive technology. */
async function marked(item: Locator): Promise<boolean> {
  const pressed = await item.getAttribute("aria-pressed");
  const current = await item.getAttribute("aria-current");
  return pressed === "true" || (current !== null && current !== "false");
}

async function expectOnlySelected(items: readonly Locator[], selected: number): Promise<void> {
  for (const [index, item] of items.entries()) {
    expect(await marked(item), `item ${String(index)} marked`).toBe(index === selected);
  }
  const others = items.filter((_, index) => index !== selected);
  const chosen = items[selected];
  if (!chosen) throw new Error("No such item");
  for (const other of others) expect(await lines(chosen)).not.toBe(await lines(other));
}

async function expectNoneSelected(items: readonly Locator[]): Promise<void> {
  for (const item of items) expect(await marked(item)).toBe(false);
}

async function exercise(page: Page, items: readonly [Locator, Locator]): Promise<void> {
  const [first, second] = items;
  await first.click();
  await expectOnlySelected(items, 0);

  await second.click();
  await expectOnlySelected(items, 1);

  await page.keyboard.press("Escape");
  await expectNoneSelected(items);

  await first.click();
  await expectOnlySelected(items, 0);
  const box = await canvas(page).boundingBox();
  if (!box) throw new Error("no canvas");
  await page.mouse.click(box.x + box.width - 60, box.y + 120);
  await expectNoneSelected(items);
}

test("a flowchart node and a connection show which is selected", async ({ page }) => {
  await page.goto("/new/flowchart");
  await toolbox(page).getByRole("button", { name: "Rectangle", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "Circle", exact: true }).click();
  const nodes = canvas(page).locator(".react-flow__node");
  await nodes.first().focus();
  await page.keyboard.press("Enter");
  await page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Connect…" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Circle / }).click();
  const edge = canvas(page).locator(".react-flow__edge").first();
  await expect(edge).toBeAttached();

  await exercise(page, [nodes.nth(0), nodes.nth(1)]);
  await edge.focus();
  await page.keyboard.press("Enter");
  expect(await marked(edge)).toBe(true);
  expect(await marked(nodes.nth(0))).toBe(false);
});

test("a sequence participant and a message show which is selected", async ({ page }) => {
  await page.goto("/new/sequence");
  await toolbox(page).getByRole("button", { name: "Participant", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "Actor", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "Solid arrow", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add message" });
  await dialog.getByRole("radiogroup", { name: "Sender" }).getByRole("radio").first().check();
  await dialog.getByRole("radiogroup", { name: "Receiver" }).getByRole("radio").nth(1).check();
  await dialog.getByRole("button", { name: "Add message" }).click();
  const participants = canvas(page).getByTestId("participant");
  const message = canvas(page).getByTestId("message").first();
  await expect(message).toBeAttached();

  await exercise(page, [participants.nth(0), participants.nth(1)]);
  await message.focus();
  await page.keyboard.press("Enter");
  expect(await marked(message)).toBe(true);
  expect(await marked(participants.nth(0))).toBe(false);
});

test("a C4 element, a boundary and a relationship show which is selected", async ({ page }) => {
  await page.goto("/new/c4/context");
  await toolbox(page).getByRole("button", { name: "Person", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "System", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "System boundary", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "One-way relationship", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add relationship" });
  await dialog.getByRole("radiogroup", { name: "Source" }).getByRole("radio").first().check();
  await dialog.getByRole("radiogroup", { name: "Target" }).getByRole("radio").nth(1).check();
  await dialog.getByRole("button", { name: "Add relationship" }).click();
  const elements = canvas(page).getByTestId("c4-element");
  const boundary = canvas(page).getByTestId("c4-boundary").first();
  const relationship = canvas(page).getByTestId("c4-relationship").first();
  await expect(relationship).toBeAttached();

  await exercise(page, [elements.nth(0), elements.nth(1)]);
  for (const other of [boundary, relationship]) {
    await other.focus();
    await page.keyboard.press("Enter");
    expect(await marked(other)).toBe(true);
    expect(await marked(elements.nth(0))).toBe(false);
  }
});
