import { expect, test, type Page } from "@playwright/test";
import { importDialog, openImportWithPointer, TEXT_LABEL } from "./support/import";

// VO-040 (FR-002, EC-08): a file that is not text, and a file over the size limit, are not loaded. The dialog says why, and
// the text and the outcome stay as they were.

const FILE_TEXT = ["flowchart TD", "  A[Start] --> B[End]"].join("\n");
const FIVE_MB = 5 * 1024 * 1024;

/** Drops one file onto the start screen's button, the drag events bubbling up from there. */
async function dropBytes(page: Page, name: string, bytes: { readonly kind: "text" | "binary" | "large"; readonly text?: string }): Promise<void> {
  const dataTransfer = await page.evaluateHandle(
    ({ fileName, spec, limit }) => {
      const transfer = new DataTransfer();
      let content: BlobPart;
      if (spec.kind === "text") content = spec.text ?? "";
      else if (spec.kind === "binary") content = new Uint8Array([0x89, 0x50, 0x00, 0x4e, 0xff, 0xfe]);
      else content = new Uint8Array(limit + 1).fill(97);
      transfer.items.add(new File([content], fileName, { type: "application/octet-stream" }));
      return transfer;
    },
    { fileName: name, spec: bytes, limit: FIVE_MB },
  );
  await page.locator("main").dispatchEvent("drop", { dataTransfer });
}

test("a binary file and a file over 5 MB are not loaded, the dialog says why, and the text is unchanged", async ({ page }) => {
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await dialog.getByRole("textbox", { name: TEXT_LABEL }).fill(FILE_TEXT);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/, { timeout: 1000 });
  const status = dialog.getByRole("status", { name: "Import status" });

  await dropBytes(page, "picture.png", { kind: "binary" });
  await expect(status).toContainText("This file is not text, so it was not loaded.", { timeout: 1000 });
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(FILE_TEXT);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/);

  await dropBytes(page, "huge.mmd", { kind: "large" });
  await expect(status).toContainText("This file is larger than 5 MB, so it was not loaded.", { timeout: 1000 });
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(FILE_TEXT);
  await expect(dialog.getByTestId("detected-type")).toHaveText(/Flowchart/);
});

// VO-019 (FR-009, US4-AS3, EC-06): a chosen file whose contents cannot be read gives a message; the earlier text and
// picture stay, and nothing is left unhandled (feature 006).
test("a chosen file that cannot be read is reported, and the earlier text and picture stay", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openImportWithPointer(page);
  const dialog = importDialog(page);
  await dialog.getByRole("textbox", { name: TEXT_LABEL }).fill(FILE_TEXT);
  await expect(dialog.getByTestId("picture-wrap")).toBeVisible({ timeout: 10000 });
  await page.evaluate(() => {
    window.addEventListener("unhandledrejection", (event) => {
      throw new Error(`unhandled: ${String(event.reason)}`);
    });
    File.prototype.arrayBuffer = () => Promise.reject(new DOMException("The requested file could not be read.", "NotReadableError"));
  });

  await dialog.locator('input[type="file"]').setInputFiles({ name: "gone.mmd", mimeType: "text/plain", buffer: Buffer.from("flowchart LR\n  X --> Y") });

  await expect(dialog.getByRole("status", { name: "Import status" })).toContainText("The file could not be read.");
  await expect(dialog.getByRole("textbox", { name: TEXT_LABEL })).toHaveValue(FILE_TEXT);
  await expect(dialog.getByTestId("picture-wrap")).toBeVisible();
  expect(errors).toEqual([]);
});
