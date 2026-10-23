import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { sourceView } from "../support/sourceView";
import { tap, toggleTools } from "./support";

// VO-038 (FR-027, US5-AS4, SC-009): on the emulated phones a diagram is saved to a file through "More actions" (a download is
// offered), reopened from that file through the start page with the same content, copied as source and as Markdown (the message
// reads success only when the clipboard holds the text, and otherwise the failure), and the appearance is switched by tap.

interface SavedFile {
  format: string;
  diagram: { name: string; type: string; content: { nodes: unknown[] } };
}

async function fromMenu(page: Page, item: string): Promise<void> {
  await tap(page, page.getByRole("button", { name: "More actions", exact: true }));
  await tap(page, page.getByRole("menuitem", { name: item, exact: true }));
  // The menu fades out before the next tap can reach the toolbar behind it.
  await page.locator("#more-actions-menu").waitFor({ state: "detached" });
}

/** The text on the clipboard, or `null` when this browser refuses to let the page read it. */
async function clipboardText(page: Page): Promise<string | null> {
  return page.evaluate(() => navigator.clipboard.readText().catch(() => null));
}

test("a diagram is saved, reopened, copied and switched in appearance by touch", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await toggleTools(page);
  await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }));
  await toggleTools(page);
  await expect(page.locator(".react-flow__node")).toHaveCount(1);
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
  const source = ((await (await sourceView(page)).textContent()) ?? "").trim();
  const messages = page.getByRole("status", { name: "Messages" });

  const download = page.waitForEvent("download");
  await fromMenu(page, "Save file");
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.mermaid-editor\.json$/);
  await expect(messages).toContainText("The file was offered for download.");
  const saved = JSON.parse(await readFile(await file.path(), "utf8")) as SavedFile;
  expect(saved.format).toBe("mermaid-editor-wysiwyg");
  expect(saved.diagram.content.nodes).toHaveLength(1);

  // Each copy says it worked only when the text is on the clipboard; where the browser will not let the page read it back, the
  // failure message is the only honest outcome of a refused write, so the message is held to what the clipboard shows.
  for (const [item, expected] of [
    ["Copy Source", source],
    ["Copy for Markdown", `\`\`\`mermaid\n${source}\n\`\`\``],
  ] as const) {
    await page.evaluate(() => navigator.clipboard.writeText("before").catch(() => undefined));
    await fromMenu(page, item);
    const copied = await clipboardText(page);
    if (copied === expected) await expect(messages, `${item} reports success`).toContainText(/copied/i);
    else await expect(messages, `${item} reports the failure`).toContainText("could not be copied");
    await expect(messages).not.toContainText(copied === expected ? "could not be copied" : /^(Source|Markdown) copied/);
  }

  await tap(page, page.getByRole("group", { name: "Appearance" }).getByRole("button", { name: "Light", exact: true }));
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "light");
  await tap(page, page.getByRole("group", { name: "Appearance" }).getByRole("button", { name: "Blueprint Studio", exact: true }));
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "blueprint");

  await page.goto("#/");
  await page.reload();
  const chooser = page.waitForEvent("filechooser");
  await tap(page, page.getByRole("button", { name: "Open file…" }));
  await (await chooser).setFiles(await file.path());
  await expect(page).toHaveURL(/#\/d\/[\w-]+$/);
  await expect(page.locator(".react-flow__node")).toHaveCount(1);
  expect(((await (await sourceView(page)).textContent()) ?? "").trim(), "the reopened diagram has the same content").toBe(source);
});
