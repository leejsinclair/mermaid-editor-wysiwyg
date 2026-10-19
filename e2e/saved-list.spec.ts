import { expect, test } from "@playwright/test";
import { savedRecord, seedRecords } from "./support/storage";

// VO-074 (FR-044): the start screen lists saved diagrams, most recently changed first, with name, type (and C4 kind)
// and when they were last changed; it offers new diagrams, and says diagrams are kept only in this browser.

test("saved diagrams are listed most recently changed first with name, type, kind and time", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [
    savedRecord("a", "Oldest flow", "flowchart", "2026-03-01T09:00:00.000Z"),
    savedRecord("b", "Newest context", "c4", "2026-05-02T18:30:00.000Z", "context"),
    savedRecord("c", "Middle login", "sequence", "2026-04-15T12:00:00.000Z"),
    savedRecord("d", "Deployment map", "c4", "2026-04-01T08:00:00.000Z", "deployment"),
  ]);
  await page.reload();

  const list = page.getByRole("region", { name: "Saved diagrams" });
  const items = list.getByRole("listitem");
  await expect(items).toHaveCount(4);
  await expect(items.nth(0)).toContainText("Newest context");
  await expect(items.nth(0)).toContainText("C4 Context diagram");
  await expect(items.nth(1)).toContainText("Middle login");
  await expect(items.nth(1)).toContainText("Sequence diagram");
  await expect(items.nth(2)).toContainText("Deployment map");
  await expect(items.nth(2)).toContainText("C4 Deployment diagram");
  await expect(items.nth(3)).toContainText("Oldest flow");
  await expect(items.nth(3)).toContainText("Flowchart");
  await expect(items.nth(0).locator("time")).toHaveAttribute("datetime", "2026-05-02T18:30:00.000Z");
  await expect(items.nth(3).locator("time")).toHaveAttribute("datetime", "2026-03-01T09:00:00.000Z");
});

test("a diagram changed in the editor moves to the top of the list", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [savedRecord("old", "Seeded earlier", "flowchart", "2020-01-01T00:00:00.000Z")]);
  await page.goto("#/new/flowchart");
  await page.reload();
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(page.getByRole("region", { name: "Diagram canvas" }), { targetPosition: { x: 200, y: 100 } });
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  // The first save moves the address to the saved diagram's; leaving before that would be overtaken by it.
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);

  await page.goto("#/");
  await page.reload();

  const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText("Untitled flowchart");
  await expect(items.nth(1)).toContainText("Seeded earlier");
});

test("each saved diagram links to its own address", async ({ page }) => {
  await page.goto("#/");
  await seedRecords(page, [savedRecord("x1", "Open me", "flowchart", "2026-01-01T00:00:00.000Z")]);
  await page.reload();

  const link = page.getByRole("region", { name: "Saved diagrams" }).getByRole("link", { name: /Open me/ });

  await expect(link).toHaveAttribute("href", "#/d/x1");
});

test("new diagrams are offered, and the screen says diagrams are kept only in this browser", async ({ page }) => {
  await page.goto("#/");

  await expect(page.getByRole("region", { name: "New diagram" }).getByRole("button")).toHaveText(["Flowchart", "Sequence", "C4"]);
  await expect(page.getByText("Diagrams are kept only in this browser. Save files as a backup.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Saved diagrams" })).toContainText("No saved diagrams yet.");
});
