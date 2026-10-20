import { expect, test, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { addItem, canvas as c4Canvas, handlesOf, itemLabelled, openNew, sourceLines as c4SourceLines } from "./support/c4";
import { addParticipants, canvas as sequenceCanvas, participantLabelled, sourceLines as sequenceSourceLines } from "./support/sequence";

// VO-025 (FR-011, FR-015, US4-AS4): a line let go over a valid item's body, and over one of its handles, makes one line to that
// item in one undo step, of the type a drag gives, and the source shows it. VO-026 (FR-011, US4-AS5, EC-02): let go over the
// source item itself, the line is a self-line (a flowchart loop, a Sequence self-message, a C4 relationship to itself).

interface Point {
  x: number;
  y: number;
}

async function centreOf(item: Locator): Promise<Point> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Where to press on a lifeline: just below its header, clear of the rows. */
async function lifelinePoint(lifeline: Locator, down = 24): Promise<Point> {
  const box = await lifeline.boundingBox();
  if (!box) throw new Error("The lifeline must be on screen");
  return { x: box.x + box.width / 2, y: box.y + down };
}

async function drag(page: Page, from: Point, to: Point): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 6, from.y + 6);
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

const ENDS = ["body", "handle"] as const;
const undo = (page: Page) => page.getByRole("button", { name: "Undo", exact: true }).click();

interface Drawn {
  readonly start: Point;
  readonly body: Point;
  readonly handle: Point;
  readonly selfBody: Point;
  readonly selfHandle: Point;
  readonly lines: () => Promise<(string | null)[]>;
  readonly source: () => Promise<string[]>;
}

async function flowchart(page: Page): Promise<Drawn> {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 150, y: 140 });
  await addShape(page, canvas, "Circle", { x: 450, y: 140 });
  const [first, second] = [canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/)];
  return {
    start: await centreOf(first.locator('[data-side="right"]')),
    body: await centreOf(second),
    handle: await centreOf(second.locator('[data-side="left"]')),
    selfBody: await centreOf(first),
    selfHandle: await centreOf(first.locator('[data-side="top"]')),
    lines: () => canvas.locator(".react-flow__edge").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
    source: async () => {
      const panel = page.getByRole("region", { name: "Mermaid source" });
      if ((await panel.count()) === 0) await page.getByRole("button", { name: "Mermaid source" }).click();
      return ((await panel.textContent()) ?? "").split(/\s{2,}|\n/).map((line) => line.trim());
    },
  };
}

async function sequence(page: Page): Promise<Drawn> {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  const [first, second] = [participantLabelled(page, "A"), participantLabelled(page, "B")];
  return {
    start: await lifelinePoint(first.getByTestId("lifeline")),
    body: await centreOf(second.getByTestId("participant-header")),
    handle: await lifelinePoint(second.getByTestId("lifeline"), 60),
    selfBody: await centreOf(first.getByTestId("participant-header")),
    selfHandle: await lifelinePoint(first.getByTestId("lifeline"), 90),
    lines: () => sequenceCanvas(page).getByTestId("message").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
    source: () => sequenceSourceLines(page),
  };
}

async function c4(page: Page): Promise<Drawn> {
  await openNew(page, "container");
  await addItem(page, "Person", "Alpha");
  await addItem(page, "System", "Beta");
  const [first, second] = [itemLabelled(page, "Alpha"), itemLabelled(page, "Beta")];
  return {
    start: await centreOf(await handlesOf(first, "right")),
    body: await centreOf(second),
    handle: await centreOf(await handlesOf(second, "left")),
    selfBody: await centreOf(first),
    selfHandle: await centreOf(await handlesOf(first, "bottom")),
    lines: () => c4Canvas(page).getByTestId("c4-relationship").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
    source: () => c4SourceLines(page),
  };
}

const VIEWS: readonly (readonly [string, (page: Page) => Promise<Drawn>, RegExp, RegExp, string, string])[] = [
  ["flowchart", flowchart, /^Solid arrow connection from Rectangle to Circle$/, /^Solid arrow connection from Rectangle to Rectangle$/, "n1 --> n2", "n1 --> n1"],
  ["Sequence", sequence, /^Solid arrow from A to B: Solid arrow$/, /^Solid arrow from A to A: Solid arrow$/, "p1->>p2: Solid arrow", "p1->>p1: Solid arrow"],
  ["C4", c4, /^One-way relationship from Alpha to Beta: Uses$/, /^One-way relationship from Alpha to Alpha: Uses$/, 'Rel(e1, e2, "Uses")', 'Rel(e1, e1, "Uses")'],
];

for (const [name, draw, announced, , sourceLine] of VIEWS) {
  for (const end of ENDS) {
    test(`a ${name} line let go over a valid item's ${end} is made in one undo step with the type a drag gives`, async ({ page }) => {
      const drawn = await draw(page);

      await drag(page, drawn.start, end === "body" ? drawn.body : drawn.handle);

      await expect.poll(async () => (await drawn.lines()).length).toBe(1);
      expect((await drawn.lines())[0]).toMatch(announced);
      expect(await drawn.source()).toContain(sourceLine);
      await undo(page);
      await expect.poll(async () => (await drawn.lines()).length).toBe(0);
    });
  }
}

for (const [name, draw, , selfAnnounced, , selfSourceLine] of VIEWS) {
  for (const end of ENDS) {
    test(`a ${name} line let go over the source item's own ${end} makes a line to itself`, async ({ page }) => {
      const drawn = await draw(page);

      await drag(page, drawn.start, end === "body" ? drawn.selfBody : drawn.selfHandle);

      await expect.poll(async () => (await drawn.lines()).length).toBe(1);
      expect((await drawn.lines())[0]).toMatch(selfAnnounced);
      expect(await drawn.source()).toContain(selfSourceLine);
    });
  }
}

test("a flowchart line drawn with a connection type armed has that type, let go over a body", async ({ page }) => {
  const drawn = await flowchart(page);
  await page.getByRole("button", { name: "Dotted arrow", exact: true }).click();

  await drag(page, drawn.start, drawn.body);

  await expect.poll(async () => (await drawn.lines()).length).toBe(1);
  expect((await drawn.lines())[0]).toMatch(/^Dotted arrow connection from Rectangle to Circle$/);
  expect(await drawn.source()).toContain("n1 -.-> n2");
});
