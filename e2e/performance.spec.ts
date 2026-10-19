import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-095 (SC-012): in each type a diagram of 100 elements and 150 relationships (e2e/fixtures/performance-*.json) is
// edited, undone and redone, and each change is reflected on the canvas and in the source within 1 second.

const LIMIT_MS = 1000;

const canvas = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });

async function openFixture(page: Page, name: string): Promise<void> {
  await page.goto("/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open file…" }).click();
  await (await chooser).setFiles(`e2e/fixtures/performance-${name}.mermaid-editor.json`);
  await expect(page).toHaveURL(/\/d\/[\w-]+$/);
}

/** Runs `change` and returns the milliseconds until `shown` holds: the canvas and the source both reflect it. */
async function timed(change: () => Promise<void>, shown: () => Promise<void>): Promise<number> {
  const started = Date.now();
  await change();
  await shown();
  return Date.now() - started;
}

interface Scenario {
  readonly name: string;
  readonly fixture: string;
  readonly items: (page: Page) => Locator;
  /** The item that is edited, and the text that shows its original label on the canvas. */
  readonly target: (page: Page) => Locator;
  readonly drawnLabel: (page: Page) => Locator;
  readonly original: string;
}

const SCENARIOS: readonly Scenario[] = [
  {
    name: "flowchart",
    fixture: "flowchart",
    items: (page) => canvas(page).locator(".react-flow__node"),
    target: (page) => canvas(page).locator('.react-flow__node[data-id="3"]'),
    drawnLabel: (page) => canvas(page).locator('.react-flow__node[data-id="3"]').getByTestId("node-label"),
    original: "Step 3",
  },
  {
    name: "sequence diagram",
    fixture: "sequence",
    items: (page) => canvas(page).getByTestId("participant"),
    target: (page) => canvas(page).locator('[data-testid="participant"][data-id="3"]'),
    drawnLabel: (page) => canvas(page).locator('[data-testid="participant"][data-id="3"]'),
    original: "Role 3",
  },
  {
    name: "C4 diagram",
    fixture: "c4",
    items: (page) => canvas(page).getByTestId("c4-element"),
    target: (page) => canvas(page).locator('[data-testid="c4-element"][data-id="3"]'),
    drawnLabel: (page) => canvas(page).locator('[data-testid="c4-element"][data-id="3"]').getByTestId("item-label"),
    original: "Service 3",
  },
];

for (const scenario of SCENARIOS) {
  test(`a ${scenario.name} of 100 elements and 150 relationships reflects an edit, Undo and Redo within a second`, async ({ page }) => {
    await openFixture(page, scenario.fixture);
    await expect(scenario.items(page)).toHaveCount(100);
    await page.getByRole("button", { name: /Mermaid source/ }).click();
    const source = page.getByRole("region", { name: /Mermaid source/ });
    await expect(source).toContainText(scenario.original);
    await scenario.target(page).focus();
    await page.keyboard.press("Enter");
    const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
    await expect(label).toHaveValue(scenario.original);
    await label.fill("Renamed");

    const edit = await timed(
      () => label.press("Enter"),
      async () => {
        await expect(scenario.drawnLabel(page)).toContainText("Renamed", { timeout: LIMIT_MS });
        await expect(source).toContainText("Renamed", { timeout: LIMIT_MS });
      },
    );
    await page.locator("body").press("Escape");
    const undo = await timed(
      () => page.getByRole("button", { name: "Undo", exact: true }).click(),
      async () => {
        await expect(scenario.drawnLabel(page)).toContainText(scenario.original, { timeout: LIMIT_MS });
        await expect(source).not.toContainText("Renamed", { timeout: LIMIT_MS });
      },
    );
    const redo = await timed(
      () => page.getByRole("button", { name: "Redo", exact: true }).click(),
      async () => {
        await expect(scenario.drawnLabel(page)).toContainText("Renamed", { timeout: LIMIT_MS });
        await expect(source).toContainText("Renamed", { timeout: LIMIT_MS });
      },
    );

    expect(Math.max(edit, undo, redo)).toBeLessThan(LIMIT_MS);
  });
}
