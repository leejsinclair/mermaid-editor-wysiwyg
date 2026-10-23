import { expect, type Locator, type Page } from "@playwright/test";
import { exactly, startingWith } from "./regexp";

/** The canvas of a sequence diagram. */
export const canvas = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });

/** The participant or actor with exactly this label. */
export const participantLabelled = (page: Page, label: string): Locator =>
  canvas(page).getByTestId("participant").filter({ hasText: exactly(label) });

/** The participant at this position from the left, starting at 0. */
export const participantAt = (page: Page, index: number): Locator => canvas(page).getByTestId("participant").nth(index);

/** The participants and actors on the canvas, in left-to-right order, as the names they announce. */
export async function participantNames(page: Page): Promise<string[]> {
  return canvas(page).getByTestId("participant").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label") ?? ""));
}

/** The text of a drawn label or message: its lines, joined by line feeds as they were typed. */
export function linesOf(drawn: Locator): Promise<string> {
  return drawn.getByTestId("line").allTextContents().then((lines) => lines.join("\n"));
}

/** The messages on the canvas, in top-to-bottom order, as their text. */
export async function messageTexts(page: Page): Promise<string[]> {
  const texts = canvas(page).getByTestId("message-text");
  return Promise.all((await texts.all()).map((text) => linesOf(text)));
}

/** The generated source, lines after the header. */
export async function sourceLines(page: Page): Promise<string[]> {
  const panel = page.getByRole("region", { name: "Mermaid source" });
  if ((await panel.count()) === 0) await page.getByRole("button", { name: "Mermaid source" }).click();
  const text = (await panel.textContent()) ?? "";
  return text.split("\n").map((line) => line.trim()).filter((line) => line !== "" && line !== "sequenceDiagram");
}

/** Gives the selected item new label or text by typing into the Properties panel and confirming with Enter. */
export async function relabel(page: Page, item: Locator, text: string): Promise<void> {
  await item.focus();
  await page.keyboard.press("Enter");
  const field = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await field.fill(text);
  await field.press("Enter");
}

/** Adds participants (`Participant` or `Actor`) from the toolbox, then names them in order. */
export async function addParticipants(page: Page, ...named: readonly (readonly [role: "Participant" | "Actor", name: string])[]): Promise<void> {
  for (const [role, name] of named) {
    await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: role, exact: true }).click();
    const added = canvas(page).getByTestId("participant").filter({ hasText: exactly(role) });
    await expect(added).toHaveCount(1);
    await relabel(page, added.first(), name);
    await expect(participantLabelled(page, name)).toHaveCount(1);
    await page.keyboard.press("Escape");
  }
}

/** Adds a message with the "Add message" dialog: activate the type, choose both ends, confirm. */
export async function addMessage(page: Page, type: string, from: string, to: string): Promise<void> {
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: type, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add message" });
  await dialog.getByRole("radiogroup", { name: "Sender" }).getByRole("radio", { name: startingWith(`${from} `) }).check();
  await dialog.getByRole("radiogroup", { name: "Receiver" }).getByRole("radio", { name: startingWith(`${to} `) }).check();
  await dialog.getByRole("button", { name: "Add message" }).click();
  await expect(dialog).toHaveCount(0);
}

/** Drags with the mouse in small steps from the middle of one element to a point or the middle of another. */
export async function dragBetween(page: Page, from: Locator, to: Locator | { x: number; y: number }): Promise<void> {
  const start = await from.boundingBox();
  if (!start) throw new Error("The element to drag from is not visible");
  const target = "x" in to ? to : await centreOf(to);
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
  await page.mouse.up();
}

async function centreOf(item: Locator): Promise<{ x: number; y: number }> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element to drag to is not visible");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
