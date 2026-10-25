import { expect, test, type Page } from "@playwright/test";

// Spec 008, US4 for sequence and C4 diagrams: the preview shows the source generated from the current diagram, rendered
// as Mermaid draws it, and refreshes after an edit; Back to editing keeps the diagram, layout and undo history. Their
// layout comes from order, so neither the preview nor the export actions claim node positions stay in the editor
// (FR-024; decided 2026-10-24, the note is for flowcharts only). VO-013, VO-014.

const TOGGLE = "Preview as Mermaid draws it";
const NOTE = "Node positions are kept in the editor only. Mermaid arranges the copied diagram its own way.";

const preview = (page: Page) => page.getByRole("region", { name: TOGGLE });

async function sourceText(page: Page): Promise<string> {
  const panel = page.getByRole("region", { name: "Mermaid source" });
  if ((await panel.count()) === 0) await page.getByRole("button", { name: /^Mermaid source/ }).click();
  return (await panel.textContent()) ?? "";
}

const CASES = [
  {
    type: "sequence",
    open: async (page: Page) => {
      const support = await import("./support/sequence");
      await page.goto("#/new/sequence");
      await support.addParticipants(page, ["Participant", "Alice"], ["Actor", "Bob"]);
      return {
        labels: ["Alice", "Bob"],
        edit: async () => {
          await support.addParticipants(page, ["Participant", "Carol"]);
        },
        added: "Carol",
      };
    },
  },
  {
    type: "c4",
    open: async (page: Page) => {
      const support = await import("./support/c4");
      await support.openNew(page, "context");
      await support.addItem(page, "Person", "Customer");
      await support.addItem(page, "System", "Shop");
      return {
        labels: ["Customer", "Shop"],
        edit: async () => {
          await support.addItem(page, "System", "Bank");
        },
        added: "Bank",
      };
    },
  },
] as const;

for (const { type, open } of CASES) {
  test(`a ${type} diagram's preview shows its current source and follows an edit`, async ({ page }) => {
    const { labels, edit, added } = await open(page);
    await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
    await page.getByRole("button", { name: TOGGLE }).click();

    await expect(preview(page).getByRole("application").locator("svg").first()).toBeVisible();
    for (const label of labels) await expect(preview(page)).toContainText(label);
    await expect(preview(page).getByText(NOTE)).toHaveCount(0);

    await edit();
    await expect(preview(page)).toContainText(added, { timeout: 2000 });
  });

  test(`a ${type} diagram's Back to editing keeps the diagram and its undo history`, async ({ page }) => {
    const { edit, added } = await open(page);
    await edit();
    const before = await sourceText(page);
    await page.getByRole("button", { name: TOGGLE }).click();

    await preview(page).getByRole("button", { name: "Back to editing", exact: true }).click();

    await expect(preview(page)).toHaveCount(0);
    expect(await sourceText(page)).toBe(before);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect.poll(() => sourceText(page)).not.toContain(added);
  });

  test(`a ${type} diagram makes no claim about node positions beside Copy Source and Save file`, async ({ page }) => {
    await open(page);
    const exportGroup = page.getByRole("toolbar", { name: "Diagram actions" }).getByRole("group", { name: "Export and sharing" });
    await expect(exportGroup.getByRole("button", { name: "Copy Source", exact: true })).toBeVisible();
    await expect(exportGroup.getByRole("button", { name: "Copy Source", exact: true })).not.toHaveAccessibleDescription(NOTE);
    await expect(exportGroup.getByText(NOTE)).toHaveCount(0);
  });
}
