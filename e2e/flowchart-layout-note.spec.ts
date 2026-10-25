import { expect, test } from "@playwright/test";

// VO-011: a flowchart states that positions are kept in the editor only; Sequence and C4 show no such statement.

test("a flowchart says that node positions stay in the editor and Mermaid arranges the copy its own way", async ({
  page,
}) => {
  await page.goto("#/new/flowchart");

  await expect(page.getByRole("toolbar").getByRole("button", { name: "Copy Source", exact: true })).toHaveAccessibleDescription(
    "Node positions are kept in the editor only. Mermaid arranges the copied diagram its own way.",
  );
});

test("a sequence diagram shows no such statement, because its layout is fixed by order", async ({ page }) => {
  await page.goto("#/new/sequence");

  await expect(page.getByRole("toolbar")).toBeVisible();
  await expect(page.getByText(/positions are kept|arranges the copied diagram/i)).toHaveCount(0);
});

for (const kind of ["context", "container", "component", "dynamic", "deployment"]) {
  test(`a C4 ${kind} diagram shows no such statement, because Mermaid lays it out from the order`, async ({ page }) => {
    await page.goto(`#/new/c4/${kind}`);

    await expect(page.getByRole("toolbar")).toBeVisible();
    await expect(page.getByText(/positions are kept|arranges the copied diagram/i)).toHaveCount(0);
  });
}
