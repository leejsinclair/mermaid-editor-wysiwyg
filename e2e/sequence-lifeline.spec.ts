import { expect, test, type Page } from "@playwright/test";
import { addMessage, addParticipants, canvas, messageTexts, participantLabelled, relabel } from "./support/sequence";

// VO-035 (FR-012, FR-016): a lifeline says that dragging from it adds a message; while a message is drawn a marker shows the gap
// it will land in, and releasing puts it there; adding a message from the keyboard or the toolbox goes after the selected message;
// across a message row the lifeline offers no connect zone and a drag reorders the message.

interface Point {
  x: number;
  y: number;
}

/** A diagram of three participants with the messages "one" (A to B) and "two" (B to C). */
async function build(page: Page) {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
  await addMessage(page, "Solid arrow", "A", "B");
  await relabel(page, canvas(page).getByTestId("message").nth(0), "one");
  await addMessage(page, "Dashed arrow", "B", "C");
  await relabel(page, canvas(page).getByTestId("message").nth(1), "two");
  await page.keyboard.press("Escape");
  await page.mouse.move(2, 2);
  const lifeline = (name: string) => participantLabelled(page, name).getByTestId("lifeline");
  /** A point on a lifeline, `down` drawing units below the top of its strip (which starts 60 units into the drawing). */
  const on = async (name: string, down: number): Promise<Point> => {
    const box = await lifeline(name).boundingBox();
    if (!box) throw new Error("The lifeline must be on screen");
    return { x: box.x + box.width / 2, y: box.y + down };
  };
  return { lifeline, on };
}

async function drawFrom(page: Page, from: Point, to: Point): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 4, from.y + 4);
  await page.mouse.move(to.x, to.y, { steps: 8 });
}

test("hovering a lifeline shows a hint that dragging from it adds a message", async ({ page }) => {
  const { on } = await build(page);
  const hint = page.getByTestId("lifeline-hint");
  await expect(hint).toHaveCount(0);

  const point = await on("A", 50);
  await page.mouse.move(point.x, point.y);

  await expect(hint).toBeVisible();
  await expect(hint).toContainText(/drag/i);
  await expect(hint).toContainText(/message/i);
  await page.mouse.move(2, 2);
  await expect(hint).toHaveCount(0);
});

test("while a message is drawn a marker shows the gap it will land in, and releasing puts it there", async ({ page }) => {
  const { on } = await build(page);
  const marker = page.getByTestId("insertion-marker");
  await expect(marker).toHaveCount(0);

  // The messages sit at 92 and 164 units below the top of a lifeline strip; the gaps are above the first, between and below the last.
  await drawFrom(page, await on("A", 30), await on("C", 20));
  const above = await marker.boundingBox();
  await page.mouse.move((await on("C", 20)).x, (await on("C", 128)).y, { steps: 6 });
  const between = await marker.boundingBox();
  await page.mouse.move((await on("C", 20)).x, (await on("C", 200)).y, { steps: 6 });
  const below = await marker.boundingBox();
  expect(above).not.toBeNull();
  expect(between).not.toBeNull();
  expect(below).not.toBeNull();
  expect((between?.y ?? 0)).toBeGreaterThan(above?.y ?? 0);
  expect((below?.y ?? 0)).toBeGreaterThan(between?.y ?? 0);

  await page.mouse.move((await on("C", 20)).x, (await on("C", 128)).y, { steps: 6 });
  await page.mouse.up();
  await expect(marker).toHaveCount(0);
  expect(await messageTexts(page)).toEqual(["one", "Solid arrow", "two"]);
});

test("a message let go below the last message is added at the end, and above the first at the start", async ({ page }) => {
  const { on } = await build(page);

  await drawFrom(page, await on("A", 30), await on("B", 210));
  await page.mouse.up();
  expect(await messageTexts(page)).toEqual(["one", "two", "Solid arrow"]);

  await drawFrom(page, await on("B", 30), await on("C", 12));
  await page.mouse.up();
  expect(await messageTexts(page)).toEqual(["Solid arrow", "one", "two", "Solid arrow"]);
});

test("a message added from the keyboard or the toolbox with one selected still goes after the selected message", async ({ page }) => {
  await build(page);
  await canvas(page).getByTestId("message").nth(0).focus();
  await page.keyboard.press("Enter");

  await addMessage(page, "Solid cross", "A", "C");

  expect(await messageTexts(page)).toEqual(["one", "Solid cross", "two"]);
});

test("across a message row the lifeline offers no connect zone, and a drag there reorders the message", async ({ page }) => {
  const { on } = await build(page);
  const onRow = await on("C", 92);
  const zone = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-zone]")?.getAttribute("data-zone") ?? null, { x: (await on("B", 92)).x, y: onRow.y });
  expect(zone).toBe("line");

  const first = await on("B", 92);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  await page.mouse.move(first.x, first.y + 6);
  await page.mouse.move(first.x, first.y + 90, { steps: 10 });
  await page.mouse.up();

  expect(await messageTexts(page)).toEqual(["two", "one"]);
});
