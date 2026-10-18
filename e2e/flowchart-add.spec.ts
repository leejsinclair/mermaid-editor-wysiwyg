import { expect, test } from "@playwright/test";

// VO-005: a shape dragged from the toolbox and dropped on a free spot becomes a node at the drop location.

test("dropping a shape on a free spot adds a node there, labelled with its type name", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const drop = { x: 400, y: 250 };

  await page.getByRole("button", { name: "Diamond", exact: true }).dragTo(canvas, { targetPosition: drop });

  const node = canvas.getByLabel("Diamond node: Diamond");
  await expect(node).toBeVisible();
  const [nodeBox, canvasBox] = [await node.boundingBox(), await canvas.boundingBox()];
  expect(nodeBox).not.toBeNull();
  expect(canvasBox).not.toBeNull();
  if (nodeBox && canvasBox) {
    expect(nodeBox.x + nodeBox.width / 2 - canvasBox.x).toBeCloseTo(drop.x, -1);
    expect(nodeBox.y + nodeBox.height / 2 - canvasBox.y).toBeCloseTo(drop.y, -1);
  }
});

test("the source panel lists exactly the node that was added", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });

  await page.getByRole("button", { name: "Diamond", exact: true }).dragTo(canvas, { targetPosition: { x: 300, y: 200 } });

  await page.getByRole("button", { name: "Mermaid source" }).click();
  await expect(page.getByRole("region", { name: "Mermaid source" })).toHaveText(/^flowchart TD\s+n1\{"Diamond"\}$/);
});
