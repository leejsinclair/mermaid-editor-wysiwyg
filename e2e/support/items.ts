import { expect, type Locator, type Page } from "@playwright/test";
import { settleNewShape } from "./flowchart";

// One item of each kind that has a label, added with the toolbox to a fresh diagram (spec 004-canvas-usability).

export const ITEM_KINDS = ["node", "participant", "actor", "c4-element", "c4-boundary", "c4-deployment-node"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export interface OpenedItem {
  /** The drawn item as a whole. */
  readonly item: Locator;
  /** The part of the item that is its body: where a drag moves it. */
  readonly body: Locator;
  /** The drawn label. */
  readonly label: Locator;
  /** The label as first drawn. */
  readonly text: string;
  /** The elements that hold the drawn label, one per line (a flowchart node holds all its lines in one). */
  readonly lines: Locator;
}

const C4_TEXT = new Map<ItemKind, string>([
  ["c4-element", "Person"],
  ["c4-boundary", "System boundary"],
  ["c4-deployment-node", "Deployment node"],
]);

const canvasOf = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });
const toolbox = (page: Page, name: string): Locator => page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true });

/** Opens a new diagram of the right view and adds one item of the kind with the toolbox. */
export async function openItem(page: Page, kind: ItemKind): Promise<OpenedItem> {
  const canvas = canvasOf(page);
  if (kind === "node") {
    await page.goto("#/new/flowchart");
    await page.getByRole("button", { name: "Rectangle", exact: true }).click();
    // A new flowchart shape opens its label for editing (spec 008); the tests that use this item start from a settled canvas.
    await settleNewShape(page);
    const item = canvas.locator(".react-flow__node");
    await expect(item).toHaveCount(1);
    return { item, body: item, label: item.getByTestId("node-label"), text: "Rectangle", lines: item.getByTestId("node-label") };
  }
  if (kind === "participant" || kind === "actor") {
    await page.goto("#/new/sequence");
    const text = kind === "actor" ? "Actor" : "Participant";
    await toolbox(page, text).click();
    // A new item opens its label for editing (spec 008); the tests that use this item start from a settled canvas.
    await settleNewShape(page);
    const item = canvas.getByTestId("participant");
    await expect(item).toHaveCount(1);
    const header = item.getByTestId("participant-header");
    return { item, body: header, label: header.getByTestId("line"), text, lines: header.getByTestId("line") };
  }
  await page.goto(`#/new/c4/${kind === "c4-deployment-node" ? "deployment" : "container"}`);
  const text = C4_TEXT.get(kind) ?? "";
  await toolbox(page, text).click();
  await settleNewShape(page);
  const item = canvas.locator('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]');
  await expect(item).toHaveCount(1);
  return { item, body: item, label: item.getByTestId("item-label"), text, lines: item.getByTestId("item-label").getByTestId("line") };
}

/**
 * Double-clicks the part of an item that is its body, away from the label: near its bottom-right corner, or its top-left for a
 * header. The drawn box of an SVG item has rings around it (hover and drop-target) that count in its bounding box but not in its
 * body, so the point is taken well inside.
 */
export async function doubleClickBody(opened: OpenedItem, kind: ItemKind): Promise<void> {
  const box = await opened.body.boundingBox();
  if (!box) throw new Error("The body must be visible");
  const header = kind === "participant" || kind === "actor";
  await opened.body.dblclick({ position: header ? { x: 14, y: 14 } : { x: box.width - 14, y: box.height - 14 } });
}

/** The label as drawn, its lines joined by line feeds. */
export async function drawnLabel(opened: OpenedItem): Promise<string> {
  return (await opened.lines.allTextContents()).join("\n");
}

/** The generated source as shown in its panel. */
export async function sourceOf(page: Page): Promise<string> {
  const panel = page.getByRole("region", { name: "Mermaid source" });
  if ((await panel.count()) === 0) await page.getByRole("button", { name: "Mermaid source" }).click();
  return (await panel.textContent()) ?? "";
}

/** The Properties panel's label field. */
export const panelLabel = (page: Page): Locator => page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });

/** Opens the label editor by double-clicking the drawn label and returns it. */
export async function openEditor(opened: OpenedItem): Promise<Locator> {
  await opened.label.dblclick();
  const editor = opened.item.page().getByTestId("inline-label-editor");
  await expect(editor).toBeVisible();
  return editor;
}

export const VIEWS = ["flowchart", "sequence", "c4"] as const;
export type View = (typeof VIEWS)[number];

/** Opens a new diagram of the view and adds two items with the toolbox; returns them in the order added. */
export async function openPair(page: Page, view: View): Promise<readonly [OpenedItem, OpenedItem]> {
  const canvas = canvasOf(page);
  if (view === "flowchart") {
    await page.goto("#/new/flowchart");
    await page.getByRole("button", { name: "Rectangle", exact: true }).click();
    await page.getByRole("button", { name: "Circle", exact: true }).click();
    const nodes = canvas.locator(".react-flow__node");
    await expect(nodes).toHaveCount(2);
    const make = (nth: number, text: string): OpenedItem => {
      const item = nodes.nth(nth);
      return { item, body: item, label: item.getByTestId("node-label"), text, lines: item.getByTestId("node-label") };
    };
    return [make(0, "Rectangle"), make(1, "Circle")];
  }
  if (view === "sequence") {
    await page.goto("#/new/sequence");
    await toolbox(page, "Participant").click();
    await toolbox(page, "Actor").click();
    const participants = canvas.getByTestId("participant");
    await expect(participants).toHaveCount(2);
    const make = (nth: number, text: string): OpenedItem => {
      const item = participants.nth(nth);
      const header = item.getByTestId("participant-header");
      return { item, body: header, label: header.getByTestId("line"), text, lines: header.getByTestId("line") };
    };
    return [make(0, "Participant"), make(1, "Actor")];
  }
  await page.goto("#/new/c4/container");
  await toolbox(page, "Person").click();
  await toolbox(page, "System").click();
  const items = canvas.getByTestId("c4-element");
  await expect(items).toHaveCount(2);
  const make = (nth: number, text: string): OpenedItem => {
    const item = items.nth(nth);
    return { item, body: item, label: item.getByTestId("item-label"), text, lines: item.getByTestId("item-label").getByTestId("line") };
  };
  return [make(0, "Person"), make(1, "System")];
}
