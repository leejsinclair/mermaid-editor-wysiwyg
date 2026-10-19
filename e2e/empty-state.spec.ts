import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";

// VO-069 (EC-05): a new diagram of each type, and a diagram with every item deleted, keep an editable canvas with
// the empty hint, no stale drawing, a bare-header source, and working copy actions.

const HINT = "Drag an element from the toolbox, or activate one, to start.";
const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const properties = (page: Page) => page.getByRole("region", { name: "Properties" });

const NEW_DIAGRAMS = [
  { name: "flowchart", path: "/new/flowchart", header: /^flowchart TD$/ },
  { name: "sequence", path: "/new/sequence", header: /^sequenceDiagram$/ },
  { name: "C4 context", path: "/new/c4/context", header: /^C4Context$/ },
] as const;

async function expectEmptyState(page: Page, header: RegExp) {
  await expect(canvas(page)).toContainText(HINT);
  await expect(canvas(page).locator(".react-flow__node, [data-testid=participant], [data-testid=c4-element], [data-testid=message]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await page.getByRole("button", { name: /Mermaid source/ }).click();
  // An empty C4 diagram's panel also shows its notice after the header.
  await expect(page.getByRole("region", { name: /Mermaid source/ })).toHaveText(new RegExp(header.source.replace("$", "")));
  const messages = page.getByRole("status", { name: "Messages" });
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(messages).toContainText("Source copied.");
  expect(await readClipboard(page)).toMatch(header);
  await page.getByRole("button", { name: "Copy for Markdown" }).click();
  await expect(messages).toContainText("Source copied for Markdown.");
}

for (const { name, path, header } of NEW_DIAGRAMS) {
  test(`a new ${name} diagram shows the empty hint and a bare-header source that copies`, async ({ page }) => {
    await page.goto(path);

    await expectEmptyState(page, header);
  });
}

test("a flowchart with its only node deleted shows the hint again", async ({ page }) => {
  await page.goto("/new/flowchart");
  await expect(canvas(page)).toContainText(HINT);
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas(page), { targetPosition: { x: 300, y: 200 } });
  await expect(canvas(page)).not.toContainText(HINT);
  await canvas(page).locator(".react-flow__node").first().click();

  await properties(page).getByRole("button", { name: "Delete" }).click();

  await expectEmptyState(page, /^flowchart TD$/);
});

test("a sequence diagram with its only participant deleted shows the hint again", async ({ page }) => {
  await page.goto("/new/sequence");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Participant", exact: true }).click();
  await expect(canvas(page)).not.toContainText(HINT);
  await canvas(page).getByTestId("participant").first().click();

  await properties(page).getByRole("button", { name: "Delete" }).click();

  await expectEmptyState(page, /^sequenceDiagram$/);
});

test("a C4 diagram with its only element deleted shows the hint again and the empty notice", async ({ page }) => {
  await page.goto("/new/c4/context");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "System", exact: true }).click();
  await expect(canvas(page)).not.toContainText(HINT);
  await canvas(page).getByTestId("c4-element").first().click();

  await properties(page).getByRole("button", { name: "Delete" }).click();

  await expectEmptyState(page, /^C4Context$/);
  await expect(page.getByRole("region", { name: /Mermaid source/ })).toContainText("Mermaid cannot draw an empty C4 diagram");
});
