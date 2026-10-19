import { expect, test, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";

// VO-078 (EC-15, FR-042): a new diagram left without a committed change is not stored or listed; its first record is
// written at its first committed change, after which its address becomes /d/<id> with the editing session intact.

/** How many diagrams the browser has stored: none when the database was never created. */
async function storedCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const databases = await indexedDB.databases();
    if (!databases.some((database) => database.name === "mermaid-editor")) return 0;
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open("mermaid-editor");
      open.onerror = () => {
        reject(new Error("The database could not be opened"));
      };
      open.onsuccess = () => {
        resolve(open.result);
      };
    });
    return new Promise<number>((resolve) => {
      const count = database.transaction("diagrams").objectStore("diagrams").count();
      count.onsuccess = () => {
        resolve(count.result);
      };
    });
  });
}

test("a new diagram left without a change is not stored and is not on the start screen", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Not saved yet");

  await page.goto("#/");
  await page.reload();

  expect(await storedCount(page)).toBe(0);
  await expect(page.getByRole("heading", { name: "Mermaid diagram editor" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(0);
});

test("the first committed change writes the first record and moves the address to /d/<id> without losing the session", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await expect(page).toHaveURL(/#\/new\/flowchart$/);

  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  expect(await storedCount(page)).toBe(1);

  // The same session carries on: the node is still there and the change can be undone and redone.
  await expect(canvas.locator(".react-flow__node")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(canvas.locator(".react-flow__node")).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(canvas.locator(".react-flow__node")).toHaveCount(1);
  expect(await storedCount(page)).toBe(1);
});

test("an address that names no diagram type or C4 kind goes back to the start screen", async ({ page }) => {
  await page.goto("#/new/gantt");
  await expect(page).toHaveURL(/#\/$/);

  await page.goto("#/new/c4/system-landscape");
  await page.reload();
  await expect(page).toHaveURL(/#\/$/);
});
