import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-087 (EC-14): the lock lasts only as long as the editing page. When that tab is closed, and separately when it
// crashes, another tab opens the diagram and edits it without being asked to take over.

/** A saved diagram open for editing in a first tab; returns that tab and the diagram's address. */
async function editingTab(context: BrowserContext): Promise<{ readonly editing: Page; readonly address: string }> {
  const editing = await context.newPage();
  await editing.goto("#/new/flowchart");
  await addShape(editing, editing.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(editing).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(editing.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  return { editing, address: editing.url() };
}

async function editsWithoutBeingAsked(context: BrowserContext, address: string): Promise<void> {
  const other = await context.newPage();
  await other.goto(address);
  const canvas = other.getByRole("region", { name: "Diagram canvas" });
  await expect(canvas.locator(".react-flow__node")).toHaveCount(1);
  await expect(other.getByRole("dialog")).toHaveCount(0);
  await addShape(other, canvas, "Circle", { x: 400, y: 200 });
  await expect(other.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  await expect(canvas.locator(".react-flow__node")).toHaveCount(2);
}

test("when the editing tab is closed, another tab edits without being asked", async ({ context }) => {
  const { editing, address } = await editingTab(context);
  await editing.close();

  await editsWithoutBeingAsked(context, address);
});

test("when the editing tab crashes, another tab edits without being asked", async ({ context, browserName }) => {
  // Skipped outside Chromium on purpose: Playwright cannot crash a Firefox tab, so the close test covers it there.
  test.skip(browserName !== "chromium", "Only Chromium can crash a tab on request (chrome://crash)");
  const { editing, address } = await editingTab(context);
  await editing.goto("chrome://crash").catch(() => undefined);
  await expect.poll(() => editing.evaluate(() => 1).then(() => "alive", () => "crashed")).toBe("crashed");

  await editsWithoutBeingAsked(context, address);
});
