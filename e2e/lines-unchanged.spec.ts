import { expect, test, type Page } from "@playwright/test";
import { addItem, addRelationship, canvas as c4Canvas, dragBetween as c4DragBetween, itemLabelled, openNew, relabel as c4Relabel } from "./support/c4";
import { addMessage, addParticipants, canvas as sequenceCanvas, dragBetween, messageTexts, relabel } from "./support/sequence";

// VO-041 (FR-018): dragging a Sequence message or a Dynamic C4 relationship reorders it, and dragging an end handle moves the
// end, each in one undo step, as before this feature.

const undo = (page: Page) => page.getByRole("button", { name: "Undo", exact: true }).click();

test("a Sequence message dragged to a new place is reordered, and its end handle moves its end, each in one Undo step", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
  await addMessage(page, "Solid arrow", "A", "B");
  await relabel(page, sequenceCanvas(page).getByTestId("message").nth(0), "one");
  await addMessage(page, "Dashed arrow", "B", "A");
  await relabel(page, sequenceCanvas(page).getByTestId("message").nth(1), "two");
  expect(await messageTexts(page)).toEqual(["one", "two"]);

  await dragBetween(page, sequenceCanvas(page).getByTestId("message").nth(1), sequenceCanvas(page).getByTestId("message").nth(0));
  expect(await messageTexts(page)).toEqual(["two", "one"]);
  await undo(page);
  expect(await messageTexts(page)).toEqual(["one", "two"]);

  const message = sequenceCanvas(page).getByTestId("message").nth(0);
  await message.focus();
  await page.keyboard.press("Enter");
  const before = await message.getAttribute("data-to");
  const lifeline = page.getByTestId("participant").nth(2).getByTestId("lifeline");
  const box = await lifeline.boundingBox();
  if (!box) throw new Error("The lifeline must be on screen");
  await dragBetween(page, sequenceCanvas(page).getByTestId("message-end-to"), { x: box.x + box.width / 2, y: box.y + 24 });
  expect(await message.getAttribute("data-to")).not.toBe(before);
  await undo(page);
  expect(await message.getAttribute("data-to")).toBe(before);
});

const relationship = (page: Page, text: string) => c4Canvas(page).getByTestId("c4-relationship").filter({ has: page.getByTestId("relationship-text").filter({ hasText: new RegExp(`^${text}$`) }) });

test("a Dynamic relationship dragged onto another is reordered, and its end handle moves its end, each in one Undo step", async ({ page }) => {
  await openNew(page, "dynamic");
  await addItem(page, "Person", "A");
  await addItem(page, "Container", "B");
  await addItem(page, "Component", "C");
  for (const [from, to, text] of [["A", "B", "one"], ["B", "C", "two"]] as const) {
    await addRelationship(page, "One-way relationship", from, to);
    await c4Relabel(page, c4Canvas(page).getByTestId("c4-relationship").last(), text);
    await page.keyboard.press("Escape");
  }
  const order = () => c4Canvas(page).getByTestId("c4-relationship").evaluateAll((items) => items.map((item) => `${item.getAttribute("data-number") ?? ""}:${item.querySelector('[data-testid="relationship-text"]')?.textContent ?? ""}`).sort((a, b) => a.localeCompare(b)));

  await c4DragBetween(page, relationship(page, "two").getByTestId("relationship-text"), relationship(page, "one").getByTestId("relationship-text"));
  expect(await order()).toEqual(["1:two", "2:one"]);
  await undo(page);
  expect(await order()).toEqual(["1:one", "2:two"]);

  const first = relationship(page, "one");
  await first.focus();
  await page.keyboard.press("Enter");
  await c4DragBetween(page, c4Canvas(page).getByTestId("relationship-end-to"), itemLabelled(page, "C"));
  await expect(first).toHaveAccessibleName(/from A to C: one$/);
  await undo(page);
  await expect(first).toHaveAccessibleName(/from A to B: one$/);
});
