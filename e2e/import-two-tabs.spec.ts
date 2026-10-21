import { expect, test } from "@playwright/test";
import { importDialog, paste, START_BUTTON, TEXT_LABEL } from "./support/import";

// VO-053 (EC-11): the dialog is open in two tabs with the same text. Confirming in one creates one diagram, opened in that
// tab; the other tab's dialog and its text are unaffected.

const TYPED = ["flowchart TD", "  A[Shared] --> B[Text]"].join("\n");

test("confirming in one tab creates one diagram; the other tab's dialog and text are unaffected", async ({ context }) => {
  const first = await context.newPage();
  await first.goto("#/");
  await first.getByRole("button", { name: START_BUTTON }).click();
  await paste(first, TYPED);
  await expect(importDialog(first).getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  const second = await context.newPage();
  await second.goto("#/");
  await second.getByRole("button", { name: START_BUTTON }).click();
  await paste(second, TYPED);
  await expect(importDialog(second).getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });

  await importDialog(first).getByRole("button", { name: "Import" }).click();
  await expect(first).toHaveURL(/#\/d\//, { timeout: 2000 });

  await expect(importDialog(second)).toBeVisible();
  await expect(importDialog(second).getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(TYPED);

  await first.goto("#/");
  await expect(first.getByRole("region", { name: "Saved diagrams" }).getByRole("listitem")).toHaveCount(1, { timeout: 2000 });
});
