import { expect, test } from "@playwright/test";

// VO-010, VO-011, VO-012, VO-015, VO-022, VO-038 (FR-017, FR-018, FR-023, FR-033, FR-041, FR-042): the toolbar is grouped by intent,
// an overflow action still works, keyboard focus is visible, the node-position note is a tooltip on Copy Source, Copy for Markdown and
// Save file, and text labels stay wherever the toolbar has room.

const NOTE = "Node positions are kept in the editor only. Mermaid arranges the copied diagram its own way.";

test("the wide toolbar names its groups and puts each action in the right one", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/new/flowchart");
  const toolbar = page.getByRole("toolbar", { name: "Diagram actions" });
  const expected: Record<string, readonly string[]> = {
    History: ["Undo", "Redo"],
    "Export and sharing": ["Copy Source", "Copy for Markdown", "Save file"],
    View: ["Zoom in", "Zoom out", "Fit to view", "Preview as Mermaid draws it"],
  };
  for (const [heading, names] of Object.entries(expected)) {
    const group = toolbar.getByRole("group", { name: heading, exact: true });
    await expect(group.getByText(heading, { exact: true })).toBeVisible();
    for (const name of names) await expect(group.getByRole("button", { name, exact: true })).toBeVisible();
  }
});

test("wide toolbar buttons show their text labels", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/new/flowchart");
  const toolbar = page.getByRole("toolbar", { name: "Diagram actions" });
  for (const name of ["Undo", "Redo", "Zoom in", "Zoom out", "Fit to view", "Copy Source", "Save file"]) {
    await expect(toolbar.getByRole("button", { name, exact: true })).toHaveText(name);
  }
});

test("the node-position note is a tooltip on Copy Source, Copy for Markdown and Save file, not text that moves the toolbar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/new/flowchart");
  const group = page.getByRole("toolbar").getByRole("group", { name: "Export and sharing", exact: true });
  await expect(group.getByText(NOTE)).toBeHidden();
  for (const name of ["Copy Source", "Copy for Markdown", "Save file"]) {
    const button = group.getByRole("button", { name, exact: true });
    await expect(button).toHaveAccessibleDescription(NOTE);
    await button.hover();
    await expect(page.getByRole("tooltip")).toHaveText(NOTE);
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  }
});

test("a keyboard user reaches a toolbar action, sees its focus and uses it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/new/flowchart");
  const fit = page.getByRole("toolbar").getByRole("button", { name: "Fit to view", exact: true });
  await fit.focus();
  await expect(fit).toBeFocused();
  const outline = await fit.evaluate((el) => {
    const style = getComputedStyle(el);
    return { width: parseFloat(style.outlineWidth), style: style.outlineStyle, shadow: style.boxShadow };
  });
  expect(outline.style !== "none" && outline.width > 0 ? true : outline.shadow !== "none", "focus is not visible").toBe(true);
  await page.keyboard.press("Enter");
  await expect(fit).toBeVisible();
});

test("at 360 px the document actions sit under More actions and Copy Source works from there", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("#/new/flowchart");
  const toolbar = page.getByRole("toolbar", { name: "Diagram actions" });
  await expect(toolbar.getByRole("button", { name: "Copy Source", exact: true })).toHaveCount(0);
  await toolbar.getByRole("button", { name: "More actions", exact: true }).click();
  for (const name of ["Copy Source", "Copy for Markdown", "Save file", "Preview as Mermaid draws it"]) {
    await expect(page.getByRole("menuitem", { name, exact: true })).toBeVisible();
  }
  await page.getByRole("menuitem", { name: "Preview as Mermaid draws it", exact: true }).click();
  await expect(page.getByRole("region", { name: "Preview as Mermaid draws it" })).toBeVisible();
});

test("at 360 px Undo, Redo and the view controls keep accessible names and the page does not scroll sideways", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("#/new/flowchart");
  const toolbar = page.getByRole("toolbar", { name: "Diagram actions" });
  for (const name of ["Undo", "Redo", "Zoom in", "Zoom out", "Fit to view"]) {
    const button = toolbar.getByRole("button", { name, exact: true });
    await expect(button).toBeVisible();
    await expect(button.locator("svg")).toHaveCount(1);
  }
  await toolbar.getByRole("button", { name: "Zoom in", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "Zoom in" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("at 768 px the toolbar still has room, so Undo and Zoom in keep their text labels", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("#/new/flowchart");
  const toolbar = page.getByRole("toolbar", { name: "Diagram actions" });
  await expect(toolbar.getByRole("button", { name: "Undo", exact: true })).toHaveText("Undo");
  await expect(toolbar.getByRole("button", { name: "Zoom in", exact: true })).toHaveText("Zoom in");
});
