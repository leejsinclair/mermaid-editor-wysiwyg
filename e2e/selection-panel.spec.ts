import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape, connect } from "./support/flowchart";

// Spec 008, US2: the canvas and the Properties panel agree on what is selected, the panel names its type and offers only
// the actions that apply. VO-009 disabled and announced, VO-026 inline change shown, VO-029 same selection and type,
// VO-030 diagram and element actions apart, VO-047 a self-connection is allowed and cannot be reversed.

const ELEMENT_ACTIONS = ["Rename", "Change type", "Connect…", "Change endpoints", "Reverse", "Move to…", "Delete"];

interface Scene {
  readonly canvas: Locator;
  readonly properties: Locator;
  readonly rectangle: Locator;
  readonly circle: Locator;
  readonly edge: Locator;
}

/** A Rectangle joined to a Circle by a solid arrow. */
async function scene(page: Page): Promise<Scene> {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  const rectangle = canvas.getByLabel(/^Rectangle node/);
  const circle = canvas.getByLabel(/^Circle node/);
  await connect(page, canvas, rectangle, circle, 1);
  return { canvas, properties: page.getByRole("region", { name: "Properties" }), rectangle, circle, edge: canvas.locator(".react-flow__edge-interaction") };
}

const action = (properties: Locator, name: string) => properties.getByRole("button", { name, exact: true });

async function shownActions(properties: Locator): Promise<string[]> {
  const shown: string[] = [];
  for (const name of ELEMENT_ACTIONS) if ((await action(properties, name).count()) > 0) shown.push(name);
  return shown;
}

test("with nothing selected the panel offers getting-started help and no element action", async ({ page }) => {
  const { properties } = await scene(page);

  for (const step of ["1. Add a shape.", "2. Label it.", "3. Connect two shapes."]) await expect(properties.getByText(step)).toBeVisible();
  expect(await shownActions(properties)).toEqual([]);
});

test("a selected node is marked on the canvas and named by type in the panel, with only its actions", async ({ page }) => {
  const { canvas, properties, rectangle } = await scene(page);
  await rectangle.click();

  // The node wrapper carries the selected state as aria-current; the Rectangle was added first.
  const wrappers = canvas.locator(".react-flow__node");
  await expect(wrappers.nth(0)).toHaveAttribute("aria-current", "true");
  await expect(wrappers.nth(1)).not.toHaveAttribute("aria-current", "true");
  await expect(properties.getByText("Selected: Rectangle node", { exact: true })).toBeVisible();
  await expect(properties.getByRole("textbox", { name: "Label" })).toHaveValue("Rectangle");
  expect(await shownActions(properties)).toEqual(["Rename", "Change type", "Connect…", "Delete"]);
});

test("a label changed on the canvas is shown in the panel", async ({ page }) => {
  const { properties, rectangle } = await scene(page);
  await rectangle.click();
  await page.keyboard.press("F2");
  const editor = page.getByTestId("inline-label-editor");
  await editor.fill("Start");
  await editor.press("Enter");

  await expect(properties.getByRole("textbox", { name: "Label" })).toHaveValue("Start");
});

test("a selected connection shows its source, destination and direction, with Change endpoints", async ({ page }) => {
  const { properties, edge } = await scene(page);
  await edge.click({ force: true });

  await expect(properties.getByText("Selected: Solid arrow connection", { exact: true })).toBeVisible();
  await expect(properties.getByText("From: Rectangle (Rectangle 1)", { exact: true })).toBeVisible();
  await expect(properties.getByText("To: Circle (Circle 1)", { exact: true })).toBeVisible();
  await expect(properties.getByText("Direction: From Rectangle to Circle", { exact: true })).toBeVisible();
  expect(await shownActions(properties)).toEqual(["Rename", "Change type", "Change endpoints", "Reverse", "Delete"]);

  await action(properties, "Change endpoints").click();
  await expect(page.getByRole("dialog", { name: "Change end" })).toBeVisible();
});

test("diagram-level actions are in the toolbar and element-level actions in the Properties panel", async ({ page }) => {
  const { properties, rectangle } = await scene(page);
  await rectangle.click();
  const toolbar = page.getByRole("toolbar", { name: "Diagram actions" });

  for (const name of ["Undo", "Redo", "Copy Source", "Zoom in"]) await expect(properties.getByRole("button", { name, exact: true })).toHaveCount(0);
  for (const name of ["Delete", "Connect…", "Reverse", "Change endpoints"]) await expect(toolbar.getByRole("button", { name, exact: true })).toHaveCount(0);
  await expect(toolbar.getByRole("button", { name: "Undo", exact: true })).toBeVisible();
  await expect(action(properties, "Delete")).toBeVisible();
});

test("a self-connection is allowed, and Reverse on it is disabled and says why", async ({ page }) => {
  const { canvas, properties, edge } = await scene(page);
  await edge.click({ force: true });
  await action(properties, "Change endpoints").click();
  const dialog = page.getByRole("dialog", { name: "Change end" });
  await dialog.getByRole("radio", { name: "End", exact: true }).check();
  await dialog.getByRole("button", { name: /^Rectangle \(Rectangle \d+\)$/ }).click();
  await expect(canvas.getByLabel(/connection from Rectangle to Rectangle/)).toHaveCount(1);

  const reverse = action(properties, "Reverse");
  await expect(reverse).toHaveAttribute("aria-disabled", "true");
  const reason = "This connection starts and ends at the same item, so reversing it would change nothing.";
  await expect(properties.getByText(reason)).toBeVisible();
  await expect(reverse).toHaveAccessibleDescription(reason);

  // A pointer cannot activate an action marked unavailable, so the keyboard tries it.
  await reverse.press("Enter");
  await expect(canvas.getByLabel(/connection from Rectangle to Rectangle/)).toHaveCount(1);
});
