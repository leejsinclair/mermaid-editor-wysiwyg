import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";
import { addItem, openNew, toolboxButton } from "./support/c4";

// VO-098 (FR-013, FR-034): a C4 diagram with an empty boundary, and an untitled empty C4 diagram, give source that Mermaid
// rejects. The status is "notice", not "invalid"; the source panel shows the notice; both copy actions still copy; and
// the copy feedback repeats the notice.

const EMPTY_DIAGRAM = "Mermaid cannot draw an empty C4 diagram. Add an element or a title.";
const EMPTY_BOUNDARY = "Mermaid cannot draw an empty boundary: Boundary. Add an element to it or delete it.";

const sourceButton = (page: Page) => page.getByRole("button", { name: /Mermaid source/ });
const messages = (page: Page) => page.getByRole("status", { name: "Messages" });

async function showSource(page: Page): Promise<string> {
  if ((await page.getByRole("region", { name: "Mermaid source" }).count()) === 0) await sourceButton(page).click();
  return (await page.getByRole("region", { name: "Mermaid source" }).locator("pre").textContent()) ?? "";
}

test("an untitled empty C4 diagram has status notice, shows its notice and copies", async ({ page }) => {
  await openNew(page, "context");

  await expect(sourceButton(page)).toContainText("Valid except for a notice");
  await expect(sourceButton(page)).not.toContainText("Invalid");
  const source = await showSource(page);
  await expect(page.getByRole("note").filter({ hasText: EMPTY_DIAGRAM })).toBeVisible();

  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(messages(page)).toContainText("Source copied.");
  await expect(messages(page)).toContainText(EMPTY_DIAGRAM);
  expect(await readClipboard(page)).toBe(source);

  await page.getByRole("button", { name: "Copy for Markdown" }).click();
  await expect(messages(page)).toContainText("Source copied for Markdown.");
  await expect(messages(page)).toContainText(EMPTY_DIAGRAM);
  expect(await readClipboard(page)).toBe("```mermaid\n" + source + "\n```");
});

test("a C4 diagram with an empty boundary has status notice, names the boundary and copies", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await toolboxButton(page, "Boundary").click();

  await expect(sourceButton(page)).toContainText("Valid except for a notice");
  const source = await showSource(page);
  await expect(page.getByRole("note").filter({ hasText: EMPTY_BOUNDARY })).toBeVisible();

  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(messages(page)).toContainText("Source copied.");
  await expect(messages(page)).toContainText(EMPTY_BOUNDARY);
  expect(await readClipboard(page)).toBe(source);
});

test("a title alone makes the diagram drawable, so there is no notice", async ({ page }) => {
  await openNew(page, "context");
  await page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Title", exact: true }).fill("Only a title");
  await page.keyboard.press("Enter");

  await expect(sourceButton(page)).toContainText("Valid");
  await expect(sourceButton(page)).not.toContainText("notice");
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(messages(page)).toHaveText("Source copied.");
});
