import { expect, test, type Page } from "@playwright/test";
import { copiedSource, sourceView } from "./support/sourceView";

// The source is checked by Mermaid in the background, and Copy Source refuses while that is running; under load the check can
// still be running when a test reaches for the copy.
const checked = (page: Page): Promise<void> => expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText(/Valid/);

// VO-024 (US3-AS2): with the source view open, after an edit, an Undo and a Redo it shows the source generated at that point.

test("the source view shows the newly generated source after an edit, an Undo and a Redo", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const view = await sourceView(page);
  const empty = await view.textContent();
  await checked(page);
  expect(empty).toBe(await copiedSource(page));

  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await expect(view).toContainText("Rectangle");
  const added = await view.textContent();
  expect(added).not.toBe(empty);
  await checked(page);
  expect(added).toBe(await copiedSource(page));

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(view).not.toContainText("Rectangle");
  expect(await view.textContent()).toBe(empty);

  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(view).toContainText("Rectangle");
  expect(await view.textContent()).toBe(added);
});
