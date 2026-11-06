import { expect, test, type Locator } from "@playwright/test";
import { drawnLabel, ITEM_KINDS, openEditor, openItem } from "./support/items";
import { openLine } from "./support/lines";

// Spec 009-inline-edit-caret. FR-001, FR-002: each typed character lands at the caret, which moves on after it, at the start
// and in the middle of a label. FR-003: typing over a selection replaces it. FR-004: a deletion leaves the caret where it was.
// FR-005: for every label edited in place. FR-006: Enter commits exactly the text shown.

const caretOf = (editor: Locator): Promise<number> => editor.evaluate((field: HTMLTextAreaElement) => field.selectionStart);

/** Types at the start and in the middle of the open editor, deletes a character and types over a selection; returns the text. */
async function editInPlace(editor: Locator, text: string): Promise<string> {
  const page = editor.page();
  await page.keyboard.press("Home");
  await page.keyboard.type("ab");
  let expected = `ab${text}`;
  await expect(editor).toHaveValue(expected);
  expect(await caretOf(editor)).toBe(2);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.type("cd");
  expected = `ab${text.slice(0, 1)}cd${text.slice(1)}`;
  await expect(editor).toHaveValue(expected);
  expect(await caretOf(editor)).toBe(5);

  await page.keyboard.press("Backspace");
  expected = `ab${text.slice(0, 1)}c${text.slice(1)}`;
  await expect(editor).toHaveValue(expected);
  expect(await caretOf(editor)).toBe(4);

  await editor.evaluate((field: HTMLTextAreaElement) => {
    field.setSelectionRange(0, 2);
  });
  await page.keyboard.type("XY");
  expected = `XY${expected.slice(2)}`;
  await expect(editor).toHaveValue(expected);
  expect(await caretOf(editor)).toBe(2);
  return expected;
}

for (const kind of ITEM_KINDS) {
  test(`typing at the start and in the middle of a ${kind} label keeps the caret where it is typed`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const editor = await openEditor(opened);

    let expected = await editInPlace(editor, opened.text);
    await page.keyboard.press("Shift+Enter");
    expected = `XY\n${expected.slice(2)}`;
    await expect(editor).toHaveValue(expected);
    expect(await caretOf(editor)).toBe(3);

    await page.keyboard.press("Enter");
    await expect(editor).toHaveCount(0);
    expect(await drawnLabel(opened)).toBe(expected);
  });
}

for (const view of ["flowchart", "sequence", "c4"] as const) {
  test(`typing at the start and in the middle of a ${view} line label keeps the caret where it is typed`, async ({ page }) => {
    const line = await openLine(page, view);
    await line.doubleClickLabel();
    const editor = page.getByTestId("inline-label-editor");
    await expect(editor).toHaveValue(line.text);

    const expected = await editInPlace(editor, line.text);
    await page.keyboard.press("Enter");
    await expect(editor).toHaveCount(0);
    await expect(line.label).toHaveText(expected);
  });
}
