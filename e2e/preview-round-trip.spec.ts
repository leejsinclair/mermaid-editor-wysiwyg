import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";
import { addShape, connect } from "./support/flowchart";

// Spec 008, US4: the preview shows the source generated from the current diagram and refreshes after each edit; Back to
// editing returns with the diagram, its layout and its undo history unchanged; an invalid diagram shows the problem;
// labels with special characters are escaped alike in the preview and the copied source; the source can be inspected
// and copied. VO-013, VO-014, VO-031, VO-032, VO-045, VO-048.

const TOGGLE = "Preview as Mermaid draws it";
const NOTE = "Node positions are kept in the editor only. Mermaid arranges the copied diagram its own way.";

const canvasOf = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const preview = (page: Page) => page.getByRole("region", { name: TOGGLE });

async function sourceText(page: Page): Promise<string> {
  const panel = page.getByRole("region", { name: "Mermaid source" });
  if ((await panel.count()) === 0) await page.getByRole("button", { name: /^Mermaid source/ }).click();
  return (await panel.textContent()) ?? "";
}

async function twoShapes(page: Page) {
  await page.goto("#/new/flowchart");
  const canvas = canvasOf(page);
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
}

test("the preview shows the current diagram, with the explanation and a Back to editing control", async ({ page }) => {
  await twoShapes(page);
  await page.getByRole("button", { name: TOGGLE }).click();

  await expect(preview(page).getByRole("application").locator("svg").first()).toBeVisible();
  for (const label of ["Rectangle", "Circle"]) await expect(preview(page)).toContainText(label);
  await expect(preview(page).getByText(NOTE)).toBeVisible();
  await expect(preview(page).getByRole("button", { name: "Back to editing", exact: true })).toBeVisible();
});

test("an edit made while the preview is open is shown in it", async ({ page }) => {
  await twoShapes(page);
  await page.getByRole("button", { name: TOGGLE }).click();
  await expect(preview(page)).toContainText("Circle");

  await addShape(page, canvasOf(page), "Diamond", { x: 600, y: 80 });

  await expect(preview(page)).toContainText("Diamond", { timeout: 2000 });
});

test("Back to editing keeps the diagram, its layout and its undo history", async ({ page }) => {
  await twoShapes(page);
  const nodes = canvasOf(page).locator(".react-flow__node");
  // The layout is each node's place on the canvas, not on the screen: opening the preview may scroll the page.
  const placesOf = () => nodes.evaluateAll((items) => items.map((item) => (item as HTMLElement).style.transform));
  const placesBefore = await placesOf();
  const sourceBefore = await sourceText(page);

  await page.getByRole("button", { name: TOGGLE }).click();
  await preview(page).getByRole("button", { name: "Back to editing", exact: true }).click();

  await expect(preview(page)).toHaveCount(0);
  expect(await sourceText(page)).toBe(sourceBefore);
  expect(await placesOf()).toEqual(placesBefore);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(canvasOf(page).locator(".react-flow__edge")).toHaveCount(0);
});

test("when the diagram cannot be drawn, the preview shows the problem instead of a blank area", async ({ page }) => {
  await page.route("**/.vite/deps/mermaid*", async (route) => {
    if (route.request().resourceType() !== "script") return route.continue();
    return route.fulfill({
      contentType: "text/javascript",
      body: `export default {
        initialize() {},
        parse: async () => ({ diagramType: "flowchart" }),
        render: async () => { throw new Error("Parse error on line 2"); },
      };`,
    });
  });
  await page.goto("#/new/flowchart");
  await addShape(page, canvasOf(page), "Rectangle", { x: 200, y: 100 });

  await page.getByRole("button", { name: TOGGLE }).click();

  await expect(preview(page).getByRole("alert")).toContainText("Parse error on line 2");
  await expect(preview(page).getByRole("button", { name: "Back to editing", exact: true })).toBeVisible();
});

test("a label with special characters reads the same in the preview and the copied source", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = canvasOf(page);
  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  const label = 'Say "hi" & <go>';
  await canvas.getByLabel(/^Rectangle node/).click();
  const field = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await field.fill(label);
  await field.press("Enter");
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");

  await page.getByRole("button", { name: TOGGLE }).click();
  await expect(preview(page).getByRole("application")).toContainText(label);

  const shown = await sourceText(page);
  await page.getByRole("button", { name: "Copy Source", exact: true }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText(/copied/i);
  const copied = await readClipboard(page);
  expect(copied.trim()).toBe(shown.trim());
  expect(copied).not.toContain(label);
});
