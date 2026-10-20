import { expect, test, type Page } from "@playwright/test";
import { doubleClickBody, drawnLabel, ITEM_KINDS, openEditor, openItem, openPair, panelLabel, sourceOf, VIEWS } from "./support/items";

// VO-001 (FR-001, US1-AS1): in each view, double-clicking the body or the label of an item opens an editor on its label
// with the whole label selected, moves nothing, creates no line, and offers no description or technology.

for (const kind of ITEM_KINDS) {
  for (const where of ["body", "label"] as const) {
    test(`double-clicking the ${where} of a ${kind} opens the label editor with the whole label selected`, async ({ page }) => {
      const opened = await openItem(page, kind);
      const canvas = page.getByRole("region", { name: "Diagram canvas" });
      // Only a flowchart node is placed freely, so only its position can change; the other views are checked by their source.
      const before = kind === "node" ? await opened.item.boundingBox() : null;
      const sourceBefore = kind === "node" ? "" : await sourceOf(page);
      const lines = canvas.locator(".react-flow__edge, [data-testid='message'], [data-testid='c4-relationship']");

      if (where === "body") await doubleClickBody(opened, kind);
      else await opened.label.dblclick();

      const editor = page.getByTestId("inline-label-editor");
      await expect(editor).toBeVisible();
      await expect(editor).toHaveValue(opened.text);
      const selected = await editor.evaluate((field: HTMLTextAreaElement) => field.value.slice(field.selectionStart, field.selectionEnd));
      expect(selected).toBe(opened.text);
      // The editor sits at the label, inside the drawn item.
      const editorBox = await editor.boundingBox();
      const itemBox = await opened.item.boundingBox();
      expect(editorBox).not.toBeNull();
      expect(itemBox).not.toBeNull();
      if (editorBox && itemBox) {
        const centreX = editorBox.x + editorBox.width / 2;
        const centreY = editorBox.y + editorBox.height / 2;
        expect(centreX).toBeGreaterThanOrEqual(itemBox.x);
        expect(centreX).toBeLessThanOrEqual(itemBox.x + itemBox.width);
        expect(centreY).toBeGreaterThanOrEqual(itemBox.y);
        expect(centreY).toBeLessThanOrEqual(itemBox.y + itemBox.height);
      }
      if (kind === "node") expect(itemBox).toEqual(before);
      else expect(await sourceOf(page)).toBe(sourceBefore);
      await expect(lines).toHaveCount(0);
      // Only the label is offered: one text field on the canvas, and no description or technology field.
      await expect(canvas.locator("textarea, input")).toHaveCount(1);
      await expect(canvas.getByRole("textbox", { name: /description|technology/i })).toHaveCount(0);
    });
  }
}

// VO-002 (FR-002, FR-005, US1-AS2): Enter commits a label with special characters; the canvas, the Properties panel and the
// source show it, escaped in the source as for a Properties panel edit; the flowchart preview shows it too.
const SPECIAL = 'say "hi" <b> --> x';
const SPECIAL_ESCAPED = "say #34;hi#34; #60;b#62; #45;#45;#62; x";

for (const kind of ITEM_KINDS) {
  test(`Enter commits a ${kind} label with special characters to the canvas, the panel and the source`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const editor = await openEditor(opened);

    await editor.fill(SPECIAL);
    await editor.press("Enter");

    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(opened)).toBe(SPECIAL);
    await expect(panelLabel(page)).toHaveValue(SPECIAL);
    expect(await sourceOf(page)).toContain(SPECIAL_ESCAPED);
    if (kind === "node") {
      await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();
      await expect(page.getByRole("region", { name: "Preview as Mermaid draws it" })).toContainText(SPECIAL);
    }
  });
}

// VO-003 (FR-002, US1-AS3, SC-006): Escape closes the editor and leaves the label, the source and the undo history alone.
for (const kind of ITEM_KINDS) {
  test(`Escape discards the typed ${kind} text and changes nothing`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const sourceBefore = await sourceOf(page);
    const editor = await openEditor(opened);

    await editor.fill("not kept");
    await editor.press("Escape");

    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(opened)).toBe(opened.text);
    expect(await sourceOf(page)).toBe(sourceBefore);
    // The one history step is still the item's own creation: Undo removes the item, not a rename.
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(opened.item).toHaveCount(0);
  });
}

// VO-004 (FR-002, US1-AS4): Shift+Enter inserts a line break and the editor stays open; Enter then commits two lines.
for (const kind of ITEM_KINDS) {
  test(`Shift+Enter adds a line to a ${kind} label and Enter commits both lines`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const editor = await openEditor(opened);

    await editor.fill("one");
    await editor.press("Shift+Enter");
    await expect(editor).toBeVisible();
    await editor.pressSequentially("two");
    await editor.press("Enter");

    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(opened)).toBe("one\ntwo");
    expect(await sourceOf(page)).toContain("one<br/>two");
  });
}

// VO-006 (FR-004, US1-AS6, SC-005): one Undo restores the previous label everywhere, and one Redo reapplies the new one.
for (const kind of ITEM_KINDS) {
  test(`one Undo and one Redo undo and redo a ${kind} rename`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const editor = await openEditor(opened);
    await editor.fill("Renamed");
    await editor.press("Enter");
    expect(await drawnLabel(opened)).toBe("Renamed");

    await page.getByRole("button", { name: "Undo", exact: true }).click();
    expect(await drawnLabel(opened)).toBe(opened.text);
    expect(await sourceOf(page)).not.toContain("Renamed");
    await opened.item.focus();
    await page.keyboard.press("Enter");
    await expect(panelLabel(page)).toHaveValue(opened.text);

    await page.getByRole("button", { name: "Redo", exact: true }).click();
    expect(await drawnLabel(opened)).toBe("Renamed");
    expect(await sourceOf(page)).toContain("Renamed");
  });
}

// VO-051 (FR-003, US1-AS1, SC-003): a rename from the canvas alone reaches the source in under 5 seconds, with the
// Properties panel never focused.
for (const kind of ITEM_KINDS) {
  test(`a ${kind} is renamed from the canvas alone in under 5 seconds`, async ({ page }) => {
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { __panelFocus: string[] }).__panelFocus = seen;
      document.addEventListener("focusin", (event) => {
        if (event.target instanceof Element && event.target.closest('[aria-label="Properties"]')) seen.push(event.target.tagName);
      });
    });
    const opened = await openItem(page, kind);

    const started = Date.now();
    const editor = await openEditor(opened);
    await editor.fill("Quick");
    await editor.press("Enter");
    await expect.poll(() => sourceOf(page), { timeout: 5000 }).toContain("Quick");

    expect(Date.now() - started).toBeLessThan(5000);
    expect(await page.evaluate(() => (window as unknown as { __panelFocus: string[] }).__panelFocus)).toEqual([]);
  });
}

// VO-005 (FR-002, US1-AS5): clicking another item commits the edit and then selects that item; Tab commits too.
for (const view of VIEWS) {
  test(`in a ${view} diagram, clicking another item commits the edit and then selects it`, async ({ page }) => {
    const [first, second] = await openPair(page, view);
    const editor = await openEditor(first);
    await editor.fill("Changed");

    await second.body.click({ position: { x: 14, y: 14 } });

    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(first)).toBe("Changed");
    await expect(panelLabel(page)).toHaveValue(second.text);
    expect(await sourceOf(page)).toContain("Changed");
  });

  test(`in a ${view} diagram, Tab commits the edit`, async ({ page }) => {
    const [first] = await openPair(page, view);
    const editor = await openEditor(first);
    await editor.fill("Tabbed");

    await editor.press("Tab");

    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(first)).toBe("Tabbed");
    expect(await sourceOf(page)).toContain("Tabbed");
  });
}

// VO-044 (FR-002, EC-03): Ctrl+Z inside the editor undoes typing only; the toolbar's Undo and Redo discard the text and
// then step the diagram once.
test("Ctrl+Z inside the editor undoes typing and leaves the diagram and the editor alone", async ({ page }) => {
  const [first] = await openPair(page, "flowchart");
  const editor = await openEditor(first);

  await editor.pressSequentially("abc");
  await editor.press("ControlOrMeta+z");

  await expect(editor).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(2);
});

for (const view of VIEWS) {
  test(`in a ${view} diagram, the toolbar's Undo and Redo discard the typed text and step the diagram once`, async ({ page }) => {
    const [first] = await openPair(page, view);
    let editor = await openEditor(first);
    await editor.fill("Second");
    await editor.press("Enter");
    expect(await drawnLabel(first)).toBe("Second");

    editor = await openEditor(first);
    await editor.fill("draft one");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(first)).toBe(first.text);

    editor = await openEditor(first);
    await editor.fill("draft two");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
    expect(await drawnLabel(first)).toBe("Second");
    expect(await sourceOf(page)).not.toContain("draft");
  });
}

// VO-007 (FR-004, FR-021, US1-AS7, SC-007): blank or spaces-only text, committed by Enter and by clicking outside, is
// rejected: the editor closes, the previous label stays, no history entry is added, and the explanation is the Properties
// panel's, announced in the live region.
const messages = (page: Page) => page.getByRole("status", { name: "Messages" });

for (const kind of ITEM_KINDS) {
  for (const [how, blank] of [["Enter", "   "], ["clicking outside", ""]] as const) {
    test(`blank text committed in a ${kind} editor by ${how} is rejected and announced`, async ({ page }) => {
      const opened = await openItem(page, kind);
      const sourceBefore = await sourceOf(page);
      const editor = await openEditor(opened);
      await editor.fill(blank);

      if (how === "Enter") await editor.press("Enter");
      else await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 4, y: 4 } });

      await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
      expect(await drawnLabel(opened)).toBe(opened.text);
      expect(await sourceOf(page)).toBe(sourceBefore);
      const announced = await messages(page).textContent();
      expect(announced).toContain("A label needs at least one visible character.");
      // The same sentence the Properties panel gives for the same blank text.
      await opened.body.click({ position: { x: 14, y: 14 } });
      await panelLabel(page).fill("   ");
      await panelLabel(page).press("Enter");
      await expect(messages(page)).toHaveText(announced ?? "");
      // No history entry: the one step is still the item's own creation.
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(opened.item).toHaveCount(0);
    });
  }
}

// VO-008 (FR-003, US1-AS8, EC-09, EC-14): Enter on a focused, unselected item only selects it; Enter again and F2 on a
// selected item open the editor as a double-click does, and focus never moves to the Properties panel.
for (const kind of ITEM_KINDS) {
  test(`on a focused ${kind}, Enter selects and a second Enter opens the editor; F2 opens it too`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await page.keyboard.press("Escape");
    await expect(panelLabel(page)).toHaveCount(0);
    const inProperties = () => page.evaluate(() => document.activeElement?.closest('[aria-label="Properties"]') !== null && document.activeElement?.closest('[aria-label="Properties"]') !== undefined);

    await opened.item.focus();
    // A flowchart node is selected as it takes keyboard focus; the first Enter only confirms that (EC-09).
    await page.keyboard.press("Enter");
    await expect(panelLabel(page)).toHaveValue(opened.text);
    await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);

    await page.keyboard.press("Enter");
    const editor = page.getByTestId("inline-label-editor");
    await expect(editor).toBeVisible();
    await expect(editor).toBeFocused();
    expect(await inProperties()).toBe(false);

    await editor.press("Escape");
    await expect(editor).toHaveCount(0);
    await opened.item.focus();
    await page.keyboard.press("F2");
    await expect(editor).toBeVisible();
    await expect(editor).toBeFocused();
    expect(await inProperties()).toBe(false);
  });
}
