import { expect, test } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-010: a drag from the toolbox, and a drag of an existing node, that end outside the canvas change nothing.
// Undo availability is asserted here once Undo exists (T081).

test("a toolbox drag that ends outside the canvas adds no node", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });

  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(page.getByRole("banner"));

  await expect(canvas.getByLabel(/ node: /)).toHaveCount(0);
  await page.getByRole("button", { name: "Mermaid source" }).click();
  await expect(page.getByRole("region", { name: "Mermaid source" })).toHaveText(/^flowchart TD$/);
});

test("a node dragged out of the canvas follows the pointer, then stays where it was when released outside", async ({
  page,
}) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 300, y: 200 });
  const node = canvas.getByLabel("Rectangle node: Rectangle", { exact: true });
  const before = await node.boundingBox();
  const header = await page.getByRole("banner").boundingBox();
  if (!before || !header) throw new Error("The node and the header must be visible");
  const grab = { x: before.x + before.width / 2, y: before.y + before.height / 2 };

  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  // A small first move starts the drag; the node then follows the pointer from there.
  await page.mouse.move(grab.x + 2, grab.y + 2);
  await page.mouse.move(grab.x + 120, grab.y + 80, { steps: 8 });
  const during = await node.boundingBox();
  expect(during?.x).toBeCloseTo(before.x + 120, -1);
  expect(during?.y).toBeCloseTo(before.y + 80, -1);

  await page.mouse.move(grab.x, header.y + header.height / 2, { steps: 8 });
  await page.mouse.up();

  const after = await node.boundingBox();
  expect(after?.x).toBeCloseTo(before.x, 0);
  expect(after?.y).toBeCloseTo(before.y, 0);
  await page.getByRole("button", { name: "Mermaid source" }).click();
  await expect(page.getByRole("region", { name: "Mermaid source" })).toHaveText(/^flowchart TD\s+n1\["Rectangle"\]$/);
});
