import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";

// VO-014 (FR-026): Light, once chosen, is the appearance of the next visit; a stored value that is not one of the two names opens
// Blueprint Studio with no message; and the saved file, the copied source and the copied Markdown are the same in both appearances
// and hold no appearance.

const KEY = "mermaid-editor.appearance";
const BLUEPRINT_PAGE = "rgb(7, 28, 48)";
const LIGHT_PAGE = "rgb(255, 255, 255)";

test("Light, once chosen, is the appearance of the next visit, on the editor and on the start screen", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", LIGHT_PAGE);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", LIGHT_PAGE);
  await expect(page.getByRole("button", { name: "Light", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.goto("#/");
  await expect(page.locator("body")).toHaveCSS("background-color", LIGHT_PAGE);
});

test("a stored value that is not an appearance opens Blueprint Studio with no message", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "sepia");
  }, KEY);
  await page.goto("#/new/flowchart");
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "blueprint");
  await expect(page.locator("body")).toHaveCSS("background-color", BLUEPRINT_PAGE);
  await expect(page.getByRole("button", { name: "Blueprint Studio", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status", { name: "Messages" })).toHaveText("");
});

async function outputs(page: Page): Promise<{ file: string; source: string; markdown: string }> {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();
  const file = await readFile(await (await download).path(), "utf8");
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("Source copied");
  const source = await readClipboard(page);
  await page.getByRole("button", { name: "Copy for Markdown" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("copied for Markdown");
  return { file, source, markdown: await readClipboard(page) };
}

test("the saved file, the copied source and the copied Markdown are the same in both appearances and hold no appearance", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");

  const inBlueprint = await outputs(page);
  await page.getByRole("button", { name: "Light", exact: true }).click();
  const inLight = await outputs(page);

  expect(inLight).toEqual(inBlueprint);
  for (const text of Object.values(inLight)) expect(text).not.toMatch(/appearance|blueprint|light/i);
  expect(inLight.source).toContain("flowchart");
});
