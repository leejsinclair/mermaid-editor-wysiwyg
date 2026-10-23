import { expect, test, type Page } from "@playwright/test";
import { BEFORE } from "./support/controlInventory";

// VO-010 (FR-009, FR-023, US1-AS3): at 1440 × 900, with nothing selected and with an item selected, the controls of each diagram
// type's editor (role and accessible name) are those the editor offered before the redesign, plus only the two appearance buttons.
// The lists below were recorded from the code at the commit before the redesign (feature 006), through the accessibility tree.

test.use({ viewport: { width: 1440, height: 900 } });

const SWITCH = ["button:Blueprint Studio", "button:Light"];

const CASES = [
  { type: "flowchart", address: "#/new/flowchart", add: "Rectangle", item: ".react-flow__node" },
  { type: "sequence", address: "#/new/sequence", add: "Participant", item: '[data-testid="participant"]' },
  { type: "c4", address: "#/new/c4/context", add: "Person", item: '[data-testid="c4-element"]' },
] as const;

const CONTROL = /^\s*- (button|textbox|combobox|checkbox|radio|link|menuitem|switch|slider|spinbutton|searchbox) "([^"]*)"/;

/** Every control on the page as `role:name`, read from the accessibility tree; the source disclosure's status text is dropped. */
async function controlsOf(page: Page): Promise<string[]> {
  const found: string[] = [];
  for (const line of (await page.locator("body").ariaSnapshot()).split("\n")) {
    const match = CONTROL.exec(line);
    if (match) found.push(`${match[1] ?? ""}:${(match[2] ?? "").replace(/^(Mermaid source).*/, "$1")}`);
  }
  return found.sort((a, b) => a.localeCompare(b));
}

const sorted = (names: readonly string[]): string[] => [...names].sort((a, b) => a.localeCompare(b));

for (const { type, address, add, item } of CASES) {
  test(`the ${type} editor offers the controls it offered before the redesign, plus the appearance switch`, async ({ page }) => {
    const before = new Map(Object.entries(BEFORE)).get(type);
    if (before === undefined) throw new Error(`No recorded inventory for ${type}`);
    await page.goto(address);
    await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }).click();
    await page.locator(item).first().waitFor();
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("Escape");
    expect(await controlsOf(page), "with nothing selected").toEqual(sorted([...before.nothing, ...SWITCH]));

    await page.locator(item).first().click();
    await page.getByRole("region", { name: "Properties" }).waitFor();
    expect(await controlsOf(page), "with an item selected").toEqual(sorted([...before.selected, ...SWITCH]));
  });
}
