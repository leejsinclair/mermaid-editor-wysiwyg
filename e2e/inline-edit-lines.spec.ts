import { expect, test, type Page } from "@playwright/test";
import { openLine } from "./support/lines";
import { panelLabel, sourceOf, VIEWS } from "./support/items";

// Lines are renamed where they sit (spec 004-canvas-usability, US2).
// VO-010 (FR-001, US2-AS1): double-clicking a labelled line, on the line and on its label, opens the editor on the label.
// VO-011 (FR-001, US2-AS2): an unlabelled flowchart connection opens empty at its middle. VO-012 (FR-004, US2-AS3): clearing
// a flowchart label removes it. VO-013 (FR-004, US2-AS4): blank text is rejected for a message and a relationship. VO-007
// (FR-004, FR-021, US1-AS7) for lines. VO-008 (FR-003, US1-AS8): Enter on a selected line and F2 open the editor.
// VO-014 (FR-006, US2-AS5): double-clicking an end handle opens no editor and moves no end.

const messages = (page: Page) => page.getByRole("status", { name: "Messages" });
const editorOf = (page: Page) => page.getByTestId("inline-label-editor");

for (const view of VIEWS) {
  for (const where of ["line", "label"] as const) {
    test(`double-clicking the ${where} of a labelled ${view} line opens the editor with the label selected`, async ({ page }) => {
      const line = await openLine(page, view);

      if (where === "line") await line.doubleClickLine();
      else await line.doubleClickLabel();

      const editor = editorOf(page);
      await expect(editor).toBeVisible();
      await expect(editor).toHaveValue(line.text);
      expect(await editor.evaluate((field: HTMLTextAreaElement) => field.value.slice(field.selectionStart, field.selectionEnd))).toBe(line.text);
    });
  }
}

test("an unlabelled flowchart connection opens an empty editor at its middle; \"Yes\" becomes its label in one undo step", async ({ page }) => {
  const line = await openLine(page, "flowchart", null);
  const sourceBefore = await sourceOf(page);

  await line.doubleClickLine();
  const editor = editorOf(page);
  await expect(editor).toBeVisible();
  await expect(editor).toHaveValue("");
  const box = await editor.boundingBox();
  const edge = await line.line.boundingBox();
  if (!box || !edge) throw new Error("The editor and the connection must be visible");
  expect(Math.abs(box.x + box.width / 2 - (edge.x + edge.width / 2))).toBeLessThan(edge.width / 4 + 20);
  expect(Math.abs(box.y + box.height / 2 - (edge.y + edge.height / 2))).toBeLessThan(edge.height / 4 + 20);

  await editor.fill("Yes");
  await editor.press("Enter");
  await expect(line.label).toHaveText("Yes");
  expect(await sourceOf(page)).toContain("Yes");

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(line.label).toHaveCount(0);
  await expect(line.line).toHaveCount(1);
  expect(await sourceOf(page)).toBe(sourceBefore);
});

test("empty text committed on an unlabelled flowchart connection leaves it unlabelled with no history entry", async ({ page }) => {
  const line = await openLine(page, "flowchart", null);
  await line.doubleClickLine();
  const editor = editorOf(page);
  await expect(editor).toBeVisible();

  await editor.press("Enter");

  await expect(editor).toHaveCount(0);
  await expect(line.label).toHaveCount(0);
  // The one history step is still the connection's own creation.
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(line.line).toHaveCount(0);
});

test("clearing a flowchart connection's label in place removes it from the canvas and the source", async ({ page }) => {
  const line = await openLine(page, "flowchart", "Link");
  expect(await sourceOf(page)).toContain("Link");
  await line.doubleClickLine();
  const editor = editorOf(page);

  await editor.fill("");
  await editor.press("Enter");

  await expect(editor).toHaveCount(0);
  await expect(line.label).toHaveCount(0);
  expect(await sourceOf(page)).not.toContain("Link");
});

for (const view of ["sequence", "c4"] as const) {
  for (const how of ["Enter", "clicking outside"] as const) {
    test(`blank text committed on a ${view} line by ${how} is rejected and announced, with nothing else changed`, async ({ page }) => {
      const line = await openLine(page, view);
      const sourceBefore = await sourceOf(page);
      await line.doubleClickLabel();
      const editor = editorOf(page);
      await expect(editor).toBeVisible();
      await editor.fill("   ");

      if (how === "Enter") await editor.press("Enter");
      else await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 4, y: 4 } });

      await expect(editor).toHaveCount(0);
      await expect(line.label).toHaveText(line.text);
      expect(await sourceOf(page)).toBe(sourceBefore);
      // The sentence is the Properties panel's own for the same blank text.
      const announced = (await messages(page).textContent()) ?? "";
      expect(announced).not.toBe("");
      await line.line.first().focus();
      await page.keyboard.press("Enter");
      await panelLabel(page).fill("   ");
      await panelLabel(page).press("Enter");
      await expect(messages(page)).toHaveText(announced);
      // No history entry: the one step is still the line's own creation.
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(line.line).toHaveCount(0);
    });
  }
}

for (const view of VIEWS) {
  test(`on a ${view} line, Enter on the selected line and F2 open the editor without leaving the canvas`, async ({ page }) => {
    const line = await openLine(page, view);
    await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 4, y: 4 } });
    await expect(panelLabel(page)).toHaveCount(0);
    const target = view === "flowchart" ? line.line : line.line.first();
    const inProperties = () => page.evaluate(() => document.activeElement?.closest('[aria-label="Properties"]') != null);

    await target.focus();
    await page.keyboard.press("Enter");
    await expect(panelLabel(page)).toBeVisible();
    await expect(editorOf(page)).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(editorOf(page)).toBeVisible();
    await expect(editorOf(page)).toBeFocused();
    expect(await inProperties()).toBe(false);

    await editorOf(page).press("Escape");
    await expect(editorOf(page)).toHaveCount(0);
    await target.focus();
    await page.keyboard.press("F2");
    await expect(editorOf(page)).toBeVisible();
    await expect(editorOf(page)).toBeFocused();
    expect(await inProperties()).toBe(false);
  });

  test(`double-clicking either end handle of a selected ${view} line opens no editor and moves no end`, async ({ page }) => {
    const line = await openLine(page, view);
    await line.line.first().focus();
    await page.keyboard.press("Enter");
    await expect(panelLabel(page)).toBeVisible();
    const sourceBefore = await sourceOf(page);

    for (const end of line.ends) {
      const box = await end.first().boundingBox();
      if (!box) throw new Error("The end handle must be visible");
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await expect(editorOf(page)).toHaveCount(0);
    }

    expect(await sourceOf(page)).toBe(sourceBefore);
  });
}
