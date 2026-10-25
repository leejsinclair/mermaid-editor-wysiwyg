import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// Spec 008, US7: a repeated action shows the same icon and label wherever it appears (VO-021); the toolbox keeps its own
// illustrations (VO-039); icons cover neither the diagram nor the save status (VO-024); the states of a toolbar button
// differ without colour alone, in both appearances (VO-027, VO-036); icons and labels stay understandable at 360 px and at
// 200 % zoom (VO-040).

const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });
const preview = (page: Page) => page.getByRole("region", { name: "Preview as Mermaid draws it" });
const iconOf = (control: Locator) => control.locator("svg").first().innerHTML();

async function withRectangle(page: Page) {
  await page.goto("#/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
}

test("zoom and fit show the same icon and label in the toolbar and in the preview", async ({ page }) => {
  await withRectangle(page);
  await toolbar(page).getByRole("button", { name: "Preview as Mermaid draws it" }).click();

  for (const name of ["Zoom in", "Zoom out", "Fit to view"]) {
    const inToolbar = toolbar(page).getByRole("button", { name, exact: true });
    const inPreview = preview(page).getByRole("button", { name, exact: true });
    await expect(inPreview, name).toHaveText(name);
    expect(await iconOf(inPreview), name).toBe(await iconOf(inToolbar));
  }
});

test("an action moved into More actions keeps its icon and label", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const wide = await iconOf(toolbar(page).getByRole("button", { name: "Copy Source", exact: true }));

  await page.setViewportSize({ width: 360, height: 740 });
  await page.getByRole("button", { name: "More actions", exact: true }).click();
  const item = page.getByRole("menuitem", { name: "Copy Source", exact: true });

  await expect(item).toBeVisible();
  expect(await iconOf(item)).toBe(wide);
});

test("Delete in the Properties panel has its text label and its icon", async ({ page }) => {
  await withRectangle(page);
  await page.locator(".react-flow__node").first().click();
  const remove = page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Delete", exact: true });

  await expect(remove).toHaveText("Delete");
  await expect(remove.locator("svg")).toHaveCount(1);
});

test("the toolbox keeps a distinct illustration for each shape and connection type", async ({ page }) => {
  await page.goto("#/new/flowchart");
  for (const group of ["Node shapes", "Connection types"]) {
    const buttons = page.getByRole("region", { name: "Toolbox" }).getByRole("group", { name: group }).getByRole("button");
    await expect(buttons.first()).toBeVisible();
    const pictures = await buttons.evaluateAll((items) => items.map((item) => item.querySelector("svg")?.innerHTML ?? ""));
    expect(pictures.length, group).toBeGreaterThan(1);
    expect(pictures.every((picture) => picture !== ""), group).toBe(true);
    expect(new Set(pictures).size, group).toBe(pictures.length);
  }
});

test("no control icon covers the diagram canvas or the save status", async ({ page }) => {
  await withRectangle(page);
  await page.locator(".react-flow__node").first().click();
  const kept = await Promise.all(
    [page.getByRole("region", { name: "Diagram canvas" }), page.getByRole("status", { name: "Save status" })].map((region) => region.boundingBox()),
  );
  const icons = await page.locator("button svg, [role=menuitem] svg").evaluateAll((items) =>
    items.filter((item) => !item.closest('[aria-label="Diagram canvas"]')).map((item) => item.getBoundingClientRect().toJSON() as { x: number; y: number; width: number; height: number }),
  );

  for (const box of kept) {
    if (!box) throw new Error("A region to keep clear is missing");
    for (const icon of icons) {
      const overlaps = icon.x < box.x + box.width && icon.x + icon.width > box.x && icon.y < box.y + box.height && icon.y + icon.height > box.y;
      expect(overlaps, `icon at ${String(icon.x)},${String(icon.y)}`).toBe(false);
    }
  }
});

/** What a toolbar button looks like apart from its colours: border style and width, inset shadow, underline, outline, offset. */
const look = (control: Locator): Promise<string> =>
  control.evaluate((element) => {
    const style = getComputedStyle(element);
    const shadow = style.boxShadow.replace(/rgba?\([^)]*\)/g, "");
    return [style.borderStyle, style.borderWidth, shadow, style.textDecorationLine, style.outlineStyle, style.outlineWidth, style.transform].join("|");
  });

for (const appearance of ["Blueprint Studio", "Light"]) {
  test(`in ${appearance}, a toolbar button's resting, hovered, focused, pressed and disabled states differ without colour`, async ({ page }) => {
    await page.goto("#/new/flowchart");
    await page.getByRole("group", { name: "Appearance" }).getByRole("button", { name: appearance, exact: true }).click();
    const zoomIn = toolbar(page).getByRole("button", { name: "Zoom in", exact: true });
    const fit = toolbar(page).getByRole("button", { name: "Fit to view", exact: true });
    const toggle = toolbar(page).getByRole("button", { name: "Preview as Mermaid draws it" });
    const redo = toolbar(page).getByRole("button", { name: "Redo", exact: true });

    await page.mouse.move(0, 0);
    const resting = await look(fit);
    await zoomIn.hover();
    const hovered = await look(zoomIn);
    await page.mouse.move(0, 0);
    await zoomIn.focus();
    await page.keyboard.press("Tab");
    const focused = await look(page.locator(":focus"));
    await page.mouse.move(0, 0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.locator("body").click({ position: { x: 1, y: 1 } });
    const pressed = await look(toggle);
    await expect(redo).toBeDisabled();
    const disabled = await look(redo);

    const states = { resting, hovered, focused, pressed, disabled };
    expect(new Set(Object.values(states)).size, JSON.stringify(states, null, 1)).toBe(5);
  });
}

for (const size of [{ width: 360, height: 740, name: "360 px" }, { width: 640, height: 450, name: "200 % zoom of a 1280 × 900 window" }]) {
  test(`at ${size.name} every toolbar control has a name, fits the window and shows its label or an icon with a tooltip`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto("#/new/flowchart");
    const buttons = toolbar(page).getByRole("button");

    for (const button of await buttons.all()) {
      const name = (await button.getAttribute("aria-label")) ?? (await button.textContent()) ?? "";
      expect(name.trim(), "accessible name").not.toBe("");
      const box = await button.boundingBox();
      if (!box) continue;
      expect(box.x + box.width, `${name} fits the window`).toBeLessThanOrEqual(size.width);
      if ((await button.textContent())?.trim() === "") {
        // A disabled button takes no pointer events, so the pointer rests on the wrapper that carries its tooltip.
        await button.locator("xpath=..").hover();
        await expect(page.getByRole("tooltip", { name }), `${name} tooltip`).toBeVisible();
        await page.mouse.move(0, 0);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page scrolls sideways").toBe(true);
  });
}
