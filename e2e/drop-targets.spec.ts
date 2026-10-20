import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { addItem, canvas as c4Canvas, handlesOf, itemLabelled, openNew, toolboxButton } from "./support/c4";
import { addParticipants, participantLabelled } from "./support/sequence";

// VO-024 (FR-011, US4-AS3): while a line is drawn, in each view, every valid end is marked as a valid target, a C4 boundary is
// not marked, and the item under the pointer is marked as the drop target, differently from the other valid targets.

interface Point {
  x: number;
  y: number;
}

async function centreOf(item: Locator): Promise<Point> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** The target mark of an item: on the item itself in an SVG view, on the part inside it in the flowchart. */
const markOf = (item: Locator): Promise<string | null> =>
  item.evaluate((element) => (element.hasAttribute("data-target") ? element : element.querySelector("[data-target]"))?.getAttribute("data-target") ?? null);

/** The width of the ring that shows the mark, and whether it is drawn dashed. */
const ringOf = (item: Locator): Promise<{ width: number; dashed: boolean }> =>
  item.evaluate((element) => {
    const ring = element.querySelector("[data-target-ring]");
    if (!ring) return { width: 0, dashed: false };
    const style = getComputedStyle(ring);
    const width = Number.parseFloat(style.borderTopWidth) || Number.parseFloat(style.strokeWidth);
    return { width, dashed: style.borderTopStyle === "dashed" || (style.strokeDasharray !== "none" && style.strokeDasharray !== "") };
  });

async function startLine(page: Page, handle: Locator, towards: Point): Promise<void> {
  const from = await centreOf(handle);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 6, from.y + 6);
  await page.mouse.move(towards.x, towards.y, { steps: 10 });
}

test("while a flowchart line is drawn every node is a valid target and the one under the pointer is the drop target", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 150, y: 140 });
  await addShape(page, canvas, "Circle", { x: 400, y: 140 });
  await addShape(page, canvas, "Diamond", { x: 650, y: 140 });
  const [first, second, third] = [canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), canvas.getByLabel(/^Diamond node/)];
  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual([null, null, null]);

  await startLine(page, first.locator('[data-side="right"]'), await centreOf(second));

  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual(["valid", "drop", "valid"]);
  const [valid, drop] = [await ringOf(first), await ringOf(second)];
  expect(drop.width > valid.width || drop.dashed !== valid.dashed).toBe(true);
  await page.mouse.up();
  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual([null, null, null]);
});

test("while a Sequence message is drawn every participant is a valid target and the one under the pointer is the drop target", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Actor", "B"], ["Participant", "C"]);
  const [first, second, third] = [participantLabelled(page, "A"), participantLabelled(page, "B"), participantLabelled(page, "C")];
  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual([null, null, null]);

  const lifeline = await centreOf(second.getByTestId("lifeline"));
  await startLine(page, first.getByTestId("lifeline"), lifeline);

  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual(["valid", "drop", "valid"]);
  const [valid, drop] = [await ringOf(first), await ringOf(second)];
  expect(drop.width > valid.width || drop.dashed !== valid.dashed).toBe(true);
  await page.mouse.up();
  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual([null, null, null]);
});

test("while a C4 relationship is drawn every element is a valid target, a boundary is not marked, and the item under the pointer is the drop target", async ({ page }) => {
  await openNew(page, "container");
  await addItem(page, "Person", "Alpha");
  await addItem(page, "System", "Beta");
  await addItem(page, "System", "Gamma");
  await toolboxButton(page, "System boundary").click();
  const [first, second, third] = [itemLabelled(page, "Alpha"), itemLabelled(page, "Beta"), itemLabelled(page, "Gamma")];
  const boundary = c4Canvas(page).getByTestId("c4-boundary");
  await expect(boundary).toHaveCount(1);

  await startLine(page, await handlesOf(first, "right"), await centreOf(second));

  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual(["valid", "drop", "valid"]);
  expect(await markOf(boundary)).toBeNull();
  const [valid, drop] = [await ringOf(first), await ringOf(second)];
  expect(drop.width > valid.width || drop.dashed !== valid.dashed).toBe(true);

  // Over the boundary nothing is the drop target and nothing snaps.
  const over = await centreOf(boundary);
  await page.mouse.move(over.x, over.y + 20, { steps: 6 });
  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual(["valid", "valid", "valid"]);
  expect(await markOf(boundary)).toBeNull();
  await page.mouse.up();
  expect([await markOf(first), await markOf(second), await markOf(third)]).toEqual([null, null, null]);
});

test("while a Deployment relationship is drawn the nodes and the elements are valid targets", async ({ page }) => {
  await openNew(page, "deployment");
  await toolboxButton(page, "Deployment node").click();
  await toolboxButton(page, "Container").click();
  const node = c4Canvas(page).getByTestId("c4-node");
  const element = c4Canvas(page).getByTestId("c4-element");
  await expect(node).toHaveCount(1);
  await expect(element).toHaveCount(1);

  await startLine(page, await handlesOf(element, "left"), await centreOf(node));

  // The pointer is over the node, so it is the drop target and the element is a valid end.
  expect(await markOf(element)).toBe("valid");
  expect(await markOf(node)).toBe("drop");
  await page.mouse.up();
});
