import { expect, test, type Page } from "@playwright/test";
import { seedRecords } from "./support/storage";
import { addItem, addRelationship, c4Record, canvas, itemLabelled, itemNames, openNew, relationshipNames, select, sourceLines } from "./support/c4";

// VO-053 (FR-040): deleting an element removes its relationships and membership; deleting one relationship removes
// only it; deleting a boundary lifts what it held, in order, and says so.

const controls = (page: Page) => page.getByRole("region", { name: "Properties" });

test("deleting an element removes it and every relationship that starts or ends at it", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Shop");
  await addItem(page, "System", "Bank");
  await addRelationship(page, "One-way relationship", "Customer", "Shop");
  await addRelationship(page, "One-way relationship", "Shop", "Bank");
  await select(page, itemLabelled(page, "Shop"));

  await controls(page).getByRole("button", { name: "Delete" }).click();

  expect(await itemNames(page)).toEqual(["Person: Customer", "System: Bank"]);
  expect(await relationshipNames(page)).toEqual([]);
  expect(await sourceLines(page)).toEqual(['Person(e1, "Customer")', 'System(e3, "Bank")']);
});

test("deleting one relationship removes only that relationship", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Shop");
  await addRelationship(page, "One-way relationship", "Customer", "Shop");
  await addRelationship(page, "Two-way relationship", "Shop", "Customer");
  await select(page, canvas(page).getByTestId("c4-relationship").first());

  await controls(page).getByRole("button", { name: "Delete" }).click();

  expect(await itemNames(page)).toEqual(["Person: Customer", "System: Shop"]);
  expect(await relationshipNames(page)).toEqual(["Two-way relationship from Shop to Customer: Uses"]);
});

test("deleting a boundary lifts what it held, in order, removes nothing else, and names the boundary", async ({ page }) => {
  await page.goto("/");
  await seedRecords(page, [
    c4Record(
      "zone",
      "Zones",
      "context",
      [
        { item: "element", id: 1, elementType: "person", label: "Customer" },
        { item: "boundary", id: 2, boundaryType: "generic", label: "Zone", children: [
          { item: "element", id: 3, elementType: "system", label: "Shop" },
          { item: "element", id: 4, elementType: "system", label: "Bank" },
        ] },
      ],
      [{ id: 5, from: 1, to: 3 }],
    ),
  ]);
  await page.goto("/d/zone");
  await select(page, itemLabelled(page, "Zone"));

  await controls(page).getByRole("button", { name: "Delete" }).click();

  await expect(page.getByRole("status", { name: "Messages" })).toContainText('The boundary "Zone" was deleted. What it held moved up one level.');
  expect(await itemNames(page)).toEqual(["Person: Customer", "System: Shop", "System: Bank"]);
  expect(await relationshipNames(page)).toEqual(["One-way relationship from Customer to Shop: Uses"]);
  expect(await sourceLines(page)).toEqual(['Person(e1, "Customer")', 'System(e3, "Shop")', 'System(e4, "Bank")', 'Rel(e1, e3, "Uses")']);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await itemNames(page)).toEqual(["Person: Customer", "Boundary: Zone", "System: Shop", "System: Bank"]);
});
