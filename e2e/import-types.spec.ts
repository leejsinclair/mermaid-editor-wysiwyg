import { expect, test, type Page } from "@playwright/test";
import { sourceOf } from "./support/items";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-006 (FR-005, US1-AS5): a sequence document and a C4 document are imported and confirmed; the editor opens on a
// diagram of the detected type, holding every participant and message, or every element and relationship, in order.

const SEQUENCE = "sequenceDiagram\n  participant A as Alice\n  actor B\n  A->>B: Hi\n  B-->>A: Hello";
const CONTAINER = [
  "C4Container",
  "  title Shop",
  '  Person(user, "User")',
  '  System_Boundary(sys, "Shop") {',
  '    Container(web, "Web", "React", "UI")',
  "  }",
  '  Rel(user, web, "Browses", "HTTPS")',
].join("\n");

async function importText(page: Page, text: string): Promise<void> {
  await openImportWithPointer(page);
  await paste(page, text);
  await expect(importDialog(page).getByTestId("detected-type")).toBeVisible();
  await importDialog(page).getByRole("button", { name: "Import" }).click();
  await expect(page).toHaveURL(/#\/d\/[^/]+$/);
}

test("a sequence document opens in the editor with its participants and messages in order", async ({ page }) => {
  await importText(page, SEQUENCE);
  const source = await sourceOf(page);
  expect(source).toContain("sequenceDiagram");
  // The editor's normal form names participants by id (p1, p2) and keeps their labels and the order of the messages.
  const order = ["participant p1 as Alice", "actor p2 as B", "p1->>p2: Hi", "p2-->>p1: Hello"];
  const positions = order.map((line) => source.indexOf(line));
  positions.forEach((position) => {
    expect(position).toBeGreaterThan(-1);
  });
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
});

test("a C4 Container document opens in the editor with its elements, boundary and relationship", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, CONTAINER);
  await expect(importDialog(page).getByTestId("detected-type")).toHaveText("C4 Container");
  await importDialog(page).getByRole("button", { name: "Import" }).click();
  await expect(page).toHaveURL(/#\/d\/[^/]+$/);
  const source = await sourceOf(page);
  expect(source).toContain("C4Container");
  for (const fragment of ['Person(', '"User"', "System_Boundary(", 'Container(', '"Web"', '"React"', '"Browses"']) {
    expect(source).toContain(fragment);
  }
});
