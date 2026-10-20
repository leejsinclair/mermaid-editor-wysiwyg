import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape, connect } from "./support/flowchart";
import { c4Record, canvas as c4Canvas } from "./support/c4";
import { addMessage, addParticipants, canvas as sequenceCanvas, participantLabelled } from "./support/sequence";
import { seedRecords } from "./support/storage";

// VO-020 (FR-016, US3-AS6, SC-004, EC-11): over every item, its handles and its lines, in each view, at the default zoom and at
// half zoom, each point reports exactly one zone and its cursor matches the zone; inside a nested C4 box the innermost box owns
// the point; and a drag from a point in a zone does what the zone says.

const CURSORS = new Map<string, string>([
  ["body", "move"],
  ["connect", "crosshair"],
  ["end", "grab"],
  ["line", "pointer"],
]);

interface Probe {
  readonly x: number;
  readonly y: number;
  /** The zone the part under the point belongs to, or null when it belongs to none. */
  readonly zone: string | null;
  readonly cursor: string;
  /** Whether the part under the point is inside the item the point was sampled from. */
  readonly inside: boolean;
}

/** Samples a grid of points over each element matching `roots` and says what is under each one. */
async function probe(page: Page, roots: string): Promise<Probe[]> {
  return page.evaluate((selector) => {
    const zoneOf = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y);
      const owner = element?.closest('[data-zone], [class~="react-flow__edgeupdater"]');
      const zone = owner?.matches('[class~="react-flow__edgeupdater"]') ? "end" : (owner?.getAttribute("data-zone") ?? null);
      return { element, zone };
    };
    const found: Probe[] = [];
    for (const root of document.querySelectorAll(selector)) {
      const box = root.getBoundingClientRect();
      for (let column = 1; column <= 5; column += 1) {
        for (let row = 1; row <= 5; row += 1) {
          const x = box.left + (box.width * column) / 6;
          const y = box.top + (box.height * row) / 6;
          const { element, zone } = zoneOf(x, y);
          if (element && x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight) found.push({ x, y, zone, cursor: getComputedStyle(element).cursor, inside: root.contains(element) });
        }
      }
    }
    return found;
  }, roots);
}

/** Points along the paths matching `paths`, away from their ends. */
async function probePaths(page: Page, paths: string): Promise<Probe[]> {
  return page.evaluate((selector) => {
    const found: Probe[] = [];
    for (const path of document.querySelectorAll<SVGGeometryElement>(selector)) {
      const matrix = path.getScreenCTM();
      if (!matrix) continue;
      for (const fraction of [0.3, 0.4, 0.5, 0.6, 0.7]) {
        const point = path.getPointAtLength(path.getTotalLength() * fraction);
        const x = point.x * matrix.a + point.y * matrix.c + matrix.e;
        const y = point.x * matrix.b + point.y * matrix.d + matrix.f;
        const element = document.elementFromPoint(x, y);
        if (!element) continue;
        const owner = element.closest("[data-zone]");
        found.push({ x, y, zone: owner?.getAttribute("data-zone") ?? null, cursor: getComputedStyle(element).cursor, inside: true });
      }
    }
    return found;
  }, paths);
}

/** Every probed point over a part of an item has one zone and the cursor of that zone. */
function expectZones(points: readonly Probe[], atLeast: number): void {
  const over = points.filter((point) => point.inside);
  expect(over.length).toBeGreaterThanOrEqual(atLeast);
  for (const point of over) {
    expect(point.zone, `a point at ${String(Math.round(point.x))},${String(Math.round(point.y))} has a zone`).not.toBeNull();
    expect(point.cursor).toBe(CURSORS.get(point.zone ?? ""));
  }
}

const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });

async function zoomOutToHalf(page: Page): Promise<void> {
  for (let step = 0; step < 3; step += 1) await toolbar(page).getByRole("button", { name: "Zoom out" }).click();
  // Let the drawing settle at its new size before anything is measured.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

const ZOOMS = ["default zoom", "half zoom"] as const;

async function flowchartWithLine(page: Page) {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 120 });
  await addShape(page, canvas, "Circle", { x: 520, y: 330 });
  await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
  return canvas;
}

for (const zoom of ZOOMS) {
  test(`over a flowchart's nodes, handles and lines at ${zoom}, each point has one zone and its cursor`, async ({ page }) => {
    await flowchartWithLine(page);
    if (zoom === "half zoom") await zoomOutToHalf(page);

    expectZones(await probe(page, ".react-flow__node"), 20);
    expectZones(await probePaths(page, "path.react-flow__edge-interaction"), 3);
  });

  test(`over a Sequence diagram's participants, lifelines and messages at ${zoom}, each point has one zone and its cursor`, async ({ page }) => {
    await page.goto("#/new/sequence");
    await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
    await addMessage(page, "Solid arrow", "A", "B");
    await addMessage(page, "Dashed arrow", "B", "C");
    if (zoom === "half zoom") await zoomOutToHalf(page);

    expectZones(await probe(page, '[data-testid="participant-header"], [data-testid="lifeline"], [data-testid="message"]'), 20);
    expectZones(await probePaths(page, '[data-testid="message"] path'), 3);
  });

  test(`over a C4 diagram's elements, handles and relationships at ${zoom}, each point has one zone and its cursor`, async ({ page }) => {
    await page.goto("#/");
    await seedRecords(page, [
      c4Record(
        "zones",
        "Zones",
        "container",
        [
          { item: "element", id: 1, elementType: "person", label: "Customer" },
          { item: "boundary", id: 2, boundaryType: "system", label: "Outer", children: [
            { item: "element", id: 3, elementType: "container", label: "Web" },
            { item: "boundary", id: 4, boundaryType: "container", label: "Inner", children: [{ item: "element", id: 5, elementType: "container", label: "Api" }] },
          ] },
        ],
        [{ id: 6, from: 1, to: 3 }, { id: 7, from: 3, to: 5 }],
      ),
    ]);
    await page.goto("#/d/zones");
    await page.reload();
    await expect(c4Canvas(page)).toBeVisible();
    if (zoom === "half zoom") await zoomOutToHalf(page);

    expectZones(await probe(page, '[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]'), 30);
    expectZones(await probePaths(page, '[data-testid="c4-relationship"] path'), 3);
  });
}

test("inside nested C4 boxes the innermost box owns each point", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [
    c4Record("nested", "Nested", "container", [
      { item: "boundary", id: 1, boundaryType: "system", label: "Outer", children: [
        { item: "boundary", id: 2, boundaryType: "container", label: "Inner", children: [{ item: "element", id: 3, elementType: "container", label: "Api" }] },
      ] },
    ]),
  ]);
  await page.goto("#/d/nested");
  await page.reload();
  await expect(c4Canvas(page)).toBeVisible();

  const owners = await page.evaluate(() => {
    const items = [...document.querySelectorAll<SVGGElement>('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]')];
    const wrong: string[] = [];
    let checked = 0;
    for (const item of items) {
      const box = item.querySelector('[data-zone="body"] rect:not([data-hover-outline])')?.getBoundingClientRect();
      if (!box) continue;
      for (const [column, row] of [[0.3, 0.55], [0.5, 0.7], [0.7, 0.8], [0.4, 0.9]] as const) {
        const x = box.left + box.width * column;
        const y = box.top + box.height * row;
        const containing = items.filter((other) => {
          const rect = other.querySelector('[data-zone="body"] rect:not([data-hover-outline])')?.getBoundingClientRect();
          return rect !== undefined && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
        const area = (item: Element) => item.getBoundingClientRect().width * item.getBoundingClientRect().height;
        const ordered = [...containing];
        ordered.sort((a, b) => area(a) - area(b));
        const innermost = ordered[0];
        const hit = document.elementFromPoint(x, y)?.closest("[data-id]");
        const isHandle = document.elementFromPoint(x, y)?.closest('[data-zone="connect"]') !== null;
        if (isHandle) continue;
        checked += 1;
        if (hit !== innermost) wrong.push(`${item.getAttribute("data-id") ?? ""} at ${String(Math.round(x))},${String(Math.round(y))}`);
      }
    }
    return { wrong, checked };
  });

  expect(owners.checked).toBeGreaterThan(5);
  expect(owners.wrong).toEqual([]);
});

// A drag from a point in a zone does what the zone says.
test("a drag from the body of a Sequence participant reorders it, from a message row reorders the message, and from an end moves the end", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
  await addMessage(page, "Solid arrow", "A", "B");
  await addMessage(page, "Dashed arrow", "B", "C");
  const names = () => sequenceCanvas(page).getByTestId("participant").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label")));
  const texts = () => sequenceCanvas(page).getByTestId("message").evaluateAll((items) => items.map((item) => item.getAttribute("data-style")));
  const centre = async (item: Locator) => {
    const box = await item.boundingBox();
    if (!box) throw new Error("The element must be on screen");
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };
  const drag = async (from: { x: number; y: number }, to: { x: number; y: number }) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 12 });
    await page.mouse.up();
  };

  const header = participantLabelled(page, "A").getByTestId("participant-header");
  await drag(await centre(header), await centre(participantLabelled(page, "C").getByTestId("participant-header")));
  expect(await names()).toEqual(["Participant: B", "Participant: C", "Participant: A"]);

  const first = sequenceCanvas(page).getByTestId("message").first();
  const second = sequenceCanvas(page).getByTestId("message").nth(1);
  const secondBox = await second.boundingBox();
  const firstPoint = await centre(first.locator("path").first());
  if (!secondBox) throw new Error("The message must be on screen");
  await drag(firstPoint, { x: firstPoint.x, y: secondBox.y + secondBox.height + 30 });
  expect(await texts()).toEqual(["dashed-arrow", "solid-arrow"]);

  // The end handle of the selected message moves that end to another participant.
  const moved = sequenceCanvas(page).getByTestId("message").first();
  await moved.focus();
  await page.keyboard.press("Enter");
  const end = sequenceCanvas(page).getByTestId("message-end-to");
  await expect(end).toBeVisible();
  const target = await centre(participantLabelled(page, "B").locator('[data-testid="lifeline"]'));
  const before = await moved.getAttribute("data-to");
  await drag(await centre(end), target);
  expect(await moved.getAttribute("data-to")).not.toBe(before);
});
