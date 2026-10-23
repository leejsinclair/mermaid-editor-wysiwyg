import { expect, test, type Locator, type Page } from "@playwright/test";
import { sourceView } from "../support/sourceView";
import { centreOf, doubleTap, tap, toggleTools, Touches } from "./support";

// VO-037 (FR-027, US5-AS4, SC-009): on the emulated phones a sequence diagram (add participants by tap, add a message by dragging
// from one lifeline to another, reorder a participant by dragging its header, rename by double-tap, delete, Undo, Redo) and a C4
// diagram (add elements and a boundary by tap, connect from a handle, move an element into the boundary, rename by double-tap,
// delete, Undo, Redo) are edited by touch. After each step the generated source is what the same steps give on a desktop.

/** The generated source, line by line, without the header line of the diagram type. */
async function linesNow(page: Page): Promise<string[]> {
  const text = (await (await sourceView(page)).textContent()) ?? "";
  return text.split("\n").map((line) => line.trim()).filter((line) => line !== "" && line !== "sequenceDiagram" && !/^C4\w+$/.test(line));
}

async function addByTap(page: Page, ...names: readonly string[]): Promise<void> {
  await toggleTools(page);
  for (const name of names) await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true }));
  await toggleTools(page);
}

async function renameByDoubleTap(page: Page, target: Locator, text: string): Promise<void> {
  await doubleTap(page, target);
  const editor = page.getByRole("textbox", { name: /^Label of/ });
  await editor.fill(text);
  await editor.press("Enter");
}

async function deleteSelected(page: Page): Promise<void> {
  await toggleTools(page);
  await tap(page, page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Delete", exact: true }));
  await toggleTools(page);
}

const undo = (page: Page): Promise<void> => tap(page, page.getByRole("button", { name: "Undo", exact: true }));
const redo = (page: Page): Promise<void> => tap(page, page.getByRole("button", { name: "Redo", exact: true }));

test("a sequence diagram is built, edited, deleted from, undone and redone by touch", async ({ page }) => {
  await page.goto("#/new/sequence");
  const touches = await Touches.attach(page);
  const participants = page.getByTestId("participant");
  const headers = page.getByTestId("participant-header");

  await addByTap(page, "Participant", "Participant");
  await expect(participants).toHaveCount(2);
  expect(await linesNow(page), "after adding two participants").toEqual(["participant p1 as Participant", "participant p2 as Participant"]);

  await renameByDoubleTap(page, headers.nth(0), "A");
  await renameByDoubleTap(page, headers.nth(1), "B");
  expect(await linesNow(page), "after renaming both by double-tap").toEqual(["participant p1 as A", "participant p2 as B"]);

  // A message is drawn by dragging from one lifeline to another, to a row below the participants.
  const from = await centreOf(participants.nth(0).getByTestId("lifeline"));
  const to = await centreOf(participants.nth(1).getByTestId("lifeline"));
  await touches.drag({ x: from.x, y: from.y - 40 }, { x: to.x, y: to.y - 40 }, 12);
  await expect(page.getByTestId("message")).toHaveCount(1);
  expect(await linesNow(page), "after drawing a message from A to B").toEqual(["participant p1 as A", "participant p2 as B", "p1->>p2: Solid arrow"]);

  // The first participant is dragged over the second to change their order.
  await touches.drag(await centreOf(headers.nth(0)), await centreOf(headers.nth(1)), 12);
  expect(await linesNow(page), "after dragging A's header over B").toEqual(["participant p2 as B", "participant p1 as A", "p1->>p2: Solid arrow"]);

  await tap(page, headers.nth(0));
  await deleteSelected(page);
  await expect(participants).toHaveCount(1);
  expect(await linesNow(page), "after deleting B and its message").toEqual(["participant p1 as A"]);

  await undo(page);
  await expect(participants).toHaveCount(2);
  expect(await linesNow(page), "after Undo").toEqual(["participant p2 as B", "participant p1 as A", "p1->>p2: Solid arrow"]);
  await redo(page);
  await expect(participants).toHaveCount(1);
  expect(await linesNow(page), "after Redo").toEqual(["participant p1 as A"]);
});

test("a C4 diagram is built, edited, deleted from, undone and redone by touch", async ({ page }) => {
  await page.goto("#/new/c4/context");
  const touches = await Touches.attach(page);
  const elements = page.getByTestId("c4-element");

  await addByTap(page, "Person", "System", "System boundary");
  await expect(elements).toHaveCount(2);
  await expect(page.getByTestId("c4-boundary")).toHaveCount(1);

  await renameByDoubleTap(page, elements.nth(0), "Customer");
  await renameByDoubleTap(page, elements.nth(1), "Shop");
  expect(await linesNow(page), "after adding and renaming").toEqual(['Person(e1, "Customer")', 'System(e2, "Shop")', 'System_Boundary(b3, "System boundary") {', "}"]);

  // A relationship is made by dragging from the first element's right-hand handle onto the second.
  const id = await elements.nth(0).getAttribute("data-id");
  const handle = page.locator(`[data-zone="connect"][data-item="${String(id)}"][data-side="right"]`);
  await touches.drag(await centreOf(handle), await centreOf(elements.nth(1)), 12);
  await expect(page.getByTestId("c4-relationship")).toHaveCount(1);
  expect(await linesNow(page), "after connecting from a handle").toEqual(['Person(e1, "Customer")', 'System(e2, "Shop")', 'System_Boundary(b3, "System boundary") {', "}", 'Rel(e1, e2, "Uses")']);

  // The second element is dragged into the boundary.
  await touches.drag(await centreOf(elements.nth(1)), await centreOf(page.getByTestId("c4-boundary").first().getByTestId("item-label")), 12);
  expect(await linesNow(page), "after moving Shop into the boundary").toEqual(['Person(e1, "Customer")', 'System_Boundary(b3, "System boundary") {', 'System(e2, "Shop")', "}", 'Rel(e1, e2, "Uses")']);

  await tap(page, elements.nth(0));
  await deleteSelected(page);
  await expect(elements).toHaveCount(1);
  expect(await linesNow(page), "after deleting Customer and its relationship").toEqual(['System_Boundary(b3, "System boundary") {', 'System(e2, "Shop")', "}"]);

  await undo(page);
  await expect(elements).toHaveCount(2);
  expect(await linesNow(page), "after Undo").toEqual(['Person(e1, "Customer")', 'System_Boundary(b3, "System boundary") {', 'System(e2, "Shop")', "}", 'Rel(e1, e2, "Uses")']);
  await redo(page);
  await expect(elements).toHaveCount(1);
  expect(await linesNow(page), "after Redo").toEqual(['System_Boundary(b3, "System boundary") {', 'System(e2, "Shop")', "}"]);
});
