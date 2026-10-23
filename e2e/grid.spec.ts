import { expect, test } from "@playwright/test";
import { alphaOf, canvasRegion, readGrid } from "./support/grid";

// VO-016 (FR-011, US2-AS1): on each diagram type's canvas at zoom 1, in Blueprint Studio and in Light, a minor grid is drawn every
// 16 px and a major grid every 80 px, in the appearance's grid colours on its canvas surface, the major more opaque than the minor.

const APPEARANCES = [
  { name: "Blueprint Studio", surface: "rgb(7, 28, 48)", minor: "rgba(114, 215, 242, 0.08)", major: "rgba(114, 215, 242, 0.18)" },
  { name: "Light", surface: "rgb(255, 255, 255)", minor: "rgba(21, 101, 192, 0.06)", major: "rgba(21, 101, 192, 0.14)" },
] as const;

const CASES = [
  { type: "flowchart", address: "#/new/flowchart" },
  { type: "sequence diagram", address: "#/new/sequence" },
  { type: "C4 diagram", address: "#/new/c4/context" },
] as const;

for (const { type, address } of CASES) {
  test(`a ${type} draws a 16 px minor and an 80 px major grid in each appearance's grid colours`, async ({ page }) => {
    await page.goto(address);
    await expect(page.getByRole("region", { name: "Editor status" })).toContainText("Zoom 100%");
    for (const appearance of APPEARANCES) {
      await page.getByRole("button", { name: appearance.name, exact: true }).click();
      await expect(canvasRegion(page)).toHaveCSS("background-color", appearance.surface);
      const grid = await readGrid(canvasRegion(page));
      expect(grid.minor?.size, `${appearance.name} minor spacing`).toBe(16);
      expect(grid.major?.size, `${appearance.name} major spacing`).toBe(80);
      expect(grid.minor?.colour, `${appearance.name} minor colour`).toBe(appearance.minor);
      expect(grid.major?.colour, `${appearance.name} major colour`).toBe(appearance.major);
      expect(alphaOf(grid.major?.colour ?? "")).toBeGreaterThan(alphaOf(grid.minor?.colour ?? ""));
    }
  });
}
