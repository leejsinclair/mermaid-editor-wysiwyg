import { expect, test } from "@playwright/test";

// VO-035: the sequence toolbox offers Participant, Actor and the eight message types and nothing else: no notes,
// activations, loops, alternatives, grouping or autonumbering.

test("offers Participant, Actor and exactly the eight message types, and nothing else", async ({ page }) => {
  await page.goto("#/new/sequence");

  const toolbox = page.getByRole("region", { name: "Toolbox" });
  await expect(toolbox.getByRole("group", { name: "Participants" }).getByRole("button")).toHaveText(["Participant", "Actor"]);
  await expect(toolbox.getByRole("group", { name: "Message types" }).getByRole("button")).toHaveText([
    "Solid arrow",
    "Dashed arrow",
    "Solid open arrow",
    "Dashed open arrow",
    "Solid cross",
    "Dashed cross",
    "Solid async arrow",
    "Dashed async arrow",
  ]);
  await expect(toolbox.getByRole("button")).toHaveCount(10);
});

test("offers no notes, activations, loops, alternatives, grouping or autonumbering", async ({ page }) => {
  await page.goto("#/new/sequence");

  await expect(page.getByRole("region", { name: "Toolbox" })).toBeVisible();
  await expect(page.getByRole("button", { name: /note|activat|loop|alt\b|alternative|group|autonumber|rect|critical|break|par\b/i })).toHaveCount(0);
});

test("shows the empty canvas with the Sequence label and the Properties panel", async ({ page }) => {
  await page.goto("#/new/sequence");

  await expect(page.getByRole("region", { name: "Diagram canvas" })).toBeVisible();
  await expect(page.getByText("Sequence diagram", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Properties" })).toBeVisible();
});
