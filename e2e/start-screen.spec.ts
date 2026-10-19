import { expect, test } from "@playwright/test";

// VO-001: starting a new diagram offers Flowchart, Sequence and C4; choosing C4 offers the five kinds.

test("starting a new diagram offers exactly Flowchart, Sequence and C4", async ({ page }) => {
  await page.goto("#/");

  const choices = page.getByRole("region", { name: "New diagram" }).getByRole("button");
  await expect(choices).toHaveText(["Flowchart", "Sequence", "C4"]);
});

test("choosing C4 offers exactly Context, Container, Component, Dynamic and Deployment", async ({ page }) => {
  await page.goto("#/");

  await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "C4" }).click();

  const dialog = page.getByRole("dialog", { name: "Choose a C4 kind" });
  await expect(dialog.getByRole("button")).toHaveText(["Context", "Container", "Component", "Dynamic", "Deployment"]);
});
