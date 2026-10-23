import { expect, test, type Locator, type Page } from "@playwright/test";
import { sourceView } from "../support/sourceView";
import { centreOf, emptyPair, tap, toggleTools, Touches, zoomShown } from "./support";

// VO-043 (FR-028): on the emulated phones, while one finger drags a sequence participant (to reorder it) or a C4 element (into a
// boundary), a second finger touches down on empty canvas and moves (and a third beside it, spreading apart); the drag completes with the same result as without the
// second finger and the zoom is unchanged.

type Kind = "sequence" | "c4";

async function addByTap(page: Page, ...names: readonly string[]): Promise<void> {
  await toggleTools(page);
  for (const name of names) await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true }));
  await toggleTools(page);
}

/** Two participants, or a boundary and a person, and the place where the first is dragged from and to. */
async function setUp(page: Page, kind: Kind): Promise<{ from: Locator; to: Locator }> {
  if (kind === "sequence") {
    await page.goto("#/new/sequence");
    await addByTap(page, "Participant", "Participant");
    const headers = page.getByTestId("participant-header");
    await expect(headers).toHaveCount(2);
    return { from: headers.nth(0), to: headers.nth(1) };
  }
  await page.goto("#/new/c4/context");
  await addByTap(page, "System boundary", "Person");
  const person = page.getByTestId("c4-element").first();
  await expect(person).toBeVisible();
  return { from: person, to: page.getByTestId("c4-boundary").first() };
}

/** Drags from one place to another with one finger, with a second finger down on empty canvas part of the way when asked. */
async function dragAndSource(page: Page, kind: Kind, secondFinger: boolean): Promise<{ source: string; zoom: number }> {
  const { from, to } = await setUp(page, kind);
  const touches = await Touches.attach(page);
  const start = await centreOf(from);
  const end = await centreOf(to);
  const target = { x: end.x + (kind === "sequence" ? 40 : 0), y: end.y };
  const [emptyLeft, emptyRight] = await emptyPair(page, 60);
  if (secondFinger) {
    await touches.press(start);
    await touches.slide(6, { x: (start.x + target.x) / 2, y: (start.y + target.y) / 2 });
    // A second finger goes down on empty canvas and moves; a third goes down beside it and the two spread apart, which would zoom if
    // they were a pinch. Neither is: the drag goes on.
    const second = await touches.addFinger(emptyLeft);
    const third = await touches.addFinger(emptyRight);
    await Promise.all([touches.moveFinger(second, 6, { x: emptyLeft.x - 50, y: emptyLeft.y }), touches.moveFinger(third, 6, { x: emptyRight.x + 50, y: emptyRight.y })]);
    await touches.slide(6, target);
    await touches.lift();
  } else {
    await touches.drag(start, target, 12);
  }
  const view = await sourceView(page);
  return { source: (await view.textContent()) ?? "", zoom: await zoomShown(page) };
}

for (const kind of ["sequence", "c4"] as const) {
  test(`a second finger on empty canvas does not disturb the drag of a ${kind} item`, async ({ context }) => {
    const alone = await dragAndSource(await context.newPage(), kind, false);
    const withSecond = await dragAndSource(await context.newPage(), kind, true);
    expect(withSecond.source, "the source after the drag").toBe(alone.source);
    expect(withSecond.zoom, "the zoom").toBe(100);
    expect(alone.zoom).toBe(100);
    // The drag did something: a participant changed places, or the person went into the boundary.
    const untouched = await (async () => {
      const page = await context.newPage();
      await setUp(page, kind);
      return (await (await sourceView(page)).textContent()) ?? "";
    })();
    expect(alone.source, "the drag changed the diagram").not.toBe(untouched);
  });
}
