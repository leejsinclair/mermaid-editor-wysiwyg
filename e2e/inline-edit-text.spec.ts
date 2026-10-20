import { expect, test } from "@playwright/test";
import { ITEM_KINDS, openEditor, openItem } from "./support/items";

// VO-039 (FR-007, EC-07): pasted text keeps its characters and line breaks and loses its formatting; no formatting control
// is offered. VO-049 (FR-001, EC-10): a long, multi-line label grows the editor to fit without covering more of the canvas
// than the label's own area plus the editor's border.

for (const kind of ITEM_KINDS) {
  test(`pasting formatted text into a ${kind} editor keeps its characters and line breaks as plain text`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const editor = await openEditor(opened);

    await editor.evaluate((field) => {
      const data = new DataTransfer();
      data.setData("text/plain", "alpha\nbeta");
      data.setData("text/html", "<b>alpha</b><br><i style='color:red'>beta</i>");
      // A plain event carrying the data: Firefox ignores the data given to the ClipboardEvent constructor.
      const paste = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(paste, "clipboardData", { value: data });
      field.dispatchEvent(paste);
    });

    await expect(editor).toHaveValue("alpha\nbeta");
    expect(await editor.evaluate((field) => field.tagName)).toBe("TEXTAREA");
    await expect(page.getByRole("region", { name: "Diagram canvas" }).locator("[contenteditable], [role='toolbar']")).toHaveCount(0);
    await editor.press("Enter");
    expect(await opened.lines.allTextContents().then((lines) => lines.join("\n"))).toBe("alpha\nbeta");
  });
}

const LONG = ["first", "x".repeat(10) + " " + "word ".repeat(40), "third", "fourth", "fifth"].join("\n");

for (const kind of ITEM_KINDS) {
  test(`a long five-line ${kind} label grows the editor to fit it within the item's width`, async ({ page }) => {
    const opened = await openItem(page, kind);
    const editor = await openEditor(opened);
    const small = await editor.boundingBox();

    await editor.fill(LONG);

    const fits = await editor.evaluate((field) => field.scrollHeight <= field.clientHeight + 1);
    expect(fits).toBe(true);
    const grown = await editor.boundingBox();
    const item = await opened.item.boundingBox();
    expect(grown).not.toBeNull();
    expect(item).not.toBeNull();
    if (grown && small && item) {
      expect(grown.height).toBeGreaterThan(small.height);
      // Wider than the item is wider than the label's own area: the editor wraps instead.
      expect(grown.width).toBeLessThanOrEqual(item.width + 2);
      expect(grown.x).toBeGreaterThanOrEqual(item.x - 2);
    }
  });
}
