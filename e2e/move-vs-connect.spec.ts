import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { c4Record, canvas as c4Canvas, handlesOf, itemLabelled, sourceLines as readSourceLines } from "./support/c4";
import { addParticipants, canvas as sequenceCanvas, participantLabelled, participantNames } from "./support/sequence";
import { seedRecords } from "./support/storage";

// Moving and connecting are separate gestures (spec 004-canvas-usability, US3).
// VO-017 (FR-014, US3-AS3, SC-001): an item dragged by its body moves as its view allows and never makes a line, whether it is
// released over empty canvas, over another item's body or over another item's handle; a body drag that changes nothing commits
// nothing. VO-018 (FR-015, FR-017, US3-AS4, SC-001): a drag from a connection handle shows a preview line and moves nothing.
// VO-021 (FR-014, US3-AS7): a C4 element or Deployment node dragged by its body takes the membership of the box it is
// released in, and no relationship is made.

interface Point {
  x: number;
  y: number;
}
const TARGETS = ["empty canvas", "another item's body", "another item's handle"] as const;

/** The generated source; opening its panel scrolls the page, so the page is put back at the top for the next drag. */
async function sourceLines(page: Page): Promise<string[]> {
  const lines = await readSourceLines(page);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  return lines;
}

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const undoButton = (page: Page) => page.getByRole("button", { name: "Undo", exact: true });

async function centreOf(item: Locator): Promise<Point> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Presses at one point and drags to another in steps; `release` false leaves the button down. */
async function dragTo(page: Page, from: Point, to: Point, release = true): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 3, from.y + 3);
  await page.mouse.move(to.x, to.y, { steps: 12 });
  if (release) await page.mouse.up();
}

/** A point in an empty part of the canvas, away from any item. */
async function emptyPoint(page: Page): Promise<Point> {
  const box = await canvas(page).boundingBox();
  if (!box) throw new Error("The canvas must be on screen");
  const view = page.viewportSize() ?? { width: 1280, height: 720 };
  return { x: Math.min(box.x + box.width - 60, view.width - 40), y: Math.min(box.y + box.height - 60, view.height - 40) };
}

// ---- Flowchart -------------------------------------------------------------------------------------------------------------

async function twoNodes(page: Page) {
  await page.goto("#/new/flowchart");
  await addShape(page, canvas(page), "Rectangle", { x: 200, y: 120 });
  await addShape(page, canvas(page), "Circle", { x: 520, y: 360 });
  return { rectangle: canvas(page).getByLabel(/^Rectangle node/), circle: canvas(page).getByLabel(/^Circle node/), edges: canvas(page).locator(".react-flow__edge") };
}

for (const target of TARGETS) {
  test(`a flowchart node dragged by its body and released over ${target} moves and makes no line`, async ({ page }) => {
    const { rectangle, circle, edges } = await twoNodes(page);
    const before = await rectangle.boundingBox();
    let to: Point;
    if (target === "empty canvas") to = await emptyPoint(page);
    else if (target === "another item's body") to = await centreOf(circle);
    else to = await centreOf(circle.locator('[data-side="top"]'));

    await dragTo(page, await centreOf(rectangle), to);

    const after = await rectangle.boundingBox();
    expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0)) + Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeGreaterThan(20);
    await expect(edges).toHaveCount(0);
  });
}

test("a flowchart node dragged by its body and released outside the canvas commits nothing", async ({ page }) => {
  const { rectangle } = await twoNodes(page);
  const header = await page.getByRole("banner").boundingBox();
  if (!header) throw new Error("The header must be on screen");
  const before = await rectangle.boundingBox();

  await dragTo(page, await centreOf(rectangle), { x: header.x + 40, y: header.y + header.height / 2 });

  expect(await rectangle.boundingBox()).toEqual(before);
  await undoButton(page).click();
  await expect(canvas(page).locator(".react-flow__node")).toHaveCount(1);
});

test("a drag from a flowchart node's handle shows a preview line and does not move the node", async ({ page }) => {
  const { rectangle, edges } = await twoNodes(page);
  const before = await rectangle.boundingBox();
  const handle = await centreOf(rectangle.locator('[data-side="right"]'));
  const to = await emptyPoint(page);

  await dragTo(page, handle, to, false);
  await expect(canvas(page).locator(".react-flow__connection")).toHaveCount(1);
  await page.mouse.up();

  await expect(canvas(page).locator(".react-flow__connection")).toHaveCount(0);
  expect(await rectangle.boundingBox()).toEqual(before);
  await expect(edges).toHaveCount(0);
});

// ---- Sequence --------------------------------------------------------------------------------------------------------------

async function threeParticipants(page: Page) {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
  return { header: (name: string) => participantLabelled(page, name).getByTestId("participant-header"), lifeline: (name: string) => participantLabelled(page, name).locator('[data-zone="connect"]') };
}

for (const target of TARGETS) {
  test(`a participant dragged by its header and released over ${target} is reordered and makes no message`, async ({ page }) => {
    const { header, lifeline } = await threeParticipants(page);
    let to: Point;
    if (target === "empty canvas") to = await emptyPoint(page);
    else if (target === "another item's body") to = await centreOf(header("C"));
    else to = await centreOf(lifeline("C"));

    await dragTo(page, await centreOf(header("A")), to);

    expect(await participantNames(page)).toEqual(["Participant: B", "Participant: C", "Participant: A"]);
    await expect(sequenceCanvas(page).getByTestId("message")).toHaveCount(0);
  });
}

test("a participant dragged within its own place commits nothing", async ({ page }) => {
  const { header } = await threeParticipants(page);
  const start = await centreOf(header("B"));

  await dragTo(page, start, { x: start.x + 30, y: start.y });

  expect(await participantNames(page)).toEqual(["Participant: A", "Participant: B", "Participant: C"]);
  // One Undo undoes the last thing that was committed, which is the rename of C and not a reorder.
  await undoButton(page).click();
  expect(await participantNames(page)).toEqual(["Participant: A", "Participant: B", "Participant: Participant"]);
});

test("a drag from a participant's lifeline shows a preview line and moves nothing", async ({ page }) => {
  const { lifeline } = await threeParticipants(page);
  const start = await centreOf(lifeline("A"));

  await dragTo(page, start, { x: start.x + 150, y: start.y + 20 }, false);
  await expect(sequenceCanvas(page).getByTestId("connection-preview")).toHaveCount(1);
  await page.mouse.up();

  await expect(sequenceCanvas(page).getByTestId("connection-preview")).toHaveCount(0);
  expect(await participantNames(page)).toEqual(["Participant: A", "Participant: B", "Participant: C"]);
});

// ---- C4 --------------------------------------------------------------------------------------------------------------------

/** Customer and Shop at the top level; the boundary Alpha holds Extra. */
async function boundaryDiagram(page: Page): Promise<void> {
  await page.goto("#/");
  await seedRecords(page, [
    c4Record("moves", "Moves", "container", [
      { item: "element", id: 1, elementType: "person", label: "Customer" },
      { item: "element", id: 2, elementType: "system", label: "Shop" },
      { item: "boundary", id: 3, boundaryType: "system", label: "Alpha", children: [{ item: "element", id: 4, elementType: "system", label: "Extra" }] },
    ]),
  ]);
  await page.goto("#/d/moves");
  await page.reload();
  await expect(c4Canvas(page)).toBeVisible();
}

/** Whether the source draws the element inside the boundary. */
async function insideBoundary(page: Page, alias: string): Promise<boolean> {
  const lines = await sourceLines(page);
  const open = lines.findIndex((line) => line.includes('Boundary(b3, "Alpha")'));
  const close = lines.indexOf("}", open);
  const at = lines.findIndex((line) => line.includes(`(${alias},`));
  return open >= 0 && at > open && at < close;
}

const relationships = (page: Page) => c4Canvas(page).getByTestId("c4-relationship");

for (const target of ["another item's body", "another item's handle"] as const) {
  test(`a C4 element dragged by its body and released over ${target} inside a boundary moves into the boundary and makes no relationship`, async ({ page }) => {
    await boundaryDiagram(page);
    expect(await insideBoundary(page, "e2")).toBe(false);
    const extra = itemLabelled(page, "Extra");
    const to = target === "another item's body" ? await centreOf(extra) : await centreOf(await handlesOf(extra, "left"));

    await dragTo(page, await centreOf(itemLabelled(page, "Shop")), to);

    expect(await insideBoundary(page, "e2")).toBe(true);
    await expect(relationships(page)).toHaveCount(0);
  });
}

test("a C4 element dragged by its body into the boundary's empty area moves into the boundary", async ({ page }) => {
  await boundaryDiagram(page);
  const alpha = itemLabelled(page, "Alpha");
  const box = await alpha.boundingBox();
  if (!box) throw new Error("The boundary must be on screen");

  await dragTo(page, await centreOf(itemLabelled(page, "Shop")), { x: box.x + box.width - 20, y: box.y + box.height - 20 });

  expect(await insideBoundary(page, "e2")).toBe(true);
  await expect(relationships(page)).toHaveCount(0);
});

test("a C4 element dragged out of a boundary to empty canvas moves to the top level and makes no relationship", async ({ page }) => {
  await boundaryDiagram(page);
  expect(await insideBoundary(page, "e4")).toBe(true);

  await dragTo(page, await centreOf(itemLabelled(page, "Extra")), await emptyPoint(page));

  expect(await insideBoundary(page, "e4")).toBe(false);
  await expect(relationships(page)).toHaveCount(0);
});

test("a C4 element dragged within its own place commits nothing", async ({ page }) => {
  await boundaryDiagram(page);
  const customer = itemLabelled(page, "Customer");
  const sourceBefore = await sourceLines(page);
  const start = await centreOf(customer);

  await dragTo(page, start, { x: start.x + 20, y: start.y + 10 });

  expect(await sourceLines(page)).toEqual(sourceBefore);
  await expect(relationships(page)).toHaveCount(0);
  await expect(undoButton(page)).toBeDisabled();
});

test("a drag from a C4 element's handle shows a preview line and moves nothing", async ({ page }) => {
  await boundaryDiagram(page);
  const sourceBefore = await sourceLines(page);
  const handle = await centreOf(await handlesOf(itemLabelled(page, "Customer"), "right"));

  await dragTo(page, handle, await emptyPoint(page), false);
  await expect(c4Canvas(page).getByTestId("connection-preview")).toHaveCount(1);
  await page.mouse.up();

  await expect(c4Canvas(page).getByTestId("connection-preview")).toHaveCount(0);
  expect(await sourceLines(page)).toEqual(sourceBefore);
  await expect(relationships(page)).toHaveCount(0);
});

test("a Deployment node dragged by its body onto another node moves into it and makes no relationship", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [
    c4Record("nodes", "Nodes", "deployment", [
      { item: "deployment-node", id: 1, label: "Server", children: [{ item: "element", id: 3, elementType: "container", label: "App" }] },
      { item: "deployment-node", id: 2, label: "Spare", children: [] },
    ]),
  ]);
  await page.goto("#/d/nodes");
  await page.reload();
  await expect(c4Canvas(page)).toBeVisible();

  await dragTo(page, await centreOf(itemLabelled(page, "Spare").getByTestId("item-label")), await centreOf(itemLabelled(page, "App")));

  const lines = await sourceLines(page);
  const server = lines.findIndex((line) => line.includes('"Server"'));
  const spare = lines.findIndex((line) => line.includes('"Spare"'));
  expect(spare).toBeGreaterThan(server);
  expect(spare).toBeLessThan(lines.lastIndexOf("}"));
  await expect(relationships(page)).toHaveCount(0);
});

// ---- Cancelling a line (VO-019, FR-017, US3-AS5, SC-006) -------------------------------------------------------------------

/** How many steps Undo can take back: the undo history's depth. Reading it empties the history. */
async function undoDepth(page: Page): Promise<number> {
  let depth = 0;
  while (await undoButton(page).isEnabled()) {
    await undoButton(page).click();
    depth += 1;
  }
  return depth;
}

/** Where a line is let go, or cancelled with Escape. */
const ENDINGS = ["empty canvas", "outside the canvas", "Escape"] as const;

/** Lets go of (or cancels) a line being drawn, with the button still down. */
async function finish(page: Page, ending: (typeof ENDINGS)[number]): Promise<void> {
  if (ending === "Escape") await page.keyboard.press("Escape");
  await page.mouse.up();
}

/** The point to let go at for an ending. */
async function endingPoint(page: Page, ending: (typeof ENDINGS)[number]): Promise<Point> {
  if (ending === "outside the canvas") {
    const header = await page.getByRole("banner").boundingBox();
    if (!header) throw new Error("The header must be on screen");
    return { x: header.x + 40, y: header.y + header.height / 2 };
  }
  return emptyPoint(page);
}

for (const ending of ENDINGS) {
  test(`a flowchart line let go over ${ending} makes no line and changes nothing`, async ({ page }) => {
    const { rectangle, edges } = await twoNodes(page);
    const at = await endingPoint(page, ending);

    await dragTo(page, await centreOf(rectangle.locator('[data-side="right"]')), at, false);
    await finish(page, ending);

    await expect(edges).toHaveCount(0);
    await expect(canvas(page).locator(".react-flow__connection")).toHaveCount(0);
    expect(await undoDepth(page)).toBe(2);
  });

  test(`a Sequence message drawn from a lifeline and let go over ${ending} makes no message and changes nothing`, async ({ page }) => {
    const { lifeline } = await threeParticipants(page);
    const at = await endingPoint(page, ending);

    await dragTo(page, await centreOf(lifeline("A")), at, false);
    await finish(page, ending);

    await expect(sequenceCanvas(page).getByTestId("message")).toHaveCount(0);
    await expect(sequenceCanvas(page).getByTestId("connection-preview")).toHaveCount(0);
    expect(await undoDepth(page)).toBe(6);
  });

  test(`a C4 line let go over ${ending} makes no relationship and changes nothing`, async ({ page }) => {
    await boundaryDiagram(page);
    const at = await endingPoint(page, ending);

    await dragTo(page, await centreOf(await handlesOf(itemLabelled(page, "Customer"), "right")), at, false);
    await finish(page, ending);

    await expect(relationships(page)).toHaveCount(0);
    await expect(c4Canvas(page).getByTestId("connection-preview")).toHaveCount(0);
    await expect(undoButton(page)).toBeDisabled();
  });
}

test("a C4 line let go over a boundary makes no relationship and changes nothing", async ({ page }) => {
  await boundaryDiagram(page);
  const alpha = await itemLabelled(page, "Alpha").boundingBox();
  if (!alpha) throw new Error("The boundary must be on screen");

  await dragTo(page, await centreOf(await handlesOf(itemLabelled(page, "Customer"), "right")), { x: alpha.x + alpha.width - 16, y: alpha.y + alpha.height - 16 });

  await expect(relationships(page)).toHaveCount(0);
  await expect(undoButton(page)).toBeDisabled();
});

test("a flowchart line cancelled with Escape stays cancelled when the pointer is then let go over a node", async ({ page }) => {
  const { rectangle, circle, edges } = await twoNodes(page);

  await dragTo(page, await centreOf(rectangle.locator('[data-side="right"]')), await centreOf(circle.locator('[data-side="left"]')), false);
  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect(edges).toHaveCount(0);
  expect(await undoDepth(page)).toBe(2);
});
