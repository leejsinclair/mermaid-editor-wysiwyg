import { expect, test, type Page } from "@playwright/test";

// VO-009 (FR-005, FR-006, US1-AS2): at 1440 × 900 the header of each diagram type holds the application name, the diagram's name
// with Rename, the document actions, Undo, Redo and the appearance switch; the diagram canvas is the largest region and covers at
// least half the window's width and half its height.

test.use({ viewport: { width: 1440, height: 900 } });

const TYPES: readonly (readonly [string, string, RegExp])[] = [
  ["flowchart", "#/new/flowchart", /Untitled flowchart|Flowchart/],
  ["sequence diagram", "#/new/sequence", /Untitled sequence|Sequence/],
  ["C4 diagram", "#/new/c4/context", /Untitled C4|C4/],
];

async function area(page: Page, name: string): Promise<{ width: number; height: number }> {
  const box = await page.getByRole("region", { name, exact: true }).first().boundingBox();
  if (!box) throw new Error(`The ${name} region must be on screen`);
  return { width: box.width, height: box.height };
}

for (const [label, address, name] of TYPES) {
  test(`the header of a ${label} holds the name, document actions, Undo, Redo and the appearance switch, and the canvas is the largest region`, async ({ page }) => {
    await page.goto(address);
    const header = page.getByRole("banner");
    await expect(header.getByText("Mermaid diagram editor", { exact: true })).toBeVisible();
    await expect(header.getByText(name).first()).toBeVisible();
    await expect(header.getByRole("button", { name: "Rename diagram" })).toBeVisible();
    const toolbar = header.getByRole("toolbar", { name: "Diagram actions" });
    for (const action of ["Copy Source", "Copy for Markdown", "Save file", "Undo", "Redo"]) {
      await expect(toolbar.getByRole("button", { name: action, exact: true })).toBeVisible();
    }
    await expect(header.getByRole("group", { name: "Appearance" })).toBeVisible();

    const canvas = await area(page, "Diagram canvas");
    expect(canvas.width).toBeGreaterThanOrEqual(1440 / 2);
    expect(canvas.height).toBeGreaterThanOrEqual(900 / 2);
    for (const other of ["Toolbox", "Properties"]) {
      const box = await area(page, other);
      expect(canvas.width * canvas.height, `the canvas against the ${other} region`).toBeGreaterThan(box.width * box.height);
    }
  });
}
