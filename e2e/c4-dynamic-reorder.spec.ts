import { expect, test, type Page } from "@playwright/test";
import { exactly } from "./support/regexp";
import { addItem, addRelationship, canvas, dragBetween, itemLabelled, openNew, relabel, sourceLines } from "./support/c4";

// VO-052 (FR-033, FR-034): in a Dynamic diagram a relationship reordered by dragging and by Move up / Move down from
// the keyboard shows numbers on the canvas and in the source that follow the new order, and one Undo restores each.

const relationship = (page: Page, text: string) => canvas(page).getByTestId("c4-relationship").filter({ has: page.getByTestId("relationship-text").filter({ hasText: exactly(text) }) });

/** The relationships' numbers as drawn, in the order of their numbers: "1:one", "2:two" and so on. */
async function numbered(page: Page): Promise<string[]> {
  const drawn = await canvas(page)
    .getByTestId("c4-relationship")
    .evaluateAll((items) => items.map((item) => `${item.getAttribute("data-number") ?? ""}:${item.querySelector('[data-testid="relationship-text"]')?.textContent ?? ""}`));
  return drawn.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
}

async function build(page: Page): Promise<void> {
  await openNew(page, "dynamic");
  await addItem(page, "Person", "A");
  await addItem(page, "Container", "B");
  await addItem(page, "Component", "C");
  for (const [from, to, text] of [["A", "B", "one"], ["B", "C", "two"], ["C", "A", "three"]] as const) {
    await addRelationship(page, "One-way relationship", from, to);
    await relabel(page, canvas(page).getByTestId("c4-relationship").last(), text);
    await page.keyboard.press("Escape");
  }
}

test("each relationship shows its number, which is also the number in the source", async ({ page }) => {
  await build(page);

  expect(await numbered(page)).toEqual(["1:one", "2:two", "3:three"]);
  expect((await sourceLines(page)).slice(3)).toEqual(['RelIndex(1, e1, e2, "one")', 'RelIndex(2, e2, e3, "two")', 'RelIndex(3, e3, e1, "three")']);
});

test("a relationship dragged onto another takes its place, the numbers follow, and one Undo restores the order", async ({ page }) => {
  await build(page);

  await dragBetween(page, relationship(page, "three").getByTestId("relationship-text"), relationship(page, "one").getByTestId("relationship-text"));

  expect(await numbered(page)).toEqual(["1:three", "2:one", "3:two"]);
  expect((await sourceLines(page)).slice(3)).toEqual(['RelIndex(1, e3, e1, "three")', 'RelIndex(2, e1, e2, "one")', 'RelIndex(3, e2, e3, "two")']);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await numbered(page)).toEqual(["1:one", "2:two", "3:three"]);
});

test("Move up and Move down from the keyboard renumber, and one Undo restores each", async ({ page }) => {
  await build(page);
  const target = relationship(page, "one");
  await target.focus();
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "Move down" }).focus();
  await page.keyboard.press("Enter");
  expect(await numbered(page)).toEqual(["1:two", "2:one", "3:three"]);
  expect((await sourceLines(page)).slice(3)).toEqual(['RelIndex(1, e2, e3, "two")', 'RelIndex(2, e1, e2, "one")', 'RelIndex(3, e3, e1, "three")']);
  await page.getByRole("button", { name: "Move up" }).focus();
  await page.keyboard.press("Enter");
  expect(await numbered(page)).toEqual(["1:one", "2:two", "3:three"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await numbered(page)).toEqual(["1:two", "2:one", "3:three"]);
});

test("Move up on the first relationship changes nothing", async ({ page }) => {
  await build(page);
  await relationship(page, "one").focus();
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "Move up" }).focus();
  await page.keyboard.press("Enter");

  expect(await numbered(page)).toEqual(["1:one", "2:two", "3:three"]);
});

test("a Context diagram's relationships show no numbers and offer no Move up or Move down", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "A");
  await addItem(page, "System", "B");
  await addRelationship(page, "One-way relationship", "A", "B");

  await expect(canvas(page).getByTestId("c4-relationship").first()).not.toHaveAttribute("data-number", /.+/);
  await expect(page.getByRole("button", { name: "Move up" })).toHaveCount(0);
  await expect(itemLabelled(page, "A")).toBeVisible();
});
