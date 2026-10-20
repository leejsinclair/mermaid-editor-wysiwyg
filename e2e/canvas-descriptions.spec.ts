import { expect, test } from "@playwright/test";
import { openItem, openPair, type ItemKind, type View } from "./support/items";
import { handlesOf } from "./support/c4";

// VO-030 (FR-020, US5-AS4): in each view, an item's accessible description says its body is dragged to move it, its handles are
// dragged to connect it, F2 renames it, and names the Connect command and the keys that move it; each handle's accessible name
// says it is dragged to connect.

const SAYS = [/drag.*to move/i, /drag.*handle.*to connect/i, /F2/, /Connect/];
const MOVE_KEYS = new Map<View, RegExp>([
  ["flowchart", /arrow keys/i],
  ["sequence", /Move up and Move down/i],
  ["c4", /Move to/i],
]);

const KIND_OF_VIEW = new Map<View, ItemKind>([
  ["flowchart", "node"],
  ["sequence", "participant"],
  ["c4", "c4-element"],
]);

for (const view of ["flowchart", "sequence", "c4"] as const) {
  test(`in a ${view} diagram, an item's description says how to move, connect and rename it, and its handles say they are dragged to connect`, async ({ page }) => {
    const kind = KIND_OF_VIEW.get(view) ?? "node";
    const opened = await openItem(page, kind);

    const described = await opened.item.evaluate((element) => {
      const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/);
      return ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
    });
    for (const pattern of [...SAYS, MOVE_KEYS.get(view) ?? /./]) expect(described).toMatch(pattern);
    await expect(opened.item).toHaveAccessibleDescription(/F2/);

    const handles = view === "c4" ? await handlesOf(opened.item) : opened.item.locator('[data-zone="connect"]');
    const count = await handles.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) await expect(handles.nth(index)).toHaveAccessibleName(/drag.*to connect/i);
  });
}

test("a second item of a diagram is described the same way", async ({ page }) => {
  const [, second] = await openPair(page, "sequence");
  await expect(second.item).toHaveAccessibleDescription(/F2/);
});
