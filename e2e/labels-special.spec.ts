import { expect, test, type Locator, type Page } from "@playwright/test";
import { addItem, addRelationship, canvas as c4Canvas, itemLabelled, openNew, relabel as relabelC4 } from "./support/c4";
import { addMessage, addParticipants, canvas as sequenceCanvas, linesOf, messageTexts, participantAt, relabel } from "./support/sequence";

// VO-018 (EC-03): labels with Mermaid-special characters, emoji and line breaks, typed in the editor, are shown
// on the canvas exactly as typed. Flowchart nodes and connections, Sequence participants and messages, and C4
// element, boundary and relationship labels, descriptions, technologies and the title.

const TEXTS = [
  "\"quoted\" <b>bold</b> & [a](b) {c} #d; e|f",
  "%% not a comment --> end",
  "😀 日本語 Привет",
  "first line\nsecond line\n\nfourth",
];

async function connectedPair(page: Page) {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 200, y: 100 } });
  await page.getByRole("button", { name: "Circle", exact: true }).dragTo(canvas, { targetPosition: { x: 520, y: 360 } });
  const rectangle = canvas.getByLabel("Rectangle node: Rectangle", { exact: true });
  const circle = canvas.getByLabel("Circle node: Circle", { exact: true });
  const from = await rectangle.locator(".react-flow__handle.source").boundingBox();
  const to = await circle.locator(".react-flow__handle.target").boundingBox();
  if (!from || !to) throw new Error("Both handles must be visible");
  await page.mouse.move(from.x + 3, from.y + 3);
  await page.mouse.down();
  await page.mouse.move(to.x + 3, to.y + 3, { steps: 10 });
  await page.mouse.up();
  await expect(canvas.locator(".react-flow__edge")).toHaveCount(1);
  return canvas;
}

const exactText = (locator: Locator) => locator.evaluate((element) => element.textContent);

test("node and connection labels typed in the editor appear on the canvas exactly as typed", async ({ page }) => {
  const canvas = await connectedPair(page);
  const properties = page.getByRole("region", { name: "Properties" });

  for (const text of TEXTS) {
    await canvas.locator(".react-flow__node").first().click();
    await properties.getByRole("textbox", { name: "Label" }).fill(text);
    await page.keyboard.press("Enter");
    expect(await exactText(canvas.locator(".react-flow__node").first().getByTestId("node-label"))).toBe(text);
  }

  for (const text of TEXTS) {
    await canvas.locator(".react-flow__edge-interaction").click({ force: true });
    await properties.getByRole("textbox", { name: "Label" }).fill(text);
    await page.keyboard.press("Enter");
    expect(await exactText(canvas.getByTestId("connection-label"))).toBe(text);
  }
});

test("Escape cancels an edit and keeps the previous label", async ({ page }) => {
  const canvas = await connectedPair(page);
  const properties = page.getByRole("region", { name: "Properties" });
  await canvas.locator(".react-flow__node").first().click();

  await properties.getByRole("textbox", { name: "Label" }).fill("draft only");
  await page.keyboard.press("Escape");

  await expect(canvas.locator(".react-flow__node").first().getByTestId("node-label")).toHaveText("Rectangle");
});

test("participant labels and message text typed in the editor appear on the canvas exactly as typed", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Actor", "B"]);
  await addMessage(page, "Solid arrow", "A", "B");

  for (const text of TEXTS) {
    await relabel(page, participantAt(page, 0), text);
    expect(await linesOf(participantAt(page, 0))).toBe(text);
    await relabel(page, sequenceCanvas(page).getByTestId("message").first(), text);
    expect(await messageTexts(page)).toEqual([text]);
  }
});

test("C4 element, boundary and relationship labels, descriptions, technologies and the title appear on the canvas exactly as typed", async ({ page }) => {
  await openNew(page, "container");
  await addItem(page, "Container", "Api");
  await addItem(page, "System", "Shop");
  await addItem(page, "Boundary", "Zone");
  await addRelationship(page, "One-way relationship", "Api", "Shop");
  const properties = page.getByRole("region", { name: "Properties" });
  const confirm = async (name: string, text: string) => {
    await properties.getByRole("textbox", { name, exact: true }).fill(text);
    await page.keyboard.press("Enter");
  };

  for (const text of TEXTS) {
    await relabelC4(page, itemLabelled(page, "Api"), text);
    expect(await linesOf(c4Canvas(page).getByTestId("c4-element").first().getByTestId("item-label"))).toBe(text);
    await confirm("Description", text);
    expect(await linesOf(c4Canvas(page).getByTestId("c4-element").first().getByTestId("item-description"))).toBe(text);
    await confirm("Technology", text);
    expect(await linesOf(c4Canvas(page).getByTestId("c4-element").first().getByTestId("item-technology"))).toBe(`[${text}]`);
    await relabelC4(page, c4Canvas(page).getByTestId("c4-element").first(), "Api");

    await relabelC4(page, c4Canvas(page).getByTestId("c4-boundary"), text);
    expect(await linesOf(c4Canvas(page).getByTestId("c4-boundary").getByTestId("item-label"))).toBe(text);
    await relabelC4(page, c4Canvas(page).getByTestId("c4-boundary"), "Zone");

    await relabelC4(page, c4Canvas(page).getByTestId("c4-relationship"), text);
    expect(await linesOf(c4Canvas(page).getByTestId("relationship-text"))).toBe(text);
    await relabelC4(page, c4Canvas(page).getByTestId("c4-relationship"), "Uses");

    await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 5, y: 5 } });
    await confirm("Title", text);
    expect(await exactText(c4Canvas(page).getByTestId("c4-title"))).toBe(text);
  }
});
