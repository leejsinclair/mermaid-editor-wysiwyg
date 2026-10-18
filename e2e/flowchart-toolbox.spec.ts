import { expect, test } from "@playwright/test";

// VO-003: the flowchart toolbox offers exactly nine node shapes and nine connection types, each with its own name.

test("offers exactly the nine node shapes and nine connection types, and nothing else", async ({ page }) => {
  await page.goto("/new/flowchart");

  const toolbox = page.getByRole("region", { name: "Toolbox" });
  await expect(toolbox.getByRole("group", { name: "Node shapes" }).getByRole("button")).toHaveText([
    "Rectangle",
    "Rounded rectangle",
    "Stadium",
    "Diamond",
    "Circle",
    "Parallelogram",
    "Cylinder",
    "Subroutine",
    "Hexagon",
  ]);
  await expect(toolbox.getByRole("group", { name: "Connection types" }).getByRole("button")).toHaveText([
    "Solid arrow",
    "Solid line",
    "Solid two-way arrow",
    "Dotted arrow",
    "Dotted line",
    "Dotted two-way arrow",
    "Thick arrow",
    "Thick line",
    "Thick two-way arrow",
  ]);
  await expect(toolbox.getByRole("button")).toHaveCount(18);
});

test("offers no direction control", async ({ page }) => {
  await page.goto("/new/flowchart");

  await expect(page.getByRole("region", { name: "Toolbox" })).toBeVisible();
  await expect(page.getByRole("button", { name: /direction|top.?down|left.?right/i })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: /direction/i })).toHaveCount(0);
});
