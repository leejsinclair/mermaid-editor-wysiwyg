import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-082 (FR-048, EC-10): opening a file saved by the editor while the original still exists adds a new saved
// diagram identical to the saved one and leaves the original unchanged.

test("opening a saved file adds a new diagram and leaves the original unchanged", async ({ page }) => {
  await page.goto("/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();
  const file = await (await download).path();

  await page.goto("/");
  const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
  await expect(items).toHaveCount(1);
  const originalHref = await items.first().getByRole("link").getAttribute("href");
  const originalTime = await items.first().locator("time").getAttribute("datetime");

  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open file…" }).click();
  await (await chooser).setFiles(file);

  await expect(page).toHaveURL(/\/d\/[\w-]+$/);
  expect(page.url()).not.toContain(originalHref ?? "none");
  await expect(page.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node")).toHaveCount(1);
  await page.goto("/");
  await expect(items).toHaveCount(2);
  const original = items.filter({ has: page.locator(`a[href="${originalHref ?? ""}"]`) });
  await expect(original.locator("time")).toHaveAttribute("datetime", originalTime ?? "");
});
