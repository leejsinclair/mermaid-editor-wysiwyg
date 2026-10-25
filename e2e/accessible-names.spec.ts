import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-072 (FR-020): every item and connection on each type's canvas has an accessible name stating its type, label and
// ends where it has them, and shows a visible focus indicator when it has keyboard focus.

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const toolbox = (page: Page) => page.getByRole("region", { name: "Toolbox" });
const properties = (page: Page) => page.getByRole("region", { name: "Properties" });

async function activate(page: Page, button: Locator): Promise<void> {
  await button.focus();
  await page.keyboard.press("Enter");
}

/** Names an item just added in the label editor that opens on it (spec 008), and confirms with Enter. */
async function nameNew(page: Page, text: string): Promise<void> {
  const editor = page.getByTestId("inline-label-editor");
  await expect(editor).toBeFocused();
  await editor.fill(text);
  await editor.press("Enter");
  await expect(editor).toHaveCount(0);
}

async function relabel(page: Page, item: Locator, text: string): Promise<void> {
  await item.focus();
  await page.keyboard.press("Enter");
  const field = properties(page).getByRole("textbox", { name: "Label" });
  await field.fill(text);
  await field.press("Enter");
}

/** What shows keyboard focus: an outline, a shadow or a filter. */
const indicator = (item: Locator): Promise<string> =>
  item.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.outlineStyle === "none" || style.outlineWidth === "0px" ? "" : `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`, style.boxShadow, style.filter].join("|");
  });

/** Presses Tab from the first toolbox button until the item has focus, as a keyboard user reaches it. */
async function tabTo(page: Page, item: Locator): Promise<void> {
  await toolbox(page).getByRole("button").first().focus();
  for (let presses = 0; presses < 80; presses += 1) {
    await page.keyboard.press("Tab");
    if (await item.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("The item cannot be reached with Tab");
}

async function expectNamedWithVisibleFocus(page: Page, item: Locator, name: RegExp): Promise<void> {
  await expect(item).toHaveAttribute("aria-label", name);
  const resting = await indicator(item);
  await tabTo(page, item);
  expect(await indicator(item)).not.toBe(resting);
}

test("flowchart nodes and connections are named by type, label and ends, with a visible focus indicator", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await activate(page, toolbox(page).getByRole("button", { name: "Rectangle", exact: true }));
  await activate(page, toolbox(page).getByRole("button", { name: "Diamond", exact: true }));
  const nodes = canvas(page).locator(".react-flow__node");
  await relabel(page, nodes.nth(0), "Start");
  await relabel(page, nodes.nth(1), "Approve?");
  await nodes.nth(0).focus();
  await page.keyboard.press("Enter");
  await activate(page, properties(page).getByRole("button", { name: "Connect…" }));
  await activate(page, page.getByRole("dialog").getByRole("button", { name: /^Approve\? / }));

  await expectNamedWithVisibleFocus(page, nodes.nth(0), /^Rectangle node: Start$/);
  await expectNamedWithVisibleFocus(page, nodes.nth(1), /^Diamond node: Approve\?$/);
  await expectNamedWithVisibleFocus(page, canvas(page).locator(".react-flow__edge").first(), /^Solid arrow connection from Start to Approve\?$/);
});

test("sequence participants and messages are named by type, label and ends, with a visible focus indicator", async ({ page }) => {
  await page.goto("#/new/sequence");
  await activate(page, toolbox(page).getByRole("button", { name: "Participant", exact: true }));
  await nameNew(page, "Alice");
  await activate(page, toolbox(page).getByRole("button", { name: "Actor", exact: true }));
  await nameNew(page, "Bob");
  const participants = canvas(page).getByTestId("participant");
  await activate(page, toolbox(page).getByRole("button", { name: "Dashed open arrow", exact: true }));
  const dialog = page.getByRole("dialog", { name: "Add message" });
  await dialog.getByRole("radiogroup", { name: "Sender" }).getByRole("radio", { name: /^Alice / }).focus();
  await page.keyboard.press("Space");
  await dialog.getByRole("radiogroup", { name: "Receiver" }).getByRole("radio", { name: /^Bob / }).focus();
  await page.keyboard.press("Space");
  await activate(page, dialog.getByRole("button", { name: "Add message" }));
  await relabel(page, canvas(page).getByTestId("message").first(), "OK");

  await expectNamedWithVisibleFocus(page, participants.nth(0), /^Participant: Alice$/);
  await expectNamedWithVisibleFocus(page, participants.nth(1), /^Actor: Bob$/);
  await expectNamedWithVisibleFocus(page, canvas(page).getByTestId("message").first(), /^Dashed open arrow from Alice to Bob: OK$/);
});

test("C4 elements and relationships are named by type, label and ends, with a visible focus indicator", async ({ page }) => {
  await page.goto("#/new/c4/context");
  await activate(page, toolbox(page).getByRole("button", { name: "Person", exact: true }));
  await nameNew(page, "Customer");
  await activate(page, toolbox(page).getByRole("button", { name: "System", exact: true }));
  await nameNew(page, "Shop");
  const elements = canvas(page).getByTestId("c4-element");
  await activate(page, toolbox(page).getByRole("button", { name: "One-way relationship", exact: true }));
  const dialog = page.getByRole("dialog", { name: "Add relationship" });
  await dialog.getByRole("radiogroup", { name: "Source" }).getByRole("radio", { name: /^Customer / }).focus();
  await page.keyboard.press("Space");
  await dialog.getByRole("radiogroup", { name: "Target" }).getByRole("radio", { name: /^Shop / }).focus();
  await page.keyboard.press("Space");
  await activate(page, dialog.getByRole("button", { name: "Add relationship" }));
  await relabel(page, canvas(page).getByTestId("c4-relationship").first(), "Buys from");

  await expectNamedWithVisibleFocus(page, elements.nth(0), /^Person: Customer$/);
  await expectNamedWithVisibleFocus(page, elements.nth(1), /^System: Shop$/);
  await expectNamedWithVisibleFocus(page, canvas(page).getByTestId("c4-relationship").first(), /^One-way relationship from Customer to Shop: Buys from$/);
});

// Spec 008, VO-023 (FR-033, FR-043, FR-047, US7-AS3): an icon-only toolbar control is named by itself, not by its tooltip
// alone, shows a visible focus, and the disabled, pressed and expanded states of the controls are exposed.
test("at 360 px icon-only toolbar controls are named without their tooltip, show focus, and expose their states", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("#/new/flowchart");
  const bar = page.getByRole("toolbar", { name: "Diagram actions" });
  const undo = bar.getByRole("button", { name: "Undo", exact: true });

  await expect(undo).toHaveText("");
  await expect(undo).toHaveAttribute("aria-label", "Undo");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(undo).toHaveAccessibleName("Undo");

  const zoomIn = bar.getByRole("button", { name: "Zoom in", exact: true });
  const resting = await indicator(zoomIn);
  await page.getByRole("button", { name: "Tools", exact: true }).focus();
  for (let presses = 0; presses < 40 && !(await zoomIn.evaluate((element) => element === document.activeElement)); presses += 1) await page.keyboard.press("Shift+Tab");
  await expect(zoomIn).toBeFocused();
  expect(await indicator(zoomIn)).not.toBe(resting);

  await expect(bar.getByRole("button", { name: "Redo", exact: true })).toBeDisabled();
  const tools = page.getByRole("button", { name: "Tools", exact: true });
  await expect(tools).toHaveAttribute("aria-expanded", "false");
  const more = page.getByRole("button", { name: "More actions", exact: true });
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await more.click();
  // The open menu hides the rest of the page from the accessibility tree, so the button is found by what it controls.
  await expect(page.locator('[aria-controls="more-actions-menu"]')).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1280, height: 900 });
  const toggle = page.getByRole("button", { name: "Preview as Mermaid draws it" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});
