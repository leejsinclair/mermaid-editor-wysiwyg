import { expect, test, type Page } from "@playwright/test";
import { addMessage, addParticipants, canvas, dragBetween, messageTexts, participantLabelled, participantNames, relabel, sourceLines } from "./support/sequence";

// VO-042: participants and messages reordered by dragging and by Move up / Move down from the keyboard, and a new
// message placed at a chosen position, show the new order on the canvas and in the source, and one Undo restores each
// previous order. Messages are created by activating a message type (sender, then receiver; with one participant
// selected both default to it) and by dragging from one lifeline to another; a message end is moved by dragging it.

const header = (page: Page, name: string) => participantLabelled(page, name).getByTestId("participant-header");

test("participants are reordered by dragging and from the keyboard, and one Undo restores each order", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Actor", "B"], ["Participant", "C"]);
  expect(await participantNames(page)).toEqual(["Participant: A", "Actor: B", "Participant: C"]);

  await dragBetween(page, header(page, "A"), header(page, "C"));
  expect(await participantNames(page)).toEqual(["Actor: B", "Participant: C", "Participant: A"]);
  expect((await sourceLines(page)).slice(0, 3)).toEqual(["actor p2 as B", "participant p3 as C", "participant p1 as A"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await participantNames(page)).toEqual(["Participant: A", "Actor: B", "Participant: C"]);

  await participantLabelled(page, "B").focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Move down" }).focus();
  await page.keyboard.press("Enter");
  expect(await participantNames(page)).toEqual(["Participant: A", "Participant: C", "Actor: B"]);
  await page.getByRole("button", { name: "Move up" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  expect(await participantNames(page)).toEqual(["Actor: B", "Participant: A", "Participant: C"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await participantNames(page)).toEqual(["Participant: A", "Actor: B", "Participant: C"]);
});

test("messages are reordered by dragging and from the keyboard, and a new message goes after the selected one", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  await addMessage(page, "Solid arrow", "A", "B");
  await relabel(page, canvas(page).getByTestId("message").first(), "one");
  await addMessage(page, "Dashed arrow", "B", "A");
  await relabel(page, canvas(page).getByTestId("message").nth(1), "two");
  await addMessage(page, "Solid cross", "A", "B");
  await relabel(page, canvas(page).getByTestId("message").nth(2), "three");
  expect(await messageTexts(page)).toEqual(["one", "two", "three"]);

  await dragBetween(page, canvas(page).getByTestId("message").nth(2), canvas(page).getByTestId("message").nth(0));
  expect(await messageTexts(page)).toEqual(["three", "one", "two"]);
  expect((await sourceLines(page)).slice(2)).toEqual(["p1-xp2: three", "p1->>p2: one", "p2-->>p1: two"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await messageTexts(page)).toEqual(["one", "two", "three"]);

  await canvas(page).getByTestId("message").nth(0).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Move down" }).focus();
  await page.keyboard.press("Enter");
  expect(await messageTexts(page)).toEqual(["two", "one", "three"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await messageTexts(page)).toEqual(["one", "two", "three"]);

  // With the first message selected, a new message is placed right after it.
  await canvas(page).getByTestId("message").nth(0).focus();
  await page.keyboard.press("Enter");
  await addMessage(page, "Solid async arrow", "B", "B");
  expect(await messageTexts(page)).toEqual(["one", "Solid async arrow", "two", "three"]);
  expect((await sourceLines(page)).slice(2, 4)).toEqual(["p1->>p2: one", "p2-)p2: Solid async arrow"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await messageTexts(page)).toEqual(["one", "two", "three"]);
});

test("with one participant selected, a message type defaults both ends to it", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  await participantLabelled(page, "B").focus();
  await page.keyboard.press("Enter");

  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Dashed open arrow", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add message" });
  await expect(dialog.getByRole("radiogroup", { name: "Sender" }).getByRole("radio", { name: /^B / })).toBeChecked();
  await expect(dialog.getByRole("radiogroup", { name: "Receiver" }).getByRole("radio", { name: /^B / })).toBeChecked();
  await dialog.getByRole("button", { name: "Add message" }).click();

  expect(await messageTexts(page)).toEqual(["Dashed open arrow"]);
  expect(await sourceLines(page)).toContain("p2-->p2: Dashed open arrow");
});

test("a message is created by dragging from one lifeline to another, and its end is moved by dragging it", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
  const line = (name: string) => participantLabelled(page, name).getByTestId("lifeline");
  const at = async (name: string, y: number) => {
    const box = await line(name).boundingBox();
    if (!box) throw new Error("The lifeline is not visible");
    return { x: box.x + box.width / 2, y: box.y + y };
  };

  await dragBetween(page, line("A"), await at("B", 120));
  expect(await messageTexts(page)).toEqual(["Solid arrow"]);
  expect((await sourceLines(page)).slice(3)).toEqual(["p1->>p2: Solid arrow"]);

  await canvas(page).getByTestId("message").first().focus();
  await page.keyboard.press("Enter");
  await dragBetween(page, canvas(page).getByTestId("message-end-to"), await at("C", 120));
  expect((await sourceLines(page)).slice(3)).toEqual(["p1->>p3: Solid arrow"]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await sourceLines(page)).slice(3)).toEqual(["p1->>p2: Solid arrow"]);
});
