import { expect, test, type Page } from "@playwright/test";
import { BEFORE } from "./support/controlInventory";

// VO-035 (FR-010, US5-AS3, SC-005): at 360, 768 and 1440 px wide the page of each diagram type never scrolls sideways, and every
// control offered before the redesign can be reached (through the "Tools" panel and the "More actions" menu where the layout puts
// them there) and works: Copy Source from the menu reports its result.

const WIDTHS = [360, 768, 1440] as const;
const CASES = [
  { type: "flowchart", address: "#/new/flowchart", add: "Rectangle" },
  { type: "sequence", address: "#/new/sequence", add: "Participant" },
  { type: "c4", address: "#/new/c4/context", add: "Person" },
] as const;

const NOT_CONTROLS_OF_THE_LAYOUT = new Set(["link:React Flow attribution"]);

/** Whether a control is on the page as it is, with the tools panel open and the menu closed. */
async function isOnPage(page: Page, role: string, name: string): Promise<boolean> {
  if (name === "Mermaid source") return (await page.getByRole("button", { name: /Mermaid source/ }).count()) > 0;
  return (await page.getByRole(role as "button" | "textbox" | "link", { name, exact: true }).count()) > 0;
}

for (const { type, address, add } of CASES) {
  for (const width of WIDTHS) {
    test(`a ${type} editor at ${String(width)} px does not scroll sideways and offers every control it offered before the redesign`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(address);
      await expect(page.getByRole("region", { name: "Diagram canvas" })).toBeVisible();
      const tools = page.getByRole("button", { name: "Tools", exact: true });
      if (await tools.isVisible()) await tools.click();
      await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }).click();
      if (await tools.isVisible()) await tools.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page scrolls sideways").toBe(true);

      if (await tools.isVisible()) await tools.click();
      const before = new Map(Object.entries(BEFORE)).get(type);
      if (before === undefined) throw new Error(`No recorded inventory for ${type}`);
      const inMenu: string[] = [];
      for (const control of before.nothing) {
        if (NOT_CONTROLS_OF_THE_LAYOUT.has(control)) continue;
        const [role = "", name = ""] = control.split(/:(.*)/s);
        if (!(await isOnPage(page, role, name))) inMenu.push(name);
      }
      // What is not on the page is under "More actions": a menu item with the same name.
      if (inMenu.length > 0) {
        await page.getByRole("button", { name: "More actions", exact: true }).click();
        for (const name of inMenu) await expect(page.getByRole("menuitem", { name, exact: true }), `${name} in the More actions menu at ${String(width)} px`).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("menu")).toBeHidden();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "the page scrolls sideways with everything open").toBe(true);
    });
  }
}

test("Copy Source from the More actions menu at 360 px copies and reports it", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("#/new/flowchart");
  await expect(page.getByRole("region", { name: "Diagram canvas" })).toBeVisible();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await page.getByRole("button", { name: "More actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Copy Source", exact: true }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("Source copied");
});
