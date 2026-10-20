import { expect, test } from "@playwright/test";
import { ITEM_KINDS, openEditor, openItem, VIEWS } from "./support/items";
import { openLine } from "./support/lines";

// VO-031 (FR-021, US5-AS5): opening the inline editor moves focus into it; its accessible name names the item or line; closing it
// by Enter, Escape or clicking away returns focus to that item or line.

const CLOSINGS = ["Enter", "Escape", "clicking away"] as const;

for (const kind of ITEM_KINDS) {
  for (const closing of CLOSINGS) {
    test(`a ${kind}'s editor takes focus, is named for it, and gives focus back when closed by ${closing}`, async ({ page }) => {
      const opened = await openItem(page, kind);
      const editor = await openEditor(opened);
      await expect(editor).toBeFocused();
      const itemName = await opened.item.getAttribute("aria-label");
      await expect(editor).toHaveAccessibleName(`Label of ${itemName ?? ""}`);

      if (closing === "clicking away") await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 4, y: 4 } });
      else await editor.press(closing);

      await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
      await expect(opened.item).toBeFocused();
    });
  }
}

for (const view of VIEWS) {
  for (const closing of CLOSINGS) {
    test(`a ${view} line's editor takes focus, is named for the line, and gives focus back when closed by ${closing}`, async ({ page }) => {
      const line = await openLine(page, view);
      await line.doubleClickLabel();
      const editor = page.getByTestId("inline-label-editor");
      await expect(editor).toBeFocused();
      const lineName = await line.line.first().getAttribute("aria-label");
      await expect(editor).toHaveAccessibleName(`Label of ${lineName ?? ""}`);

      if (closing === "clicking away") await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 4, y: 4 } });
      else await editor.press(closing);

      await expect(page.getByTestId("inline-label-editor")).toHaveCount(0);
      await expect(line.line.first()).toBeFocused();
    });
  }
}
