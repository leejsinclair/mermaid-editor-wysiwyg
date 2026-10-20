import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { addItem, addRelationship, canvas as c4Canvas, handlesOf, itemLabelled, openNew } from "./support/c4";
import { addMessage, addParticipants, canvas as sequenceCanvas, participantLabelled } from "./support/sequence";

// A selected line's end handle is the only thing there (spec 004-canvas-usability, US3).
// VO-040 (FR-016): where a selected line's end handle sits on an item's connection handle, only the end handle shows and is
// hit; dragging it moves the end; the item's other handles still draw new lines. VO-050 (FR-011, EC-13): a new line let go
// over the selected line's end handle ends at the item that end belongs to.

interface Point {
  x: number;
  y: number;
}

const VIEWS = ["flowchart", "sequence", "c4"] as const;
type View = (typeof VIEWS)[number];

async function centreOf(item: Locator): Promise<Point> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function drag(page: Page, from: Point, to: Point): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 3, from.y + 3);
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

/** Where to press on a handle: its middle, or for a lifeline (a tall strip that message rows cross) a point just below its header. */
async function handlePoint(handle: Locator): Promise<Point> {
  const box = await handle.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  const strip = (await handle.getAttribute("data-testid")) === "lifeline";
  return { x: box.x + box.width / 2, y: strip ? box.y + 24 : box.y + box.height / 2 };
}

/** The zone of the part drawn at a point. */
const zoneAt = (page: Page, point: Point): Promise<string | null> =>
  page.evaluate(({ x, y }) => {
    const owner = document.elementFromPoint(x, y)?.closest('[data-zone], [class~="react-flow__edgeupdater"]');
    if (!owner) return null;
    return owner.matches('[class~="react-flow__edgeupdater"]') ? "end" : owner.getAttribute("data-zone");
  }, point);

interface Fixture {
  /** The end handle of the selected line that ends at the second item. */
  readonly end: Locator;
  /** The second item's connection handle the end handle sits on, when it has one apart from the end handle. */
  readonly covered: Locator | null;
  /** A connection handle of the second item that the end handle does not cover. */
  readonly other: Locator;
  /** The third item, a place to move the end to or to draw a line to. */
  readonly third: Locator;
  /** A connection handle of the third item. */
  readonly thirdHandle: Locator;
  /** The names of the lines in the order drawn, as they are announced. */
  readonly lines: () => Promise<(string | null)[]>;
  /** How the first line is announced once it ends at the third item. */
  readonly endsAtThird: RegExp;
  /** How a line from the first item to the second is announced. */
  readonly endsAtSecond: RegExp;
}

async function fixture(page: Page, view: View): Promise<Fixture> {
  if (view === "flowchart") {
    await page.goto("#/new/flowchart");
    const canvas = page.getByRole("region", { name: "Diagram canvas" });
    await addShape(page, canvas, "Rectangle", { x: 150, y: 140 });
    await addShape(page, canvas, "Circle", { x: 400, y: 140 });
    await addShape(page, canvas, "Diamond", { x: 650, y: 140 });
    const [first, second, third] = [canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), canvas.getByLabel(/^Diamond node/)];
    await drag(page, await centreOf(first.locator('[data-side="right"]')), await centreOf(second.locator('[data-side="left"]')));
    const edges = canvas.locator(".react-flow__edge");
    await expect(edges).toHaveCount(1);
    await edges.first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" })).toBeVisible();
    return {
      end: edges.first().locator('[class~="react-flow__edgeupdater-target"]'),
      covered: second.locator('[data-side="left"]'),
      other: second.locator('[data-side="right"]'),
      third,
      thirdHandle: third.locator('[data-side="top"]'),
      lines: () => edges.evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
      endsAtThird: /to Diamond$/,
      endsAtSecond: /to Circle$/,
    };
  }
  if (view === "sequence") {
    await page.goto("#/new/sequence");
    await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
    await addMessage(page, "Solid arrow", "A", "B");
    const message = sequenceCanvas(page).getByTestId("message").first();
    await message.focus();
    await page.keyboard.press("Enter");
    const lifeline = (name: string) => participantLabelled(page, name).locator('[data-zone="connect"]').first();
    return {
      end: sequenceCanvas(page).getByTestId("message-end-to"),
      covered: null,
      other: lifeline("B"),
      third: participantLabelled(page, "C").getByTestId("participant-header"),
      thirdHandle: lifeline("C"),
      lines: () => sequenceCanvas(page).getByTestId("message").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
      endsAtThird: /to C:/,
      endsAtSecond: /to B:/,
    };
  }
  await openNew(page, "container");
  await addItem(page, "Person", "Alpha");
  await addItem(page, "System", "Beta");
  await addItem(page, "System", "Gamma");
  await addRelationship(page, "One-way relationship", "Alpha", "Beta");
  const relationship = c4Canvas(page).getByTestId("c4-relationship").first();
  await relationship.focus();
  await page.keyboard.press("Enter");
  return {
    end: c4Canvas(page).getByTestId("relationship-end-to"),
    covered: await handlesOf(itemLabelled(page, "Beta"), "left"),
    other: await handlesOf(itemLabelled(page, "Beta"), "right"),
    third: itemLabelled(page, "Gamma"),
    thirdHandle: await handlesOf(itemLabelled(page, "Gamma"), "top"),
    lines: () => c4Canvas(page).getByTestId("c4-relationship").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
    endsAtThird: /to Gamma:/,
    endsAtSecond: /to Beta:/,
  };
}

for (const view of VIEWS) {
  test(`in a ${view} diagram, only the end handle shows and is hit where it sits on a connection handle`, async ({ page }) => {
    const { end, covered } = await fixture(page, view);
    await expect(end).toHaveCount(1);
    const at = await centreOf(end);

    expect(await zoneAt(page, at)).toBe("end");
    if (covered) {
      const hidden = await covered.evaluate((element) => ({ opacity: getComputedStyle(element).opacity, events: getComputedStyle(element).pointerEvents }));
      expect(hidden).toEqual({ opacity: "0", events: "none" });
    }
  });

  test(`in a ${view} diagram, dragging the end handle moves the end, and the item's other handles still draw new lines`, async ({ page }) => {
    const { end, other, thirdHandle, lines, endsAtThird, endsAtSecond } = await fixture(page, view);
    expect(await lines()).toHaveLength(1);
    expect((await lines())[0]).toMatch(endsAtSecond);

    await drag(page, await centreOf(end), await handlePoint(thirdHandle));
    await expect.poll(async () => (await lines())[0]).toMatch(endsAtThird);
    expect(await lines()).toHaveLength(1);

    await drag(page, await handlePoint(other), await handlePoint(thirdHandle));
    await expect.poll(async () => (await lines()).length).toBe(2);
  });

  test(`in a ${view} diagram, a new line let go over the selected line's end handle ends at that end's item`, async ({ page }) => {
    const { end, thirdHandle, lines, endsAtSecond } = await fixture(page, view);
    const atEnd = await centreOf(end);

    await drag(page, await handlePoint(thirdHandle), atEnd);

    await expect.poll(async () => (await lines()).length).toBe(2);
    expect((await lines())[1]).toMatch(endsAtSecond);
  });
}

for (const end of ["source", "target"] as const) {
  test(`dropping the flowchart ${end} endpoint on a node body reconnects that endpoint`, async ({ page }) => {
    const { third, lines } = await fixture(page, "flowchart");
    const handle = page.getByRole("region", { name: "Diagram canvas" }).locator(`.react-flow__edgeupdater-${end}`).first();

    await drag(page, await centreOf(handle), await centreOf(third));

    await expect.poll(async () => (await lines())[0]).toMatch(end === "source" ? /from Diamond to Circle$/ : /from Rectangle to Diamond$/);
    expect(await lines()).toHaveLength(1);
  });
}
