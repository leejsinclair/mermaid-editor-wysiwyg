import { expect, test, type Page } from "@playwright/test";
import { addItem, itemLabelled, openNew, select, sourceLines } from "./support/c4";

// VO-049 (FR-005, FR-032): a C4 element's description and, for types that have one, its technology are edited in the
// Properties panel and confirmed like a label; technology is offered only where the type has one.

const properties = (page: Page) => page.getByRole("region", { name: "Properties" });

test("an element's description is edited, confirmed with Enter and written to the source, and cleared by emptying it", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "System", "Shop");
  await select(page, itemLabelled(page, "Shop"));

  const description = properties(page).getByRole("textbox", { name: "Description" });
  await description.fill("Sells things");
  await description.press("Enter");

  expect(await sourceLines(page)).toEqual(['System(e1, "Shop", "Sells things")']);
  await description.fill("");
  await description.press("Enter");
  expect(await sourceLines(page)).toEqual(['System(e1, "Shop")']);
});

test("Escape cancels a description being typed", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "System", "Shop");
  await select(page, itemLabelled(page, "Shop"));

  const description = properties(page).getByRole("textbox", { name: "Description" });
  await description.fill("Never kept");
  await description.press("Escape");

  await expect(description).toHaveValue("");
  expect(await sourceLines(page)).toEqual(['System(e1, "Shop")']);
});

test("technology is offered for a Container and not for a System", async ({ page }) => {
  await openNew(page, "container");
  await addItem(page, "System", "Shop");
  await addItem(page, "Container", "Api");

  await select(page, itemLabelled(page, "Shop"));
  await expect(properties(page).getByRole("textbox", { name: "Technology" })).toHaveCount(0);
  await select(page, itemLabelled(page, "Api"));
  const technology = properties(page).getByRole("textbox", { name: "Technology" });
  await technology.fill("Go");
  await technology.press("Enter");

  expect(await sourceLines(page)).toEqual(['System(e1, "Shop")', 'Container(e2, "Api", "Go")']);
});

test("a boundary has a label only", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Boundary", "Zone");
  await select(page, itemLabelled(page, "Zone"));

  await expect(properties(page).getByRole("textbox", { name: "Label" })).toHaveValue("Zone");
  await expect(properties(page).getByRole("textbox", { name: "Description" })).toHaveCount(0);
});
