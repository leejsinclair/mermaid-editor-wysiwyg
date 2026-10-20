import { expect, test } from "@playwright/test";
import { openItem, panelLabel, sourceOf } from "./support/items";

// VO-043 (FR-023, EC-15): the Properties panel keeps its fields and keeps a label typed there as an unconfirmed draft when focus
// leaves it; Enter confirms the draft.

for (const kind of ["node", "participant", "c4-element"] as const) {
  test(`a ${kind} label typed in the Properties panel stays a draft when focus leaves the field, and Enter confirms it`, async ({ page }) => {
    const opened = await openItem(page, kind);
    await opened.item.focus();
    await page.keyboard.press("Enter");
    const field = panelLabel(page);
    await expect(field).toBeVisible();
    const sourceBefore = await sourceOf(page);

    await field.fill("Typed here");
    await page.getByRole("button", { name: "Copy Source" }).focus();

    await expect(field).toHaveValue("Typed here");
    expect(await sourceOf(page)).toBe(sourceBefore);
    await field.focus();
    await field.press("Enter");
    expect(await sourceOf(page)).toContain("Typed here");
  });
}
