import { expect, test } from "@playwright/test";
import { doubleTap, tap, toggleTools } from "./support";

// Spec 009-inline-edit-caret, FR-008: on the emulated phone, typing at the start and in the middle of a shape label lands at
// the caret, and Enter commits the text shown.

test("on a phone, typing at the start and in the middle of a shape label keeps the caret where it is typed", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await toggleTools(page);
  await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }));
  await toggleTools(page);
  const node = page.locator(".react-flow__node");
  await expect(node).toHaveCount(1);
  await doubleTap(page, node);
  const editor = page.getByTestId("inline-label-editor");
  await expect(editor).toHaveValue("Rectangle");

  await page.keyboard.press("Home");
  await page.keyboard.type("ab");
  await expect(editor).toHaveValue("abRectangle");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.type("cd");
  await expect(editor).toHaveValue("abRcdectangle");
  expect(await editor.evaluate((field: HTMLTextAreaElement) => field.selectionStart)).toBe(5);

  await page.keyboard.press("Enter");
  await expect(node.getByTestId("node-label")).toHaveText("abRcdectangle");
});
