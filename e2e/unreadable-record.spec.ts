import { expect, test } from "@playwright/test";
import { savedRecord, seedRecords } from "./support/storage";

// VO-088 (EC-11): a damaged stored record among good ones is listed "Cannot be read: <reason>", offers Delete… only,
// cannot be opened, and leaves the other diagrams opening normally. (Deleting is tested with T113.)

const damaged = {
  ...savedRecord("bad1", "Damaged diagram", "flowchart", "2026-04-01T00:00:00.000Z"),
  model: {
    name: "Damaged diagram",
    type: "flowchart",
    nextId: 6,
    content: {
      nodes: [{ id: 1, shape: "rectangle", label: "Only node", x: 0, y: 0 }],
      connections: [{ id: 3, from: 1, to: 99, line: "solid", ending: "arrow", label: "" }],
    },
  },
};

test("a damaged record is listed as unreadable with Delete… only, and the others still open", async ({ page }) => {
  await page.goto("/");
  await seedRecords(page, [
    savedRecord("good1", "Good flow", "flowchart", "2026-05-01T00:00:00.000Z"),
    damaged,
    { id: "junk", changedAt: "2026-03-01T00:00:00.000Z" },
  ]);
  await page.reload();

  const items = page.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem");
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toContainText("Good flow");
  await expect(items.nth(0).getByRole("link")).toHaveAttribute("href", "/d/good1");

  const unreadable = items.filter({ hasText: "Cannot be read" });
  await expect(unreadable).toHaveCount(2);
  await expect(unreadable.first()).toContainText("Damaged diagram");
  await expect(unreadable.first()).toContainText("Cannot be read: Connection 3 refers to a node that does not exist");
  await expect(unreadable.last()).toContainText("Cannot be read: the saved record is incomplete");
  await expect(unreadable.getByRole("link")).toHaveCount(0);
  await expect(unreadable.getByRole("button")).toHaveText(["Delete…", "Delete…"]);

  await items.nth(0).getByRole("link").click();
  await expect(page.getByRole("region", { name: "Diagram canvas" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
});

test("an unreadable record cannot be opened by its address", async ({ page }) => {
  await page.goto("/");
  await seedRecords(page, [damaged]);

  await page.goto("/d/bad1");

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("region", { name: "Diagram canvas" })).toHaveCount(0);
});
