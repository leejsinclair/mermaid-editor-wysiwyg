import { expect, type Locator, type Page } from "@playwright/test";
import { exactly, startingWith } from "./regexp";
import { dragBetween, relabel } from "./sequence";

export { dragBetween, relabel };

export type Kind = "context" | "container" | "component" | "dynamic" | "deployment";

/** The canvas of a C4 diagram. */
export const canvas = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });

/** The toolbox button names of a group, in order. */
export const toolboxNames = (page: Page, group: string): Promise<string[]> =>
  page.getByRole("region", { name: "Toolbox" }).getByRole("group", { name: group }).getByRole("button").allTextContents();

export const toolboxButton = (page: Page, name: string): Locator => page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true });

/** The element, boundary or node on the canvas with this label (the text drawn, not its type). */
export const itemLabelled = (page: Page, label: string): Locator =>
  canvas(page).locator('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]').filter({ has: page.getByTestId("item-label").filter({ hasText: exactly(label) }) });

/**
 * The connection handles of an element or node. They are drawn above the relationships, so they are not inside the item's own
 * group: they are found by the item's id. Give a side to get that handle only.
 */
export async function handlesOf(item: Locator, side?: "top" | "right" | "bottom" | "left"): Promise<Locator> {
  const id = await item.getAttribute("data-id");
  const sideFilter = side ? `[data-side="${side}"]` : "";
  return item.page().locator(`[data-zone="connect"][data-item="${String(id)}"]${sideFilter}`);
}

/** Every element, boundary and node on the canvas, in document order, as the names they announce. */
export async function itemNames(page: Page): Promise<string[]> {
  return canvas(page)
    .locator('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]')
    .evaluateAll((items) => items.map((item) => item.getAttribute("aria-label") ?? ""));
}

/** Every relationship on the canvas, in order, as the names they announce. */
export async function relationshipNames(page: Page): Promise<string[]> {
  return canvas(page).getByTestId("c4-relationship").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label") ?? ""));
}

/** The generated source after the header and any title line. */
export async function sourceLines(page: Page): Promise<string[]> {
  const panel = page.getByRole("region", { name: "Mermaid source" });
  if ((await panel.count()) === 0) await page.getByRole("button", { name: "Mermaid source" }).click();
  const text = (await panel.textContent()) ?? "";
  return text.split("\n").map((line) => line.trim()).filter((line) => line !== "" && !/^C4\w+$/.test(line));
}

/** Adds one element, boundary or node with the toolbox, then gives it a label. Returns once the label is drawn. */
export async function addItem(page: Page, type: string, label: string): Promise<void> {
  const before = await canvas(page).locator('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]').count();
  await toolboxButton(page, type).click();
  const items = canvas(page).locator('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]');
  await expect(items).toHaveCount(before + 1);
  const added = items.filter({ has: page.getByTestId("item-label").filter({ hasText: exactly(type) }) }).last();
  await relabel(page, added, label);
  await expect(itemLabelled(page, label)).toHaveCount(1);
  await page.keyboard.press("Escape");
}

/** Adds a relationship with the "Add relationship" dialog: activate the type, choose both ends, confirm. */
export async function addRelationship(page: Page, type: "One-way relationship" | "Two-way relationship", from: string, to: string): Promise<void> {
  await toolboxButton(page, type).click();
  const dialog = page.getByRole("dialog", { name: "Add relationship" });
  await dialog.getByRole("radiogroup", { name: "Source" }).getByRole("radio", { name: startingWith(`${from} `) }).check();
  await dialog.getByRole("radiogroup", { name: "Target" }).getByRole("radio", { name: startingWith(`${to} `) }).check();
  await dialog.getByRole("button", { name: "Add relationship" }).click();
  await expect(dialog).toHaveCount(0);
}

/** Selects the item from the keyboard, as a screen-reader user would. */
export async function select(page: Page, item: Locator): Promise<void> {
  await item.focus();
  await page.keyboard.press("Enter");
}

/** Starts a diagram of a kind from the address, which is how a new diagram of that kind opens. */
export async function openNew(page: Page, kind: Kind): Promise<void> {
  await page.goto(`#/new/c4/${kind}`);
  await expect(canvas(page)).toBeVisible();
}

type SeedItem =
  | { item: "element"; id: number; elementType: string; label: string; description?: string; technology?: string }
  | { item: "boundary"; id: number; boundaryType: string; label: string; children: SeedItem[] }
  | { item: "deployment-node"; id: number; label: string; description?: string; technology?: string; children: SeedItem[] };

interface SeedRelationship {
  id: number;
  from: number;
  to: number;
  direction?: "one-way" | "two-way";
  label?: string;
}

const filled = (item: SeedItem): unknown => {
  if (item.item === "boundary") return { ...item, children: item.children.map(filled) };
  if (item.item === "deployment-node") return { description: "", technology: "", ...item, children: item.children.map(filled) };
  return { description: "", technology: "", ...item };
};

/** A saved C4 diagram with a tree and relationships built by hand, as the editor would have stored it. */
export function c4Record(id: string, name: string, kind: Kind, tree: readonly SeedItem[], relationships: readonly SeedRelationship[] = []): Record<string, unknown> {
  const ids = [...tree.flatMap(function ids(item): number[] { return [item.id, ...("children" in item ? item.children.flatMap(ids) : [])]; }), ...relationships.map((relationship) => relationship.id)];
  const model = {
    name,
    type: "c4",
    kind,
    title: "",
    nextId: Math.max(0, ...ids) + 1,
    content: {
      tree: tree.map(filled),
      relationships: relationships.map((relationship) => ({ direction: "one-way", label: "Uses", technology: "", ...relationship })),
    },
  };
  return { id, name, type: "c4", kind, changedAt: "2026-10-18T10:00:00.000Z", formatVersion: 1, model };
}
