import { expect, test } from "@playwright/test";

// VO-090 (DC-04): text from a file or from storage is data. Names and labels holding HTML, script tags and Mermaid
// directives appear literally on the canvas, in the list, in the source panel and in the preview, and no script runs.

const NAME = '<img src=x onerror="window.__pwned=1">';
const NODE = "<script>window.__pwned=1</script>";
const DIRECTIVE = '%%{init: {"securityLevel":"loose"}}%%';
const CONNECTION = '<b onmouseover="window.__pwned=1">bold</b>';

test("untrusted text is shown literally everywhere and nothing runs", async ({ page }) => {
  await page.goto("#/");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open file…" }).click();
  await (await chooser).setFiles("e2e/fixtures/untrusted.mermaid-editor.json");
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);

  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await expect(canvas.getByTestId("node-label").nth(0)).toHaveText(NODE);
  await expect(canvas.getByTestId("node-label").nth(1)).toHaveText(DIRECTIVE);
  await expect(canvas.getByTestId("connection-label")).toHaveText(CONNECTION);
  await expect(page.getByText(NAME, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Mermaid source" }).click();
  const source = page.getByRole("region", { name: "Mermaid source" });
  await expect(source).not.toContainText("<script>");
  await expect(source).not.toContainText("<img");
  await expect(source).not.toContainText("%%{init");

  await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();
  const drawing = page.getByRole("application", { name: "Diagram as drawn by Mermaid" });
  await expect(drawing).toContainText("window.__pwned=1");
  await expect(drawing).toContainText("securityLevel");
  await expect(drawing.locator("script, img[onerror], [onmouseover]")).toHaveCount(0);

  await page.goto("#/");
  await page.reload();
  await expect(page.getByRole("region", { name: "Saved diagrams" }).getByRole("link")).toHaveText(NAME);
  expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
});
