import { expect, test, type Page } from "@playwright/test";
import { seedRecords } from "./support/storage";
import { c4Record, canvas, dragBetween, itemLabelled, select, sourceLines } from "./support/c4";

// VO-057 (FR-019, FR-034): an element is moved into, out of and between boundaries by dragging and with Move to… from
// the keyboard; the canvas and the source show the new grouping after each move, and one Undo reverses each.

/** Customer at the top level; boundary Alpha holds Shop and Extra; boundary Beta holds Pat; Customer uses Shop. */
async function open(page: Page): Promise<void> {
  await page.goto("#/");
  await seedRecords(page, [
    c4Record(
      "groups",
      "Groups",
      "container",
      [
        { item: "element", id: 1, elementType: "person", label: "Customer" },
        { item: "boundary", id: 2, boundaryType: "system", label: "Alpha", children: [
          { item: "element", id: 3, elementType: "system", label: "Shop" },
          { item: "element", id: 7, elementType: "system", label: "Extra" },
        ] },
        { item: "boundary", id: 4, boundaryType: "generic", label: "Beta", children: [{ item: "element", id: 5, elementType: "system", label: "Pat" }] },
      ],
      [{ id: 6, from: 1, to: 3 }],
    ),
  ]);
  await page.goto("#/d/groups");
  await page.reload();
  await expect(canvas(page)).toBeVisible();
}

const START = ['Person(e1, "Customer")', 'System_Boundary(b2, "Alpha") {', 'System(e3, "Shop")', 'System(e7, "Extra")', "}", 'Boundary(b4, "Beta") {', 'System(e5, "Pat")', "}", 'Rel(e1, e3, "Uses")'];
const dialog = (page: Page) => page.getByRole("dialog", { name: "Move to" });
const moveTo = (page: Page) => page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Move to…" });
const header = (page: Page, label: string) => itemLabelled(page, label).getByTestId("item-label");

test("Move to… offers the top level and every boundary the item may go to, except where it already is", async ({ page }) => {
  await open(page);

  await select(page, itemLabelled(page, "Customer"));
  await moveTo(page).click();
  await expect(dialog(page).getByRole("button", { name: /^(Top level|Alpha|Beta)/ })).toHaveText([/^Alpha/, /^Beta/]);
  await dialog(page).getByRole("button", { name: "Cancel" }).click();

  await select(page, itemLabelled(page, "Shop"));
  await moveTo(page).click();
  await expect(dialog(page).getByRole("button", { name: /^(Top level|Alpha|Beta)/ })).toHaveText(["Top level", /^Beta/]);
});

test("an element is moved into a boundary, between boundaries and out to the top level from the keyboard, and one Undo reverses each", async ({ page }) => {
  await open(page);
  expect(await sourceLines(page)).toEqual(START);

  await select(page, itemLabelled(page, "Customer"));
  await moveTo(page).click();
  await dialog(page).getByRole("button", { name: /^Beta/ }).click();
  expect(await sourceLines(page)).toEqual(['System_Boundary(b2, "Alpha") {', 'System(e3, "Shop")', 'System(e7, "Extra")', "}", 'Boundary(b4, "Beta") {', 'System(e5, "Pat")', 'Person(e1, "Customer")', "}", 'Rel(e1, e3, "Uses")']);

  await moveTo(page).click();
  await dialog(page).getByRole("button", { name: /^Alpha/ }).click();
  expect(await sourceLines(page)).toEqual(['System_Boundary(b2, "Alpha") {', 'System(e3, "Shop")', 'System(e7, "Extra")', 'Person(e1, "Customer")', "}", 'Boundary(b4, "Beta") {', 'System(e5, "Pat")', "}", 'Rel(e1, e3, "Uses")']);

  await moveTo(page).click();
  await dialog(page).getByRole("button", { name: "Top level" }).click();
  expect(await sourceLines(page)).toEqual(['System_Boundary(b2, "Alpha") {', 'System(e3, "Shop")', 'System(e7, "Extra")', "}", 'Boundary(b4, "Beta") {', 'System(e5, "Pat")', "}", 'Person(e1, "Customer")', 'Rel(e1, e3, "Uses")']);

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await sourceLines(page)).slice(0, 5)).toEqual(['System_Boundary(b2, "Alpha") {', 'System(e3, "Shop")', 'System(e7, "Extra")', 'Person(e1, "Customer")', "}"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await sourceLines(page)).toEqual(START);
});

test("an element is dragged into a boundary and out to blank space, and one Undo reverses each", async ({ page }) => {
  await open(page);

  await dragBetween(page, itemLabelled(page, "Customer"), header(page, "Beta"));
  expect(await sourceLines(page)).toEqual(['System_Boundary(b2, "Alpha") {', 'System(e3, "Shop")', 'System(e7, "Extra")', "}", 'Boundary(b4, "Beta") {', 'System(e5, "Pat")', 'Person(e1, "Customer")', "}", 'Rel(e1, e3, "Uses")']);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await sourceLines(page)).toEqual(START);

  const area = await canvas(page).boundingBox();
  if (!area) throw new Error("The canvas is not visible");
  await dragBetween(page, itemLabelled(page, "Shop"), { x: area.x + area.width - 40, y: area.y + 16 });
  expect(await sourceLines(page)).toEqual(['Person(e1, "Customer")', 'System_Boundary(b2, "Alpha") {', 'System(e7, "Extra")', "}", 'Boundary(b4, "Beta") {', 'System(e5, "Pat")', "}", 'System(e3, "Shop")', 'Rel(e1, e3, "Uses")']);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await sourceLines(page)).toEqual(START);
});

test("a boundary cannot be moved into itself or into what it holds, so those are not offered", async ({ page }) => {
  await open(page);

  await select(page, itemLabelled(page, "Alpha"));
  await moveTo(page).click();

  await expect(dialog(page).getByRole("button", { name: /^(Top level|Alpha|Beta)/ })).toHaveText([/^Beta/]);
});
