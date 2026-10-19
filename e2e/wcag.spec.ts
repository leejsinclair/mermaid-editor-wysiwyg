import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { savedRecord, seedRecords } from "./support/storage";

// VO-071 (WCAG 2.2 AA): the start screen, each dialog and each diagram type with content show no axe violations.

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page): Promise<void> {
  // A fading dialog or a button changing colour is mid-transition and would be measured at colours it does not rest at.
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running" || animation.effect?.getComputedTiming().iterations === Infinity));
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
}

const toolbox = (page: Page) => page.getByRole("region", { name: "Toolbox" });
const properties = (page: Page) => page.getByRole("region", { name: "Properties" });

test("the start screen, empty and with saved diagrams, has no violations", async ({ page }) => {
  await page.goto("/");
  await expectNoViolations(page);

  await seedRecords(page, [savedRecord("a", "Orders", "flowchart", "2026-03-01T09:00:00.000Z"), savedRecord("b", "Context", "c4", "2026-05-02T18:30:00.000Z", "context")]);
  await page.reload();
  await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(2);
  await expectNoViolations(page);
});

test("the C4 kind dialog and the delete confirmation have no violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "New diagram" }).getByRole("button", { name: "C4" }).click();
  await expect(page.getByRole("dialog", { name: "Choose a C4 kind" })).toBeVisible();
  await expectNoViolations(page);
  await page.keyboard.press("Escape");

  await seedRecords(page, [savedRecord("a", "Orders", "flowchart", "2026-03-01T09:00:00.000Z")]);
  await page.reload();
  await page.getByRole("button", { name: "Delete…" }).click();
  await expect(page.getByRole("dialog", { name: "Delete diagram?" })).toBeVisible();
  await expectNoViolations(page);
});

test("a flowchart with content, its source panel, its preview and its connect dialog have no violations", async ({ page }) => {
  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Diamond", { x: 500, y: 250 });
  await canvas.getByLabel(/^Rectangle node/).click();
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await expectNoViolations(page);

  await page.getByRole("button", { name: /Mermaid source/ }).click();
  await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();
  await expect(page.getByRole("region", { name: "Preview as Mermaid draws it" }).getByRole("application").locator("svg").first()).toBeVisible();
  await expectNoViolations(page);
  await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();

  await properties(page).getByRole("button", { name: "Connect…" }).click();
  await expect(page.getByRole("dialog", { name: "Connect to" })).toBeVisible();
  await expectNoViolations(page);
});

test("a sequence diagram with content and its message dialog have no violations", async ({ page }) => {
  await page.goto("/new/sequence");
  await toolbox(page).getByRole("button", { name: "Participant", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "Actor", exact: true }).click();
  await toolbox(page).getByRole("button", { name: "Solid arrow", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add message" })).toBeVisible();
  await expectNoViolations(page);
  await page.getByRole("dialog", { name: "Add message" }).getByRole("radio").first().check();
  await page.getByRole("dialog", { name: "Add message" }).getByRole("radiogroup", { name: "Receiver" }).getByRole("radio").nth(1).check();
  await page.getByRole("dialog", { name: "Add message" }).getByRole("button", { name: "Add message" }).click();
  await expect(page.getByRole("region", { name: "Diagram canvas" }).getByTestId("message")).toHaveCount(1);
  await expectNoViolations(page);
});

test("a C4 diagram with content, its relationship dialog and its move dialog have no violations", async ({ page }) => {
  await page.goto("/new/c4/context");
  for (const type of ["Person", "System", "System boundary"]) await toolbox(page).getByRole("button", { name: type, exact: true }).click();
  await toolbox(page).getByRole("button", { name: "One-way relationship", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add relationship" })).toBeVisible();
  await expectNoViolations(page);
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("region", { name: "Diagram canvas" }).getByTestId("c4-element").first().focus();
  await page.keyboard.press("Enter");
  await properties(page).getByRole("button", { name: "Move to…" }).click();
  await expect(page.getByRole("dialog", { name: "Move to" })).toBeVisible();
  await expectNoViolations(page);
  await page.keyboard.press("Escape");
  await expectNoViolations(page);
});

test("the dialogs that appear when a second tab edits the same diagram have no violations", async ({ page, context }) => {
  await page.goto("/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await expect(page).toHaveURL(/\/d\/[\w-]+$/);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  const address = page.url();

  const second = await context.newPage();
  await second.goto(address);
  await expect(second.getByRole("dialog", { name: "Open in another tab" })).toBeVisible();
  await expectNoViolations(second);
  await second.getByRole("button", { name: "Edit here instead" }).click();

  await expect(page.getByRole("dialog", { name: "Editing moved to another tab" })).toBeVisible();
  await expectNoViolations(page);
});
