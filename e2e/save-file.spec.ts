import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { addShape } from "./support/flowchart";

// VO-080 (FR-047): Save file downloads the diagram in the editor's format with a format version, named after the
// diagram with unsafe characters replaced; the message says it was offered for download and never that it was stored.

interface SavedFile {
  format: string;
  formatVersion: number;
  diagram: { name: string; type: string; content: { nodes: unknown[] } };
}

async function renameTo(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "Rename diagram" }).click();
  const field = page.getByRole("textbox", { name: "Diagram name" });
  await field.fill(name);
  await field.press("Enter");
}

test("Save file downloads the diagram in the editor's format, named after it", async ({ page }) => {
  await page.goto("/new/flowchart");
  await addShape(page, page.getByRole("region", { name: "Diagram canvas" }), "Rectangle", { x: 200, y: 100 });
  await renameTo(page, "Order flow");

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();
  const file = await download;

  expect(file.suggestedFilename()).toBe("Order flow.mermaid-editor.json");
  const saved = JSON.parse(await readFile((await file.path()), "utf8")) as SavedFile;
  expect(saved.format).toBe("mermaid-editor-wysiwyg");
  expect(saved.formatVersion).toBe(1);
  expect(saved.diagram.name).toBe("Order flow");
  expect(saved.diagram.type).toBe("flowchart");
  expect(saved.diagram.content.nodes).toHaveLength(1);
  const messages = page.getByRole("status", { name: "Messages" });
  await expect(messages).toContainText("The file was offered for download.");
  await expect(messages).not.toContainText(/stored|saved in/i);
});

test("unsafe characters in the name are replaced in the file name", async ({ page }) => {
  await page.goto("/new/flowchart");
  await renameTo(page, 'a/b\\c:d*e?"f<g>h|i');

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();

  expect((await download).suggestedFilename()).toBe("a_b_c_d_e__f_g_h_i.mermaid-editor.json");
});
