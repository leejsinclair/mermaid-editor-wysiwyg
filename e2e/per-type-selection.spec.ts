import { expect, test, type Locator, type Page } from "@playwright/test";
import { addItem, addRelationship, itemLabelled, openNew, select } from "./support/c4";
import { addMessage, addParticipants, participantLabelled } from "./support/sequence";

// Spec 008, US2 for the sequence and C4 editors (Clarifications 2026-10-24). VO-006 getting-started help in the type's own words
// and no element action while nothing is selected, VO-008 a selected message or relationship shows its ends and direction and
// offers Change endpoints, VO-009 an action that cannot be used now is disabled and says why.

const ELEMENT_ACTIONS = ["Rename", "Change type", "Connect…", "Change endpoints", "Reverse", "Move to…", "Move up", "Move down", "Delete"];

const panelOf = (page: Page) => page.getByRole("region", { name: "Properties" });
const action = (properties: Locator, name: string) => properties.getByRole("button", { name, exact: true });

async function shownActions(properties: Locator): Promise<string[]> {
  const shown: string[] = [];
  for (const name of ELEMENT_ACTIONS) if ((await action(properties, name).count()) > 0) shown.push(name);
  return shown;
}

test.describe("a sequence diagram", () => {
  async function scene(page: Page): Promise<Locator> {
    await page.goto("#/new/sequence");
    await addParticipants(page, ["Participant", "Alice"], ["Participant", "Bob"]);
    await addMessage(page, "Solid arrow", "Alice", "Bob");
    await page.keyboard.press("Escape");
    return panelOf(page);
  }

  test("with nothing selected the panel offers the sequence getting-started steps and no element action", async ({ page }) => {
    const properties = await scene(page);
    for (const step of ["1. Add a participant.", "2. Label it.", "3. Draw a message between two participants."]) await expect(properties.getByText(step, { exact: true })).toBeVisible();
    await expect(properties.getByText("1. Add a shape.")).toHaveCount(0);
    expect(await shownActions(properties)).toEqual([]);
  });

  test("a selected participant is named by type with only its actions, and Move up says why it is unavailable", async ({ page }) => {
    const properties = await scene(page);
    await select(page, participantLabelled(page, "Alice"));

    await expect(participantLabelled(page, "Alice")).toHaveAttribute("aria-pressed", "true");
    await expect(properties.getByText("Selected: Participant", { exact: true })).toBeVisible();
    expect(await shownActions(properties)).toEqual(["Rename", "Change type", "Connect…", "Move up", "Move down", "Delete"]);

    const up = action(properties, "Move up");
    await expect(up).toHaveAttribute("aria-disabled", "true");
    await expect(properties.getByText("It is already first.")).toBeVisible();
    await expect(up).toHaveAccessibleDescription("It is already first.");
    await expect(action(properties, "Move down")).not.toHaveAttribute("aria-disabled", "true");
    // A pointer cannot activate an action marked unavailable, so the keyboard tries it: the order stays as it was.
    await up.press("Enter");
    await expect(page.getByRole("region", { name: "Diagram canvas" }).getByTestId("participant").first()).toHaveAttribute("aria-label", "Participant: Alice");
  });

  test("a selected message shows its sender, receiver and direction, and offers Change endpoints", async ({ page }) => {
    const properties = await scene(page);
    await select(page, page.getByRole("region", { name: "Diagram canvas" }).getByTestId("message"));

    await expect(properties.getByText("Selected: Solid arrow message", { exact: true })).toBeVisible();
    await expect(properties.getByText(/^From: Alice/)).toBeVisible();
    await expect(properties.getByText(/^To: Bob/)).toBeVisible();
    await expect(properties.getByText("Direction: From Alice to Bob", { exact: true })).toBeVisible();
    expect(await shownActions(properties)).toEqual(["Rename", "Change type", "Change endpoints", "Reverse", "Move up", "Move down", "Delete"]);

    await action(properties, "Change endpoints").click();
    await expect(page.getByRole("dialog", { name: "Change end" })).toBeVisible();
  });
});

test.describe("a C4 diagram", () => {
  async function scene(page: Page): Promise<Locator> {
    await openNew(page, "context");
    await addItem(page, "Person", "Customer");
    await addItem(page, "System", "Bank");
    await addRelationship(page, "One-way relationship", "Customer", "Bank");
    await page.keyboard.press("Escape");
    return panelOf(page);
  }

  test("with nothing selected the panel offers the C4 getting-started steps and no element action", async ({ page }) => {
    const properties = await scene(page);
    for (const step of ["1. Add an element.", "2. Label it.", "3. Connect two elements with a relationship."]) await expect(properties.getByText(step, { exact: true })).toBeVisible();
    await expect(properties.getByText("1. Add a shape.")).toHaveCount(0);
    expect(await shownActions(properties)).toEqual([]);
  });

  test("a selected element is named by type with only its actions", async ({ page }) => {
    const properties = await scene(page);
    await select(page, itemLabelled(page, "Customer"));

    await expect(itemLabelled(page, "Customer")).toHaveAttribute("aria-pressed", "true");
    await expect(properties.getByText("Selected: Person", { exact: true })).toBeVisible();
    expect(await shownActions(properties)).toEqual(["Rename", "Change type", "Connect…", "Move to…", "Delete"]);
  });

  test("a selected relationship shows its source, target and direction, and offers Change endpoints", async ({ page }) => {
    const properties = await scene(page);
    await select(page, page.getByRole("region", { name: "Diagram canvas" }).getByTestId("c4-relationship"));

    await expect(properties.getByText("Selected: One-way relationship", { exact: true })).toBeVisible();
    await expect(properties.getByText(/^From: Customer/)).toBeVisible();
    await expect(properties.getByText(/^To: Bank/)).toBeVisible();
    await expect(properties.getByText("Direction: From Customer to Bank", { exact: true })).toBeVisible();
    expect(await shownActions(properties)).toEqual(["Rename", "Change type", "Change endpoints", "Reverse", "Delete"]);

    await action(properties, "Change endpoints").click();
    await expect(page.getByRole("dialog", { name: "Change end" })).toBeVisible();
  });
});
