import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";

// VO-069 (EC-05): a new diagram of each type, and a diagram with every item deleted, keep an editable canvas with
// the empty hint, no stale drawing, a bare-header source, and working copy actions.

// Each view names the three steps in its own element names (spec 008, US1, Clarifications 2026-10-24).
const FLOWCHART_HINT = "1. Add a shape.";
const SEQUENCE_HINT = "1. Add a participant.";
const C4_HINT = "1. Add an element.";
const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const properties = (page: Page) => page.getByRole("region", { name: "Properties" });

const NEW_DIAGRAMS = [
  { name: "flowchart", path: "#/new/flowchart", header: /^flowchart TD$/, hint: FLOWCHART_HINT },
  { name: "sequence", path: "#/new/sequence", header: /^sequenceDiagram$/, hint: SEQUENCE_HINT },
  { name: "C4 context", path: "#/new/c4/context", header: /^C4Context$/, hint: C4_HINT },
] as const;

async function expectEmptyState(page: Page, header: RegExp, hint: string) {
  await expect(canvas(page)).toContainText(hint);
  await expect(canvas(page).locator(".react-flow__node, [data-testid=participant], [data-testid=c4-element], [data-testid=message]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await page.getByRole("button", { name: /Mermaid source/ }).click();
  // An empty C4 diagram's panel also shows its notice after the header.
  await expect(page.getByRole("region", { name: /Mermaid source/ })).toContainText(header.source.slice(1, -1));
  const messages = page.getByRole("status", { name: "Messages" });
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(messages).toContainText("Source copied.");
  expect(await readClipboard(page)).toMatch(header);
  await page.getByRole("button", { name: "Copy for Markdown" }).click();
  await expect(messages).toContainText("Source copied for Markdown.");
}

for (const { name, path, header, hint } of NEW_DIAGRAMS) {
  test(`a new ${name} diagram shows the empty hint and a bare-header source that copies`, async ({ page }) => {
    await page.goto(path);

    await expectEmptyState(page, header, hint);
  });
}

test("a flowchart with its only node deleted shows the hint again", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await expect(canvas(page)).toContainText(FLOWCHART_HINT);
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas(page), { targetPosition: { x: 300, y: 200 } });
  await expect(canvas(page)).not.toContainText(FLOWCHART_HINT);
  await canvas(page).locator(".react-flow__node").first().click();

  await properties(page).getByRole("button", { name: "Delete" }).click();

  await expectEmptyState(page, /^flowchart TD$/, FLOWCHART_HINT);
});

test("a sequence diagram with its only participant deleted shows the hint again", async ({ page }) => {
  await page.goto("#/new/sequence");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Participant", exact: true }).click();
  // The new participant opens its label for editing (spec 008, FR-004); Escape keeps the label it has.
  await page.getByTestId("inline-label-editor").press("Escape");
  await expect(canvas(page)).not.toContainText(SEQUENCE_HINT);
  await canvas(page).getByTestId("participant").first().click();

  await properties(page).getByRole("button", { name: "Delete" }).click();

  await expectEmptyState(page, /^sequenceDiagram$/, SEQUENCE_HINT);
});

test("a C4 diagram with its only element deleted shows the hint again and the empty notice", async ({ page }) => {
  await page.goto("#/new/c4/context");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "System", exact: true }).click();
  await page.getByTestId("inline-label-editor").press("Escape");
  await expect(canvas(page)).not.toContainText(C4_HINT);
  await canvas(page).getByTestId("c4-element").first().click();

  await properties(page).getByRole("button", { name: "Delete" }).click();

  await expectEmptyState(page, /^C4Context$/, C4_HINT);
  await expect(page.getByRole("region", { name: /Mermaid source/ })).toContainText("Mermaid cannot draw an empty C4 diagram");
});
