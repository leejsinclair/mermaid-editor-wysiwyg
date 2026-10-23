import { expect, type Locator, type Page } from "@playwright/test";
import { addItem, addRelationship } from "./c4";
import { readClipboard } from "./clipboard";
import { addShape, connect } from "./flowchart";
import { addMessage, addParticipants } from "./sequence";

export type SourceType = "flowchart" | "sequence" | "c4";

export const ADDRESSES: Readonly<Record<SourceType, string>> = { flowchart: "#/new/flowchart", sequence: "#/new/sequence", c4: "#/new/c4/context" };

const canvas = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });

/** Builds a small diagram of a type with two items and a connection between them, so its source has an arrow where the type has one. */
export async function buildSmallDiagram(page: Page, type: SourceType): Promise<void> {
  await page.goto(ADDRESSES[type]);
  if (type === "flowchart") {
    await addShape(page, canvas(page), "Rectangle", { x: 150, y: 100 });
    await addShape(page, canvas(page), "Diamond", { x: 450, y: 100 });
    const nodes = canvas(page).locator(".react-flow__node");
    await connect(page, canvas(page), nodes.nth(0), nodes.nth(1), 1);
  } else if (type === "sequence") {
    await addParticipants(page, ["Participant", "Alice"], ["Participant", "Bob"]);
    await addMessage(page, "Solid arrow", "Alice", "Bob");
  } else {
    await addItem(page, "Person", "User");
    await addItem(page, "System", "Shop");
    await addRelationship(page, "One-way relationship", "User", "Shop");
  }
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
}

/** The source view's text, opening the disclosure first if it is closed. */
export async function sourceView(page: Page): Promise<Locator> {
  const region = page.getByRole("region", { name: /Mermaid source/ });
  if ((await region.count()) === 0) await page.getByRole("button", { name: /Mermaid source/ }).click();
  return region.locator("pre");
}

/** What Copy Source puts on the clipboard. */
export async function copiedSource(page: Page): Promise<string> {
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("Source copied");
  return readClipboard(page);
}
