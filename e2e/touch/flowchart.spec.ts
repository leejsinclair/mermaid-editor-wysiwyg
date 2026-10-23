import { expect, test, type Locator, type Page } from "@playwright/test";
import { sourceView } from "../support/sourceView";
import { centreOf, doubleTap, tap, toggleTools, Touches } from "./support";

// VO-036 (FR-027, US5-AS4, SC-009): on the emulated phones a flowchart is built by touch: tap two toolbox shapes, drag a node, connect
// the two by dragging from a handle, rename one by double-tap, delete one, Undo and Redo. After each step the generated source is
// what the same steps give on a desktop. Where a browser cannot send touch drags to a flowchart (WebKit as Playwright runs it), the
// steps that need a drag are left out and the rest are held to the same source.

const SOURCE = {
  empty: "flowchart TD",
  added: 'flowchart TD\n  n1["Rectangle"]\n  n2{"Diamond"}',
  connected: 'flowchart TD\n  n1["Rectangle"]\n  n2{"Diamond"}\n  n1 --> n2',
  renamed: 'flowchart TD\n  n1["Start"]\n  n2{"Diamond"}\n  n1 --> n2',
  deleted: 'flowchart TD\n  n1["Start"]',
} as const;

async function sourceNow(page: Page): Promise<string> {
  return ((await (await sourceView(page)).textContent()) ?? "").trim();
}

const nodes = (page: Page): Locator => page.locator(".react-flow__node");

test("a flowchart is built, edited, deleted from, undone and redone by touch", async ({ page, browserName }) => {
  const canDrag = browserName !== "webkit";
  test.info().annotations.push({ type: "limitation", description: canDrag ? "none" : "touch drags cannot be sent to a flowchart in Playwright's WebKit: the move and connect steps are left out" });
  await page.goto("#/new/flowchart");
  const touches = await Touches.attach(page);
  expect(await sourceNow(page)).toBe(SOURCE.empty);

  await toggleTools(page);
  await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }));
  await toggleTools(page);
  await expect(nodes(page)).toHaveCount(1);
  if (canDrag) {
    const first = await centreOf(nodes(page).first());
    await touches.drag(first, { x: first.x - 110, y: first.y }, 10);
    expect(await sourceNow(page), "moving a node leaves the source as it was").toBe('flowchart TD\n  n1["Rectangle"]');
  }
  await toggleTools(page);
  await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Diamond", exact: true }));
  await toggleTools(page);
  await expect(nodes(page)).toHaveCount(2);
  expect(await sourceNow(page), "after adding two shapes").toBe(SOURCE.added);

  if (canDrag) {
    const handle = await centreOf(nodes(page).first().locator('[data-side="bottom"]'));
    const target = await centreOf(nodes(page).nth(1));
    await touches.drag(handle, target, 12);
    await expect(page.locator(".react-flow__edge")).toHaveCount(1);
    expect(await sourceNow(page), "after connecting by a drag from a handle").toBe(SOURCE.connected);
  }
  const connected = canDrag ? SOURCE.connected : SOURCE.added;

  await doubleTap(page, nodes(page).first());
  const editor = page.getByRole("textbox", { name: /^Label of/ });
  await editor.fill("Start");
  await editor.press("Enter");
  expect(await sourceNow(page), "after renaming by double-tap").toBe(canDrag ? SOURCE.renamed : SOURCE.renamed.replace("\n  n1 --> n2", ""));

  await tap(page, nodes(page).nth(1));
  await toggleTools(page);
  await tap(page, page.getByRole("region", { name: "Properties" }).getByRole("button", { name: "Delete", exact: true }));
  await toggleTools(page);
  await expect(nodes(page)).toHaveCount(1);
  expect(await sourceNow(page), "after deleting a node").toBe(SOURCE.deleted);

  await tap(page, page.getByRole("button", { name: "Undo", exact: true }));
  await expect(nodes(page)).toHaveCount(2);
  expect(await sourceNow(page), "after Undo").toBe(canDrag ? SOURCE.renamed : SOURCE.renamed.replace("\n  n1 --> n2", ""));
  await tap(page, page.getByRole("button", { name: "Redo", exact: true }));
  await expect(nodes(page)).toHaveCount(1);
  expect(await sourceNow(page), "after Redo").toBe(SOURCE.deleted);
  expect(connected.length).toBeGreaterThan(0);
});
