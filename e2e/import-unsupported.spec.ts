import { expect, test } from "@playwright/test";
import { importDialog, openImportWithPointer, paste } from "./support/import";

// VO-015 (FR-004, US3-AS3): a valid class diagram says the type is not supported and lists the supported types. It shows no
// picture, and Import stays disabled.

const CLASS_DIAGRAM = ["classDiagram", "  class Animal", "  Animal : +int age"].join("\n");

test("a class diagram says its type is unsupported, shows no picture and disables Import", async ({ page }) => {
  await openImportWithPointer(page);
  await paste(page, CLASS_DIAGRAM);
  const dialog = importDialog(page);

  await expect(dialog.getByRole("status", { name: "Import status" })).toContainText(
    "This looks like a classDiagram. The editor supports flowcharts, sequence diagrams and C4 diagrams (context, container, component, dynamic, deployment).",
    { timeout: 1000 },
  );
  await expect(dialog.getByRole("region", { name: "Preview" }).locator("img, svg")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled();
});
