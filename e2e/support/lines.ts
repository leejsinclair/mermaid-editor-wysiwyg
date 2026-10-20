import { expect, type Locator, type Page } from "@playwright/test";
import { addItem, addRelationship, openNew } from "./c4";
import { addShape, connect } from "./flowchart";
import { addMessage, addParticipants } from "./sequence";
import type { View } from "./items";

// One line of each kind (a flowchart connection, a Sequence message, a C4 relationship), drawn with the editor's own
// commands, for the in-place editing of lines (spec 004-canvas-usability).

export interface Line {
  readonly view: View;
  readonly page: Page;
  /** The drawn line as a whole: the flowchart edge, the message or the relationship. */
  readonly line: Locator;
  /** The drawn label, which exists when the line has a label. */
  readonly label: Locator;
  /** The label as first drawn; empty for an unlabelled flowchart connection. */
  readonly text: string;
  /** The end handles that appear on a selected line, source then target. */
  readonly ends: readonly [Locator, Locator];
  /** Double-clicks the line itself, away from its label. */
  readonly doubleClickLine: () => Promise<void>;
  /** Double-clicks the drawn label. */
  readonly doubleClickLabel: () => Promise<void>;
}

const canvasOf = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });

/** Two clicks at a point, a moment apart as a person makes them (the app tells a double click from its own timing). */
async function doubleClickAt(page: Page, point: { x: number; y: number }): Promise<void> {
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(80);
  await page.mouse.click(point.x, point.y);
}

/** A point on a path, as a fraction of its length, in page coordinates. */
async function pointOnPath(path: Locator, fraction: number): Promise<{ x: number; y: number }> {
  return path.evaluate((path: SVGPathElement, at: number) => {
    const point = path.getPointAtLength(path.getTotalLength() * at);
    const matrix = path.getScreenCTM();
    if (!matrix) throw new Error("The edge must be drawn");
    return { x: point.x * matrix.a + point.y * matrix.c + matrix.e, y: point.x * matrix.b + point.y * matrix.d + matrix.f };
  }, fraction);
}

async function flowchartLine(page: Page, label: string | null): Promise<Line> {
  await page.goto("#/new/flowchart");
  const canvas = canvasOf(page);
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
  const edge = canvas.locator(".react-flow__edge");
  if (label !== null) {
    const point = await pointOnPath(edge.locator("path.react-flow__edge-interaction"), 0.25);
    await page.mouse.click(point.x, point.y);
    const field = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
    await field.fill(label);
    await field.press("Enter");
    await expect(canvas.getByTestId("connection-label")).toHaveText(label);
    // The click that selected the line must not count towards a double click made at the same place a moment later.
    await page.waitForTimeout(500);
  }
  const fraction = label === null ? 0.5 : 0.25;
  return {
    view: "flowchart",
    page,
    line: edge,
    label: canvas.getByTestId("connection-label"),
    text: label ?? "",
    ends: [edge.locator(".react-flow__edgeupdater-source"), edge.locator(".react-flow__edgeupdater-target")],
    doubleClickLine: async () => {
      const point = await pointOnPath(edge.locator("path.react-flow__edge-interaction"), fraction);
      await doubleClickAt(page, point);
    },
    doubleClickLabel: async () => {
      const box = await canvas.getByTestId("connection-label").boundingBox();
      if (!box) throw new Error("The label must be drawn");
      await doubleClickAt(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    },
  };
}

async function sequenceLine(page: Page): Promise<Line> {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  await addMessage(page, "Solid arrow", "A", "B");
  const message = canvasOf(page).getByTestId("message");
  await expect(message).toHaveCount(1);
  const label = message.getByTestId("message-text");
  return {
    view: "sequence",
    page,
    line: message,
    label,
    text: "Solid arrow",
    ends: [canvasOf(page).getByTestId("message-end-from"), canvasOf(page).getByTestId("message-end-to")],
    doubleClickLine: async () => {
      await doubleClickAt(page, await pointOnPath(message.locator("path").first(), 0.5));
    },
    doubleClickLabel: () => label.dblclick(),
  };
}

async function c4Line(page: Page): Promise<Line> {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Shop");
  await addRelationship(page, "One-way relationship", "Customer", "Shop");
  const relationship = canvasOf(page).getByTestId("c4-relationship");
  await expect(relationship).toHaveCount(1);
  const label = relationship.getByTestId("relationship-text");
  return {
    view: "c4",
    page,
    line: relationship,
    label,
    text: "Uses",
    ends: [canvasOf(page).getByTestId("relationship-end-from"), canvasOf(page).getByTestId("relationship-end-to")],
    doubleClickLine: async () => {
      await doubleClickAt(page, await pointOnPath(relationship.locator("path").first(), 0.5));
    },
    doubleClickLabel: () => label.dblclick(),
  };
}

/** Opens a new diagram of the view and draws one line in it; a flowchart connection is labelled `label`, or left unlabelled when null. */
export function openLine(page: Page, view: View, label: string | null = "Link"): Promise<Line> {
  if (view === "flowchart") return flowchartLine(page, label);
  return view === "sequence" ? sequenceLine(page) : c4Line(page);
}
