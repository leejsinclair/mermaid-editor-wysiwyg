import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";
import { buildSmallDiagram, type SourceType } from "./support/sourceView";

// VO-029 (FR-019, FR-024, US4-AS4): for a diagram of each type, the copied source, the copied Markdown and the saved file are the
// same in Blueprint Studio and in Light, and hold no theme and no init directive.

const TYPES: readonly SourceType[] = ["flowchart", "sequence", "c4"];

async function outputs(page: Page): Promise<{ file: string; source: string; markdown: string }> {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save file" }).click();
  const file = await readFile(await (await download).path(), "utf8");
  await page.getByRole("button", { name: "Copy Source" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("Source copied");
  const source = await readClipboard(page);
  await page.getByRole("button", { name: "Copy for Markdown" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("copied for Markdown");
  return { file, source, markdown: await readClipboard(page) };
}

for (const type of TYPES) {
  test(`a ${type} diagram's copied source, copied Markdown and saved file are the same in both appearances and carry no look`, async ({ page }) => {
    await buildSmallDiagram(page, type);
    const inBlueprint = await outputs(page);
    await page.getByRole("button", { name: "Light", exact: true }).click();
    const inLight = await outputs(page);

    expect(inLight).toEqual(inBlueprint);
    expect(inLight.markdown).toBe("```mermaid\n" + inLight.source + "\n```");
    for (const text of [inLight.source, inLight.markdown]) {
      expect(text).not.toContain("%%{");
      expect(text).not.toMatch(/theme|themeVariables|primaryColor/);
    }
    expect(inLight.file).not.toMatch(/theme|appearance|%%\{/i);
  });
}
