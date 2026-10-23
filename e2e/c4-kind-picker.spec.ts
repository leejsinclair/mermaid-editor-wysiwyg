import { expect, test } from "@playwright/test";

// VO-046 (FR-036, FR-037): choosing C4 shows the kind picker, which states that C4 support is experimental, and the
// kind chosen is fixed once the diagram opens.

const NOTE = "C4 support in Mermaid is experimental. Other tools may draw these diagrams differently or not at all.";

test("the kind picker states that C4 support is experimental", async ({ page }) => {
  await page.goto("#/");

  await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "C4" }).click();

  const dialog = page.getByRole("dialog", { name: "Choose a C4 kind" });
  await expect(dialog.getByText(NOTE)).toBeVisible();
  await expect(dialog.getByRole("button")).toHaveText(["Context", "Container", "Component", "Dynamic", "Deployment"]);
});

test("the note is part of the dialog's description, so it is read out with the dialog", async ({ page }) => {
  await page.goto("#/");

  await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "C4" }).click();

  await expect(page.getByRole("dialog", { name: "Choose a C4 kind" })).toHaveAccessibleDescription(NOTE);
});

test("Flowchart and Sequence show no such note", async ({ page }) => {
  await page.goto("#/");

  await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "Sequence" }).click();

  await expect(page.getByText(NOTE)).toHaveCount(0);
});

for (const kind of ["Context", "Container", "Component", "Dynamic", "Deployment"]) {
  test(`choosing ${kind} opens a diagram of that kind, shown in its header, with no way to change it`, async ({ page }) => {
    await page.goto("#/");
    await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "C4" }).click();

    await page.getByRole("dialog", { name: "Choose a C4 kind" }).getByRole("button", { name: kind, exact: true }).click();

    await expect(page).toHaveURL((url) => url.hash === `#/new/c4/${kind.toLowerCase()}`);
    const header = page.getByRole("banner");
    await expect(header.getByText(`C4 ${kind} diagram`, { exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: /type|kind/i })).toHaveCount(0);
    await expect(header.getByRole("button", { name: /type|kind/i })).toHaveCount(0);
  });
}
