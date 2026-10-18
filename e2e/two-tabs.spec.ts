import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-086 (FR-050, EC-13): one editing tab per diagram. A second tab asks before taking over and then shows the
// latest saved version; the first tab stops editing, drops its open label edit, says why and can take it back; the
// two tabs never both save.

test("a second tab can take over editing, and the first can take it back", async ({ page, context }) => {
  await page.goto("/new/flowchart");
  const canvasA = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvasA, "Rectangle", { x: 200, y: 100 });
  await expect(page).toHaveURL(/\/d\/[\w-]+$/);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  const address = page.url();

  // A label edit is open in the first tab when the second tab arrives.
  await canvasA.getByLabel(/^Rectangle node/).click();
  const labelA = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await labelA.fill("Unconfirmed words");

  const second = await context.newPage();
  await second.goto(address);
  const askingSecond = second.getByRole("dialog", { name: "Open in another tab" });
  await expect(askingSecond).toBeVisible();
  await askingSecond.getByRole("button", { name: "Edit here instead" }).click();

  // The second tab edits the latest saved version.
  const canvasB = second.getByRole("region", { name: "Diagram canvas" });
  await expect(canvasB.locator(".react-flow__node")).toHaveCount(1);
  await expect(canvasB.getByTestId("node-label")).toHaveText("Rectangle");
  await addShape(second, canvasB, "Circle", { x: 400, y: 200 });
  await expect(second.getByRole("status", { name: "Save status" })).toHaveText("Saved");

  // The first tab has stopped editing, dropped the label edit and says why.
  const movedA = page.getByRole("dialog", { name: "Editing moved to another tab" });
  await expect(movedA).toBeVisible();
  await expect(movedA).toContainText("Another tab is now editing this diagram");
  // The dialog hides the page behind it from the accessibility tree, so the field is found with hidden ones included.
  await expect(page.getByRole("textbox", { name: "Label", includeHidden: true })).not.toHaveValue("Unconfirmed words");

  // Taking it back shows what the second tab saved, and the second tab is now the one that must ask.
  await movedA.getByRole("button", { name: "Take it back" }).click();
  await expect(movedA).toHaveCount(0);
  await expect(canvasA.locator(".react-flow__node")).toHaveCount(2);
  await expect(second.getByRole("dialog", { name: "Editing moved to another tab" })).toBeVisible();

  // Only the tab that holds the diagram saves: the first tab's next change is the one that lasts.
  await addShape(page, canvasA, "Diamond", { x: 100, y: 300 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  await second.reload();
  await second.getByRole("dialog", { name: "Open in another tab" }).getByRole("button", { name: "Edit here instead" }).click();
  await expect(second.getByRole("region", { name: "Diagram canvas" }).locator(".react-flow__node")).toHaveCount(3);
});

test("a second tab can decline and leave the diagram with the first", async ({ page, context }) => {
  await page.goto("/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  await expect(page).toHaveURL(/\/d\/[\w-]+$/);

  const second = await context.newPage();
  await second.goto(page.url());
  await second.getByRole("dialog", { name: "Open in another tab" }).getByRole("button", { name: "Cancel" }).click();

  await expect(second).toHaveURL(/\/$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
