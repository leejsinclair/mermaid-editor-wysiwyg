import { expect, test, type Page } from "@playwright/test";
import { addShape, connect, dropShape } from "./support/flowchart";

// Spec 008, US1: a person with no Mermaid knowledge adds, labels and connects two shapes on a blank canvas.
// VO-001 hint, VO-002 new node selected with its label open, VO-003 Enter and Escape, VO-004 connection prompt,
// VO-005 and VO-046 hint hides and returns, VO-025 guidance while editing, VO-028 direction, VO-041 empty label,
// VO-042 Escape order, VO-043 a deleted element's editor.

const canvasOf = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const nodes = (page: Page) => canvasOf(page).locator(".react-flow__node");
const editor = (page: Page) => page.getByTestId("inline-label-editor");
const toolbox = (page: Page, name: string) => page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true });

const STEPS = ["1. Add a shape.", "2. Label it.", "3. Connect two shapes."];

async function openBlank(page: Page) {
  await page.goto("#/new/flowchart");
  await expect(canvasOf(page)).toBeVisible();
}

test.describe("the empty canvas", () => {
  test("names the three steps and leaves the canvas editable", async ({ page }) => {
    await openBlank(page);
    for (const step of STEPS) await expect(canvasOf(page).getByText(step)).toBeVisible();
    // The hint never takes the pointer, so a shape can still be dropped through it.
    await expect(canvasOf(page).getByText(STEPS[0] ?? "")).toHaveCSS("pointer-events", "none");
  });

  test("is hidden once the canvas has content and returns when it is emptied again", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await expect(nodes(page)).toHaveCount(1);
    for (const step of STEPS) await expect(canvasOf(page).getByText(step)).toHaveCount(0);

    await page.keyboard.press("Escape");
    await page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Delete" }).click();
    await expect(nodes(page)).toHaveCount(0);
    for (const step of STEPS) await expect(canvasOf(page).getByText(step)).toBeVisible();
  });
});

test.describe("adding and labelling a shape", () => {
  test("a new shape is selected with its label open and the whole label selected", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await expect(nodes(page)).toHaveCount(1);
    await expect(nodes(page).first()).toHaveClass(/selected/);
    await expect(editor(page)).toBeVisible();
    await expect(editor(page)).toBeFocused();
    await expect(editor(page)).toHaveValue("Rectangle");
    const selected = await editor(page).evaluate((field: HTMLTextAreaElement) => field.value.slice(field.selectionStart, field.selectionEnd));
    expect(selected).toBe("Rectangle");
  });

  test("Enter saves the label", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await editor(page).fill("Start");
    await editor(page).press("Enter");
    await expect(editor(page)).toHaveCount(0);
    await expect(nodes(page).first().getByTestId("node-label")).toHaveText("Start");
  });

  test("Escape restores the previous label", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await editor(page).fill("Something else");
    await editor(page).press("Escape");
    await expect(editor(page)).toHaveCount(0);
    await expect(nodes(page).first().getByTestId("node-label")).toHaveText("Rectangle");
  });

  test("an empty label keeps the editor open with a message and keeps the previous label", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await editor(page).fill("");
    await editor(page).press("Enter");
    await expect(editor(page)).toBeVisible();
    await expect(page.getByText("A label cannot be empty.")).toBeVisible();
    await editor(page).press("Escape");
    await expect(nodes(page).first().getByTestId("node-label")).toHaveText("Rectangle");
  });

  test("guidance for the label edit is visible while it is open", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await expect(editor(page)).toBeVisible();
    await expect(canvasOf(page).getByText("Press Enter to save the label or Escape to cancel.")).toBeVisible();
    await editor(page).press("Escape");
    await expect(canvasOf(page).getByText("Press Enter to save the label or Escape to cancel.")).toHaveCount(0);
  });

  test("deleting the element while its label is edited closes the editor and applies no label", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await editor(page).fill("Never saved");
    await page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Delete" }).click();
    await expect(editor(page)).toHaveCount(0);
    await expect(nodes(page)).toHaveCount(0);
    // Undoing the delete brings back the shape as it was before the edit.
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(nodes(page)).toHaveCount(1);
    await expect(nodes(page).first().getByTestId("node-label")).toHaveText("Rectangle");
  });
});

test.describe("connecting two shapes", () => {
  test("names source or destination and the key that cancels, then shows the direction", async ({ page }) => {
    await openBlank(page);
    const canvas = canvasOf(page);
    await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
    await addShape(page, canvas, "Circle", { x: 520, y: 360 });
    await expect(nodes(page)).toHaveCount(2);

    await toolbox(page, "Solid arrow").click();
    await expect(canvas.getByText("Choose the source item, then the destination. Press Escape to cancel.")).toBeVisible();

    await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
    // The connection has an arrowhead at its destination, so its direction can be seen.
    await expect(canvas.locator(".react-flow__edge path[marker-end]").first()).toBeVisible();
  });

  test("two shapes named with Enter can be joined at once, with nothing else done in between", async ({ page }) => {
    await openBlank(page);
    const canvas = canvasOf(page);
    await dropShape(page, canvas, "Rectangle", { x: 200, y: 100 });
    await editor(page).fill("Start");
    await editor(page).press("Enter");
    await dropShape(page, canvas, "Circle", { x: 520, y: 360 });
    await editor(page).fill("Done");
    await editor(page).press("Enter");

    await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
    await expect(canvas.locator(".react-flow__edge path[marker-end]").first()).toBeVisible();
  });

  test("Escape cancels the armed connection first and the selection second", async ({ page }) => {
    await openBlank(page);
    await toolbox(page, "Rectangle").click();
    await editor(page).press("Escape");
    await expect(nodes(page).first()).toHaveClass(/selected/);

    await toolbox(page, "Solid arrow").click();
    await expect(toolbox(page, "Solid arrow")).toHaveAttribute("aria-pressed", "true");

    await page.keyboard.press("Escape");
    await expect(toolbox(page, "Solid arrow")).toHaveAttribute("aria-pressed", "false");
    await expect(nodes(page).first()).toHaveClass(/selected/);

    await page.keyboard.press("Escape");
    await expect(nodes(page).first()).not.toHaveClass(/selected/);
  });

  test("Escape during a drawn line cancels the line and the armed connection together, and a second Escape clears the selection", async ({ page }) => {
    await openBlank(page);
    const canvas = canvasOf(page);
    await toolbox(page, "Rectangle").click();
    await editor(page).press("Escape");
    await expect(nodes(page).first()).toHaveClass(/selected/);
    await toolbox(page, "Solid arrow").click();

    const handle = await nodes(page).first().locator('[data-side="bottom"]').boundingBox();
    if (!handle) throw new Error("The handle must be visible");
    await page.mouse.move(handle.x + 3, handle.y + 3);
    await page.mouse.down();
    await page.mouse.move(handle.x + 120, handle.y + 160, { steps: 10 });
    await page.keyboard.press("Escape");
    await page.mouse.up();

    await expect(toolbox(page, "Solid arrow")).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByText("Choose the source item, then the destination. Press Escape to cancel.")).toHaveCount(0);
    await expect(canvas.locator(".react-flow__edge")).toHaveCount(0);
    await expect(nodes(page).first()).toHaveClass(/selected/);

    await page.keyboard.press("Escape");
    await expect(nodes(page).first()).not.toHaveClass(/selected/);
  });
});
