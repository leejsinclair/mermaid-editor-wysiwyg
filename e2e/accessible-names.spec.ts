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
  await activate(page, toolbox(page).getByRole("button", { name: "Actor", exact: true }));
  const participants = canvas(page).getByTestId("participant");
  await relabel(page, participants.nth(0), "Alice");
  await relabel(page, participants.nth(1), "Bob");
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
  await activate(page, toolbox(page).getByRole("button", { name: "System", exact: true }));
  const elements = canvas(page).getByTestId("c4-element");
  await relabel(page, elements.nth(0), "Customer");
  await relabel(page, elements.nth(1), "Shop");
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
