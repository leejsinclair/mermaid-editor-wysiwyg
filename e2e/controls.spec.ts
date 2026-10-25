import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape, connect } from "./support/flowchart";

// VO-093 (EC-09, FR-005, FR-041): a control that needs a selection or input is offered only with one, and with a
// valid selection it does exactly what it advertises. Flowchart, Sequence and C4.

interface Scene {
  readonly canvas: Locator;
  readonly properties: Locator;
  readonly messages: Locator;
  readonly rectangle: Locator;
  readonly circle: Locator;
  readonly diamond: Locator;
}

/** A Rectangle joined to a Circle by a solid arrow, and a separate Diamond. */
async function scene(page: Page): Promise<Scene> {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await addShape(page, canvas, "Diamond", { x: 600, y: 80 });
  const rectangle = canvas.getByLabel(/^Rectangle node/);
  const circle = canvas.getByLabel(/^Circle node/);
  const diamond = canvas.getByLabel(/^Diamond node/);
  await connect(page, canvas, rectangle, circle, 1);
  return {
    canvas,
    properties: page.getByRole("region", { name: "Properties" }),
    messages: page.getByRole("status", { name: "Messages" }),
    rectangle,
    circle,
    diamond,
  };
}

// Spec 008 (FR-014): with nothing selected the panel offers no element action, and a selection is offered only the
// actions that apply to it, so no control can be used without the selection it needs.
const ELEMENT_ACTIONS = ["Rename", "Change type", "Connect…", "Change endpoints", "Reverse", "Move up", "Move down", "Move to…", "Delete"];

async function expectOffered(properties: Locator, offered: readonly string[]) {
  for (const name of ELEMENT_ACTIONS) await expect(properties.getByRole("button", { name, exact: true }), name).toHaveCount(offered.includes(name) ? 1 : 0);
}

test("with nothing selected no element control is offered", async ({ page }) => {
  const { properties } = await scene(page);
  await expectOffered(properties, []);
});

test("a selected node is offered no connection-only control", async ({ page }) => {
  const { properties, rectangle } = await scene(page);
  await rectangle.click();
  await expectOffered(properties, ["Rename", "Change type", "Connect…", "Delete"]);
});

test("Rename puts the cursor in the label field", async ({ page }) => {
  const { properties, rectangle } = await scene(page);
  await rectangle.click();

  await properties.getByRole("button", { name: "Rename", exact: true }).click();

  await expect(properties.getByRole("textbox", { name: "Label" })).toBeFocused();
});

test("Change type gives a node another shape and a connection another type", async ({ page }) => {
  const { canvas, properties } = await scene(page);

  await canvas.getByLabel(/^Rectangle node/).click();
  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hexagon", exact: true }).click();
  await expect(canvas.getByLabel("Hexagon node: Rectangle", { exact: true })).toHaveCount(1);
  await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);

  await canvas.locator(".react-flow__edge-interaction").click({ force: true });
  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "Dotted line", exact: true }).click();
  await expect(canvas.getByLabel(/^Dotted line connection from/)).toHaveCount(1);
});

test("Connect… lists the other nodes as label, type and number and joins the chosen one", async ({ page }) => {
  const { canvas, properties, rectangle } = await scene(page);
  await rectangle.click();

  await properties.getByRole("button", { name: "Connect…", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Connect to" });
  await expect(dialog.getByRole("button", { name: /^Circle \(Circle \d+\)$/ })).toBeVisible();
  await dialog.getByRole("button", { name: /^Diamond \(Diamond \d+\)$/ }).click();

  await expect(canvas.locator(".react-flow__edge")).toHaveCount(2);
  await expect(canvas.getByLabel(/connection from Rectangle to Diamond/)).toHaveCount(1);
});

test("Change endpoints moves the chosen end of the selected connection to the chosen node", async ({ page }) => {
  const { canvas, properties } = await scene(page);
  await canvas.locator(".react-flow__edge-interaction").click({ force: true });

  await properties.getByRole("button", { name: "Change endpoints", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Change end" });
  await dialog.getByRole("radio", { name: "End", exact: true }).check();
  await dialog.getByRole("button", { name: /^Diamond \(Diamond \d+\)$/ }).click();

  await expect(canvas.getByLabel(/connection from Rectangle to Diamond/)).toHaveCount(1);
});

test("Reverse turns the selected connection around", async ({ page }) => {
  const { canvas, properties } = await scene(page);
  await canvas.locator(".react-flow__edge-interaction").click({ force: true });

  await properties.getByRole("button", { name: "Reverse", exact: true }).click();

  await expect(canvas.getByLabel(/connection from Circle to Rectangle/)).toHaveCount(1);
});

test("Delete removes the selected node with its connection, or just the selected connection", async ({ page }) => {
  const { canvas, properties, rectangle, diamond } = await scene(page);

  await canvas.locator(".react-flow__edge-interaction").click({ force: true });
  await properties.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(canvas.locator(".react-flow__edge")).toHaveCount(0);
  await expect(rectangle).toHaveCount(1);

  await diamond.click();
  await properties.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(diamond).toHaveCount(0);
});

test("dragging a connection end to another node moves that end", async ({ page }) => {
  const { canvas, diamond } = await scene(page);
  // The end handle belongs to a selected line: it sits under the node's connection handle until the line is selected.
  await canvas.locator(".react-flow__edge").focus();
  await page.keyboard.press("Enter");
  const anchor = await canvas.locator(".react-flow__edgeupdater-target").boundingBox();
  const target = await diamond.locator('[data-side="top"]').boundingBox();
  if (!anchor || !target) throw new Error("The connection end and the target handle must be visible");

  await page.mouse.move(anchor.x + anchor.width / 2, anchor.y + anchor.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + 3, target.y + 3, { steps: 12 });
  await page.mouse.up();

  await expect(canvas.getByLabel(/connection from Rectangle to Diamond/)).toHaveCount(1);
});

/** Participants A (participant), B (actor) and C, and a message "go" from A to B; nothing else. */
async function sequenceScene(page: Page) {
  const support = await import("./support/sequence");
  await page.goto("#/new/sequence");
  await support.addParticipants(page, ["Participant", "A"], ["Actor", "B"], ["Participant", "C"]);
  await support.addMessage(page, "Solid arrow", "A", "B");
  await support.relabel(page, support.canvas(page).getByTestId("message").first(), "go");
  await page.keyboard.press("Escape");
  await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 5, y: 5 } });
  return { support, properties: page.getByRole("region", { name: "Properties" }), messages: page.getByRole("status", { name: "Messages" }) };
}

const selectItem = async (item: Locator, page: Page) => {
  await item.focus();
  await page.keyboard.press("Enter");
};

test("in a sequence diagram, with nothing selected no element control is offered", async ({ page }) => {
  const { properties } = await sequenceScene(page);
  await expectOffered(properties, []);
});

test("in a sequence diagram, a selected participant is offered no message-only control", async ({ page }) => {
  const { support, properties } = await sequenceScene(page);
  await selectItem(support.participantAt(page, 0), page);
  await expectOffered(properties, ["Rename", "Change type", "Connect…", "Move up", "Move down", "Delete"]);
});

test("in a sequence diagram, each control does what it advertises", async ({ page }) => {
  const { support, properties } = await sequenceScene(page);
  const names = () => support.participantNames(page);

  await selectItem(support.participantAt(page, 0), page);
  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "Actor", exact: true }).click();
  expect((await names())[0]).toBe("Actor: A");

  await properties.getByRole("button", { name: "Rename", exact: true }).click();
  await expect(properties.getByRole("textbox", { name: "Label" })).toBeFocused();

  await properties.getByRole("button", { name: "Connect…", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^C / }).click();
  expect(await support.messageTexts(page)).toEqual(["go", "Solid arrow"]);
  await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);

  await selectItem(support.canvas(page).getByTestId("message").nth(1), page);
  await properties.getByRole("button", { name: "Change endpoints", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^B / }).click();
  expect((await support.sourceLines(page)).at(-1)).toBe("p1->>p2: Solid arrow");
  await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);

  await properties.getByRole("button", { name: "Reverse", exact: true }).click();
  expect((await support.sourceLines(page)).at(-1)).toBe("p2->>p1: Solid arrow");

  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "Dashed cross", exact: true }).click();
  expect((await support.sourceLines(page)).at(-1)).toBe("p2--xp1: Solid arrow");

  await properties.getByRole("button", { name: "Delete", exact: true }).click();
  expect(await support.messageTexts(page)).toEqual(["go"]);
  expect(await names()).toHaveLength(3);
});

/** Customer (Person), Shop and Bank (Systems) in a Context diagram, and a relationship from Customer to Shop; nothing selected. */
async function c4Scene(page: Page) {
  const support = await import("./support/c4");
  await support.openNew(page, "context");
  await support.addItem(page, "Person", "Customer");
  await support.addItem(page, "System", "Shop");
  await support.addItem(page, "System", "Bank");
  await support.addRelationship(page, "One-way relationship", "Customer", "Shop");
  await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 5, y: 5 } });
  return { support, canvas: support.canvas(page), properties: page.getByRole("region", { name: "Properties" }), messages: page.getByRole("status", { name: "Messages" }) };
}

test("in a C4 diagram, with nothing selected no element control is offered", async ({ page }) => {
  const { properties } = await c4Scene(page);
  await expectOffered(properties, []);
});

test("in a C4 diagram, a selected element is offered no relationship-only control", async ({ page }) => {
  const { support, properties } = await c4Scene(page);
  await selectItem(support.itemLabelled(page, "Customer"), page);
  await expectOffered(properties, ["Rename", "Change type", "Connect…", "Move to…", "Delete"]);
});

test("in a C4 diagram, each control does what it advertises", async ({ page }) => {
  const { support, canvas, properties } = await c4Scene(page);

  await selectItem(support.itemLabelled(page, "Shop"), page);
  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "System database", exact: true }).click();
  expect(await support.itemNames(page)).toContain("System database: Shop");
  await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);

  await properties.getByRole("button", { name: "Rename", exact: true }).click();
  await expect(properties.getByRole("textbox", { name: "Label" })).toBeFocused();

  await selectItem(support.itemLabelled(page, "Customer"), page);
  await properties.getByRole("button", { name: "Connect…", exact: true }).click();
  await page.getByRole("dialog", { name: "Connect to" }).getByRole("button", { name: /^Bank \(System \d+\)$/ }).click();
  expect(await support.relationshipNames(page)).toEqual(["One-way relationship from Customer to Shop: Uses", "One-way relationship from Customer to Bank: Uses"]);
  await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);

  await selectItem(support.canvas(page).getByTestId("c4-relationship").nth(1), page);
  await properties.getByRole("button", { name: "Change endpoints", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Change end" });
  await dialog.getByRole("radio", { name: "Start", exact: true }).check();
  await dialog.getByRole("button", { name: /^Shop \(System database \d+\)$/ }).click();
  expect((await support.relationshipNames(page))[1]).toBe("One-way relationship from Shop to Bank: Uses");
  await expect(page.locator(".MuiBackdrop-root")).toHaveCount(0);

  await properties.getByRole("button", { name: "Reverse", exact: true }).click();
  expect((await support.relationshipNames(page))[1]).toBe("One-way relationship from Bank to Shop: Uses");

  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "Two-way relationship", exact: true }).click();
  expect((await support.relationshipNames(page))[1]).toBe("Two-way relationship from Bank to Shop: Uses");
  const reason = "This connection has no single direction, so reversing it would change nothing.";
  await expect(properties.getByRole("button", { name: "Reverse", exact: true })).toHaveAttribute("aria-disabled", "true");
  await expect(properties.getByText(reason)).toBeVisible();

  await properties.getByRole("button", { name: "Delete", exact: true }).click();
  expect(await support.relationshipNames(page)).toEqual(["One-way relationship from Customer to Shop: Uses"]);
  expect(await support.itemNames(page)).toHaveLength(3);
  await expect(canvas.getByTestId("c4-relationship")).toHaveCount(1);
});
