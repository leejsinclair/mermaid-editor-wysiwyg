import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { readClipboard } from "./support/clipboard";

// VO-062 (FR-019, WCAG 2.1.1 and 2.5.7): in each type, every operation completes with the keyboard alone: no click, no drag.

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const properties = (page: Page) => page.getByRole("region", { name: "Properties" });
const toolbox = (page: Page) => page.getByRole("region", { name: "Toolbox" });
const messages = (page: Page) => page.getByRole("status", { name: "Messages" });

/** Moves focus to the control and presses a key on it: what a keyboard user does. */
async function press(page: Page, target: Locator, key = "Enter"): Promise<void> {
  await target.focus();
  await page.keyboard.press(key);
}

/** Chooses an option in a radio group by focusing it and pressing Space. */
async function choose(page: Page, group: Locator, name: RegExp): Promise<void> {
  await press(page, group.getByRole("radio", { name }), "Space");
}

async function rename(page: Page, text: string): Promise<void> {
  const field = properties(page).getByRole("textbox", { name: "Label" });
  await field.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(text);
  await page.keyboard.press("Enter");
}

async function changeType(page: Page, name: string): Promise<void> {
  await press(page, properties(page).getByRole("button", { name: "Change type", exact: true }));
  await press(page, page.getByRole("menuitem", { name, exact: true }));
}

async function undoThenRedo(page: Page, count: Locator, before: number, after: number): Promise<void> {
  await page.keyboard.press("ControlOrMeta+Z");
  await expect(count).toHaveCount(before);
  await page.keyboard.press("ControlOrMeta+Shift+Z");
  await expect(count).toHaveCount(after);
}

/** Both copy actions, then Save file, then Open file from the start screen: all with the keyboard. */
async function copiesSaveAndOpen(page: Page, drawn: Locator, count: number): Promise<void> {
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await press(page, page.getByRole("button", { name: "Copy Source" }));
  await expect(messages(page)).toContainText("Source copied.");
  expect(await readClipboard(page)).not.toBe("");
  await press(page, page.getByRole("button", { name: "Copy for Markdown" }));
  await expect(messages(page)).toContainText("Source copied for Markdown.");

  const download = page.waitForEvent("download");
  await press(page, page.getByRole("button", { name: "Save file" }));
  const file = await (await download).path();
  expect(JSON.parse(await readFile(file, "utf8"))).toMatchObject({ format: "mermaid-editor-wysiwyg" });

  await page.goto("#/");
  const chooser = page.waitForEvent("filechooser");
  await press(page, page.getByRole("button", { name: "Open file…" }));
  await (await chooser).setFiles(file);
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(drawn).toHaveCount(count);
}

test("a flowchart is built and edited with the keyboard alone", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const nodes = canvas(page).locator(".react-flow__node");
  const edges = canvas(page).locator(".react-flow__edge");

  // Add: activating a toolbox button places a node and opens its label, which takes focus; Enter keeps the label and goes on (spec 008, FR-004).
  for (const shape of ["Rectangle", "Diamond", "Circle"]) {
    await press(page, toolbox(page).getByRole("button", { name: shape, exact: true }));
    await page.getByTestId("inline-label-editor").press("Enter");
  }
  await expect(nodes).toHaveCount(3);

  // Select, move, rename, change type.
  await press(page, nodes.first());
  await expect(properties(page).getByRole("textbox", { name: "Label" })).toHaveValue(/./);
  const before = await nodes.first().boundingBox();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect.poll(async () => (await nodes.first().boundingBox())?.x).toBeGreaterThan(before?.x ?? 0);
  await rename(page, "Start");
  await expect(nodes.first().getByTestId("node-label")).toHaveText("Start");
  await changeType(page, "Stadium");
  await expect(nodes.first()).toHaveAttribute("aria-label", /^Stadium node: Start/);

  // Connect to a node chosen from a list; change an end of the connection.
  await press(page, properties(page).getByRole("button", { name: "Connect…" }));
  await press(page, page.getByRole("dialog").getByRole("button", { name: /^Diamond \(Diamond 1\)/ }));
  await expect(edges).toHaveCount(1);
  await press(page, edges.first());
  await press(page, properties(page).getByRole("button", { name: "Change endpoints" }));
  await press(page, page.getByRole("dialog").getByRole("radio", { name: "End" }), "Space");
  await press(page, page.getByRole("dialog").getByRole("button", { name: /^Circle \(Circle 1\)/ }));
  await expect(edges).toHaveCount(1);
  await expect(edges.first()).toHaveAttribute("aria-label", /to Circle$/);

  // Delete, undo, redo.
  await press(page, nodes.nth(1));
  await page.keyboard.press("Delete");
  await expect(nodes).toHaveCount(2);
  await undoThenRedo(page, nodes, 3, 2);

  await copiesSaveAndOpen(page, nodes, 2);
});

test("a sequence diagram is built and edited with the keyboard alone", async ({ page }) => {
  await page.goto("#/new/sequence");
  const participants = canvas(page).getByTestId("participant");
  const rows = canvas(page).getByTestId("message");

  // Activating a toolbox button adds a participant and opens its label, which takes focus; Enter keeps the label and goes on (spec 008, FR-004).
  for (const role of ["Participant", "Actor", "Participant"]) {
    await press(page, toolbox(page).getByRole("button", { name: role, exact: true }));
    await page.getByTestId("inline-label-editor").press("Enter");
  }
  await expect(participants).toHaveCount(3);
  await press(page, participants.first());
  await rename(page, "Alice");
  await changeType(page, "Actor");
  await expect(participants.first()).toHaveAttribute("aria-label", /^Actor: Alice/);

  await press(page, toolbox(page).getByRole("button", { name: "Solid arrow", exact: true }));
  const dialog = page.getByRole("dialog", { name: "Add message" });
  await choose(page, dialog.getByRole("radiogroup", { name: "Sender" }), /^Alice /);
  await choose(page, dialog.getByRole("radiogroup", { name: "Receiver" }), /^Actor /);
  await press(page, dialog.getByRole("button", { name: "Add message" }));
  await expect(rows).toHaveCount(1);

  await press(page, toolbox(page).getByRole("button", { name: "Dashed arrow", exact: true }));
  await choose(page, dialog.getByRole("radiogroup", { name: "Sender" }), /^Alice /);
  await choose(page, dialog.getByRole("radiogroup", { name: "Receiver" }), /^Participant /);
  await press(page, dialog.getByRole("button", { name: "Add message" }));
  await expect(rows).toHaveCount(2);

  // Reorder, connect, change an end.
  const order = () => canvas(page).getByTestId("message-text").allTextContents();
  const first = await order();
  await press(page, rows.nth(1));
  await press(page, properties(page).getByRole("button", { name: "Move up" }));
  expect(await order()).toEqual([...first].reverse());
  await press(page, properties(page).getByRole("button", { name: "Change endpoints" }));
  await press(page, page.getByRole("dialog").getByRole("radio", { name: "End" }), "Space");
  await press(page, page.getByRole("dialog").getByRole("button").filter({ hasText: /\(Participant 1\)$/ }).first());

  await press(page, participants.first());
  await press(page, properties(page).getByRole("button", { name: "Connect…" }));
  await press(page, page.getByRole("dialog").getByRole("button").filter({ hasText: /\(Participant 1\)$/ }).first());
  await expect(rows).toHaveCount(3);

  // Delete, undo, redo.
  await press(page, participants.nth(2));
  await press(page, properties(page).getByRole("button", { name: "Delete" }));
  await expect(participants).toHaveCount(2);
  await undoThenRedo(page, participants, 3, 2);

  await copiesSaveAndOpen(page, participants, 2);
});

test("a C4 diagram is built and edited with the keyboard alone", async ({ page }) => {
  await page.goto("#/new/c4/context");
  const items = canvas(page).locator('[data-testid="c4-element"], [data-testid="c4-boundary"]');
  const elements = canvas(page).getByTestId("c4-element");
  const relationships = canvas(page).getByTestId("c4-relationship");

  // Activating a toolbox button adds an item and opens its label, which takes focus; Enter keeps the label and goes on (spec 008, FR-004).
  for (const type of ["Person", "System", "System", "System boundary"]) {
    await press(page, toolbox(page).getByRole("button", { name: type, exact: true }));
    await page.getByTestId("inline-label-editor").press("Enter");
  }
  await expect(items).toHaveCount(4);

  await press(page, elements.first());
  await rename(page, "Customer");
  await changeType(page, "External person");
  await expect(elements.first()).toHaveAttribute("aria-label", /^External person: Customer/);

  await press(page, toolbox(page).getByRole("button", { name: "One-way relationship", exact: true }));
  const dialog = page.getByRole("dialog", { name: "Add relationship" });
  await choose(page, dialog.getByRole("radiogroup", { name: "Source" }), /^Customer /);
  await choose(page, dialog.getByRole("radiogroup", { name: "Target" }), /^System \(System 1\)/);
  await press(page, dialog.getByRole("button", { name: "Add relationship" }));
  await expect(relationships).toHaveCount(1);

  // Change an end; change boundary membership.
  await press(page, relationships.first());
  await press(page, properties(page).getByRole("button", { name: "Change endpoints" }));
  await press(page, page.getByRole("dialog").getByRole("radio", { name: "End" }), "Space");
  await press(page, page.getByRole("dialog").getByRole("button").filter({ hasText: /\(System 2\)$/ }).first());
  await press(page, elements.nth(1));
  await press(page, properties(page).getByRole("button", { name: "Move to…" }));
  await press(page, page.getByRole("dialog").getByRole("button").filter({ hasText: /^(?!Top level)/ }).first());

  await press(page, elements.first());
  await press(page, properties(page).getByRole("button", { name: "Connect…" }));
  await press(page, page.getByRole("dialog").getByRole("button").filter({ hasText: /\(System 1\)$/ }).first());
  await expect(relationships).toHaveCount(2);

  // Delete, undo, redo.
  await press(page, elements.nth(2));
  await press(page, properties(page).getByRole("button", { name: "Delete" }));
  await expect(elements).toHaveCount(2);
  await undoThenRedo(page, elements, 3, 2);

  await copiesSaveAndOpen(page, elements, 2);
});

// Spec 008, VO-020 (FR-034, US6-AS1, US6-AS2): at the narrowest supported width the same edits complete with the keyboard
// alone, through the Tools panel, and the page never scrolls sideways.
test("at 360 px a flowchart is built and edited with the keyboard alone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("#/new/flowchart");
  const nodes = canvas(page).locator(".react-flow__node");
  const edges = canvas(page).locator(".react-flow__edge");
  const tools = page.getByRole("button", { name: "Tools", exact: true });
  const noSidewaysScroll = async () => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page scrolls sideways").toBe(true);
  };

  await press(page, tools);
  for (const shape of ["Rectangle", "Circle"]) {
    await press(page, toolbox(page).getByRole("button", { name: shape, exact: true }));
    await page.getByTestId("inline-label-editor").press("Enter");
  }
  await expect(nodes).toHaveCount(2);
  await noSidewaysScroll();

  await press(page, nodes.first());
  const before = await nodes.first().getAttribute("style");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => nodes.first().getAttribute("style")).not.toBe(before);

  await press(page, properties(page).getByRole("button", { name: "Connect…", exact: true }));
  await press(page, page.getByRole("dialog").getByRole("button", { name: /^Circle \(Circle 1\)/ }));
  await expect(edges).toHaveCount(1);
  await noSidewaysScroll();

  await press(page, nodes.nth(1));
  await press(page, properties(page).getByRole("button", { name: "Delete", exact: true }));
  await expect(nodes).toHaveCount(1);
  await undoThenRedo(page, nodes, 2, 1);
  await noSidewaysScroll();
});
