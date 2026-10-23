import { expect, test } from "@playwright/test";

// VO-030 (FR-007): at 1440 × 900 each diagram type shows its own toolbox to the left of the canvas and, with an item selected, the
// properties of that item to its right.

test.use({ viewport: { width: 1440, height: 900 } });

const CASES = [
  { type: "flowchart", address: "#/new/flowchart", items: ["Rectangle", "Diamond", "Solid arrow"], add: "Rectangle", drawn: ".react-flow__node" },
  { type: "sequence diagram", address: "#/new/sequence", items: ["Participant", "Actor", "Solid arrow"], add: "Participant", drawn: '[data-testid="participant"]' },
  { type: "C4 diagram", address: "#/new/c4/context", items: ["Person", "System", "One-way relationship"], add: "Person", drawn: '[data-testid="c4-element"]' },
] as const;

for (const { type, address, items, add, drawn } of CASES) {
  test(`a ${type} shows its toolbox beside the canvas and the properties of the selected item`, async ({ page }) => {
    await page.goto(address);
    const toolbox = page.getByRole("region", { name: "Toolbox" });
    const canvas = page.getByRole("region", { name: "Diagram canvas" });
    const properties = page.getByRole("region", { name: "Properties" });
    for (const name of items) await expect(toolbox.getByRole("button", { name, exact: true })).toBeVisible();

    await toolbox.getByRole("button", { name: add, exact: true }).click();
    await page.locator(drawn).first().click();
    await expect(properties.getByRole("textbox", { name: "Label" })).toBeVisible();

    const [left, middle, right] = await Promise.all([toolbox.boundingBox(), canvas.boundingBox(), properties.boundingBox()]);
    if (!left || !middle || !right) throw new Error("The three regions must be on screen");
    expect(left.x + left.width).toBeLessThanOrEqual(middle.x + 1);
    expect(right.x).toBeGreaterThanOrEqual(middle.x + middle.width - 1);
  });
}
