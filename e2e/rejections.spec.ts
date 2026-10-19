import { expect, test } from "@playwright/test";
import { addMessage, addParticipants, canvas as sequenceCanvas, messageTexts, relabel } from "./support/sequence";

// VO-025 (FR-009): a refused change is explained where it can be seen and heard, and nothing changes.
// A blank node label, and blank message text in a sequence diagram.

test("confirming a blank node label is refused with an announced explanation and changes nothing", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  const node = canvas.locator(".react-flow__node").first();
  await node.click();
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });

  await label.fill("   ");
  await page.keyboard.press("Enter");

  const messages = page.getByRole("status", { name: "Messages" });
  await expect(messages).toContainText("A label needs at least one visible character. The previous label was kept.");
  await expect(messages).toBeVisible();
  await expect(node.getByTestId("node-label")).toHaveText("Rectangle");
  await expect(label).toHaveValue("Rectangle");
  await page.getByRole("button", { name: /Mermaid source/ }).click();
  await expect(page.getByRole("region", { name: /Mermaid source/ })).toHaveText(/^flowchart TD\s+n1\["Rectangle"\]$/);
});

test("confirming blank message text is refused with an announced explanation and keeps the previous text", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  await addMessage(page, "Solid arrow", "A", "B");
  await relabel(page, sequenceCanvas(page).getByTestId("message").first(), "Hello");
  expect(await messageTexts(page)).toEqual(["Hello"]);
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });

  await label.fill("  \n ");
  await page.keyboard.press("Enter");

  const messages = page.getByRole("status", { name: "Messages" });
  await expect(messages).toContainText("A message needs text with at least one visible character. The previous text was kept.");
  expect(await messageTexts(page)).toEqual(["Hello"]);
  await expect(label).toHaveValue("Hello");
});

test("a message cannot be added with blank text, because it starts with its type's name", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"]);
  await addMessage(page, "Dashed cross", "A", "A");

  expect(await messageTexts(page)).toEqual(["Dashed cross"]);
});
