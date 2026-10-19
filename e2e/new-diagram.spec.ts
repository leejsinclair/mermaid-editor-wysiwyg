import { expect, test } from "@playwright/test";

// VO-002: each choice opens an empty diagram of its type; the type is displayed and cannot be changed.
// Flowchart, Sequence and the five C4 kinds.

test.describe("a new flowchart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("#/");
    await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "Flowchart" }).click();
  });

  test("opens empty, shows its type, and its source is the bare header", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header.getByText("Flowchart", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Mermaid source" }).click();
    const source = page.getByRole("region", { name: "Mermaid source" });
    await expect(source).toContainText("flowchart TD");
    await expect(source).not.toContainText("-->");
  });

  test("offers no control that changes the type or kind", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header.getByText("Flowchart", { exact: true })).toBeVisible();
    await expect(header.getByRole("combobox")).toHaveCount(0);
    await expect(header.getByRole("button", { name: /type|kind/i })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: /type|kind/i })).toHaveCount(0);
  });
});

test.describe("a new sequence diagram", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("#/");
    await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "Sequence" }).click();
  });

  test("opens empty, shows its type, and its source is the bare header", async ({ page }) => {
    await expect(page.getByRole("banner").getByText("Sequence diagram", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Diagram canvas" }).getByTestId("participant")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Diagram canvas" }).getByTestId("message")).toHaveCount(0);

    await page.getByRole("button", { name: "Mermaid source" }).click();
    await expect(page.getByRole("region", { name: "Mermaid source" })).toHaveText(/^sequenceDiagram$/);
  });

  test("offers no control that changes the type", async ({ page }) => {
    await expect(page.getByRole("banner").getByText("Sequence diagram", { exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: /type|kind/i })).toHaveCount(0);
    await expect(page.getByRole("banner").getByRole("button", { name: /type|kind/i })).toHaveCount(0);
  });
});

const C4_KINDS = [
  ["Context", "C4Context"],
  ["Container", "C4Container"],
  ["Component", "C4Component"],
  ["Dynamic", "C4Dynamic"],
  ["Deployment", "C4Deployment"],
] as const;

for (const [kind, header] of C4_KINDS) {
  test.describe(`a new C4 ${kind} diagram`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("#/");
      await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "C4" }).click();
      await page.getByRole("dialog", { name: "Choose a C4 kind" }).getByRole("button", { name: kind, exact: true }).click();
    });

    test("opens empty, shows its kind, and its source is the bare header", async ({ page }) => {
      await expect(page.getByRole("banner").getByText(`C4 ${kind} diagram`, { exact: true })).toBeVisible();
      const canvas = page.getByRole("region", { name: "Diagram canvas" });
      await expect(canvas.getByTestId("c4-element")).toHaveCount(0);
      await expect(canvas.getByTestId("c4-relationship")).toHaveCount(0);

      await page.getByRole("button", { name: "Mermaid source" }).click();
      await expect(page.getByRole("region", { name: "Mermaid source" }).locator("pre")).toHaveText(header);
    });

    test("offers no control that changes the type or kind", async ({ page }) => {
      await expect(page.getByRole("banner").getByText(`C4 ${kind} diagram`, { exact: true })).toBeVisible();
      await expect(page.getByRole("combobox", { name: /type|kind/i })).toHaveCount(0);
      await expect(page.getByRole("banner").getByRole("button", { name: /type|kind/i })).toHaveCount(0);
    });
  });
}
