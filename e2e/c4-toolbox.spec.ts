import { expect, test } from "@playwright/test";
import { addItem, addRelationship, canvas, dragBetween, itemLabelled, openNew, relationshipNames, select, sourceLines, toolboxButton, toolboxNames, type Kind } from "./support/c4";

// VO-047 (FR-031, FR-019): each C4 kind offers exactly its own elements and boundaries; activating an element button adds
// it at the top level; a relationship is made through the target list or by dragging from one element to another; and
// either end of a relationship is moved by dragging it to another element.

const PERSON = ["Person", "External person"];
const SYSTEMS = ["System", "System database", "System queue", "External system", "External system database", "External system queue"];
const SYSTEM_ONLY = ["System", "External system"];
const CONTAINERS = ["Container", "Container database", "Container queue", "External container", "External container database", "External container queue"];
const CONTAINER_ONLY = ["Container", "External container"];
const COMPONENTS = ["Component", "Component database", "Component queue", "External component", "External component database", "External component queue"];

const OFFERED: readonly (readonly [Kind, string[], string[], string])[] = [
  ["context", [...PERSON, ...SYSTEMS], ["Enterprise boundary", "System boundary", "Boundary"], "Boundaries"],
  ["container", [...PERSON, ...SYSTEM_ONLY, ...CONTAINERS], ["System boundary", "Container boundary", "Boundary"], "Boundaries"],
  ["component", [...PERSON, ...SYSTEM_ONLY, ...CONTAINER_ONLY, ...COMPONENTS], ["Container boundary", "Boundary"], "Boundaries"],
  ["dynamic", [...PERSON, ...SYSTEM_ONLY, ...CONTAINER_ONLY, ...COMPONENTS], ["Container boundary", "Boundary"], "Boundaries"],
  ["deployment", ["Container"], ["Deployment node"], "Deployment nodes"],
];

for (const [kind, elements, containers, containerGroup] of OFFERED) {
  test(`a ${kind} diagram offers exactly its own elements, boundaries and relationships`, async ({ page }) => {
    await openNew(page, kind);

    expect(await toolboxNames(page, "Elements")).toEqual(elements);
    expect(await toolboxNames(page, containerGroup)).toEqual(containers);
    expect(await toolboxNames(page, "Relationships")).toEqual(["One-way relationship", "Two-way relationship"]);
    await expect(page.getByRole("region", { name: "Toolbox" }).getByRole("group")).toHaveCount(3);
  });
}

test("activating an element button adds it at the top level, labelled with its type's name", async ({ page }) => {
  await openNew(page, "container");

  await expect(toolboxButton(page, "System database")).toHaveCount(0);
  await expect(canvas(page).getByTestId("c4-element")).toHaveCount(0);
  await toolboxButton(page, "Container database").click();

  await expect(canvas(page).getByTestId("c4-element")).toHaveCount(1);
  await expect(canvas(page).getByTestId("c4-element").first()).toHaveAccessibleName("Container database: Container database");
  expect(await sourceLines(page)).toEqual(['ContainerDb(e1, "Container database")']);
});

test("a relationship is created through the target list, source then target", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Shop");

  await addRelationship(page, "One-way relationship", "Customer", "Shop");
  await addRelationship(page, "Two-way relationship", "Shop", "Customer");

  expect(await relationshipNames(page)).toEqual(["One-way relationship from Customer to Shop: Uses", "Two-way relationship from Shop to Customer: Uses"]);
  expect((await sourceLines(page)).slice(2)).toEqual(['Rel(e1, e2, "Uses")', 'BiRel(e2, e1, "Uses")']);
});

test("with one element selected, both ends of a new relationship default to it", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "System", "Shop");
  await addItem(page, "Person", "Customer");
  await select(page, itemLabelled(page, "Shop"));

  await toolboxButton(page, "One-way relationship").click();

  const dialog = page.getByRole("dialog", { name: "Add relationship" });
  await expect(dialog.getByRole("radiogroup", { name: "Source" }).getByRole("radio", { checked: true })).toHaveAccessibleName(/^Shop /);
  await expect(dialog.getByRole("radiogroup", { name: "Target" }).getByRole("radio", { checked: true })).toHaveAccessibleName(/^Shop /);
  await dialog.getByRole("button", { name: "Add relationship" }).click();
  expect(await relationshipNames(page)).toEqual(["One-way relationship from Shop to Shop: Uses"]);
});

test("a relationship is created by dragging from one element to another", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Shop");

  await dragBetween(page, itemLabelled(page, "Customer"), itemLabelled(page, "Shop"));

  expect(await relationshipNames(page)).toEqual(["One-way relationship from Customer to Shop: Uses"]);
  expect((await sourceLines(page)).slice(2)).toEqual(['Rel(e1, e2, "Uses")']);
});

test("a relationship end is moved by dragging it to another element, and Undo restores it", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Shop");
  await addItem(page, "System", "Bank");
  await addRelationship(page, "One-way relationship", "Customer", "Shop");
  await select(page, canvas(page).getByTestId("c4-relationship").first());

  await dragBetween(page, canvas(page).getByTestId("relationship-end-to"), itemLabelled(page, "Bank"));

  expect(await relationshipNames(page)).toEqual(["One-way relationship from Customer to Bank: Uses"]);
  expect((await sourceLines(page)).slice(3)).toEqual(['Rel(e1, e3, "Uses")']);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await relationshipNames(page)).toEqual(["One-way relationship from Customer to Shop: Uses"]);
});
