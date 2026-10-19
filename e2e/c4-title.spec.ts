import { expect, test, type Page } from "@playwright/test";
import { canvas, openNew, sourceLines } from "./support/c4";

// VO-059 (FR-054): of a flowchart, a sequence diagram and a C4 diagram, only the C4 diagram offers a title, and the
// title is shown on its canvas and written to the source.

const properties = (page: Page) => page.getByRole("region", { name: "Properties" });
const titleField = (page: Page) => properties(page).getByRole("textbox", { name: "Title", exact: true });

test("a flowchart and a sequence diagram offer no title", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await expect(properties(page)).toBeVisible();
  await expect(titleField(page)).toHaveCount(0);

  await page.goto("#/new/sequence");
  await page.reload();
  await expect(properties(page)).toBeVisible();
  await expect(titleField(page)).toHaveCount(0);
});

test("a C4 diagram offers a title, which is shown on the canvas and written to the source", async ({ page }) => {
  await openNew(page, "context");
  await expect(canvas(page).getByTestId("c4-title")).toHaveCount(0);

  await titleField(page).fill("Payments overview");
  await titleField(page).press("Enter");

  await expect(canvas(page).getByTestId("c4-title")).toHaveText("Payments overview");
  expect(await sourceLines(page)).toEqual(["title Payments overview"]);
});

test("a title can have several lines, be cancelled with Escape, be cleared and be undone", async ({ page }) => {
  await openNew(page, "dynamic");
  await titleField(page).fill("Line one");
  await titleField(page).press("Shift+Enter");
  await titleField(page).pressSequentially("line two");
  await titleField(page).press("Enter");
  await expect(canvas(page).getByTestId("c4-title")).toHaveText("Line one\nline two");

  await titleField(page).fill("Never kept");
  await titleField(page).press("Escape");
  await expect(titleField(page)).toHaveValue("Line one\nline two");

  await titleField(page).fill("");
  await titleField(page).press("Enter");
  await expect(canvas(page).getByTestId("c4-title")).toHaveCount(0);
  expect((await sourceLines(page)).some((line) => line.startsWith("title"))).toBe(false);

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(canvas(page).getByTestId("c4-title")).toHaveText("Line one\nline two");
});

test("every C4 kind offers the title", async ({ page }) => {
  for (const kind of ["container", "component", "deployment"] as const) {
    await openNew(page, kind);
    await expect(titleField(page)).toBeVisible();
  }
});
