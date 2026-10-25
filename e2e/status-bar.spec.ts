import { expect, test, type Page } from "@playwright/test";
import { settleNewShape } from "./support/flowchart";

// VO-031 (FR-008): in each diagram type the status area shows "Zoom n%", which follows the zoom buttons (and the mouse wheel on a
// flowchart), the "Save status" region with its texts after an edit, and the source check text; it has no grid or snap control.

const CASES = [
  { type: "flowchart", address: "#/new/flowchart", add: "Rectangle" },
  { type: "sequence diagram", address: "#/new/sequence", add: "Participant" },
  { type: "C4 diagram", address: "#/new/c4/context", add: "Person" },
] as const;

const status = (page: Page) => page.getByRole("region", { name: "Editor status" });
const zoomOf = async (page: Page): Promise<number> => {
  const text = (await status(page).textContent()) ?? "";
  return Number(/Zoom (\d+)%/.exec(text)?.[1] ?? Number.NaN);
};
const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });

for (const { type, address, add } of CASES) {
  test(`the status area of a ${type} shows the zoom, the save status and the source check`, async ({ page }) => {
    await page.goto(address);
    await expect(status(page)).toContainText("Zoom 100%");
    await expect(status(page).getByRole("status", { name: "Save status" })).toHaveText("Not saved yet");

    await toolbar(page).getByRole("button", { name: "Zoom in" }).click();
    await expect.poll(() => zoomOf(page)).toBeGreaterThan(100);
    const zoomedIn = await zoomOf(page);
    await toolbar(page).getByRole("button", { name: "Zoom out" }).click();
    await expect.poll(() => zoomOf(page)).toBeLessThan(zoomedIn);
    await toolbar(page).getByRole("button", { name: "Fit to view" }).click();
    await expect.poll(() => zoomOf(page)).not.toBeNaN();

    await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }).click();
    await expect(status(page).getByRole("status", { name: "Save status" })).toHaveText("Saved");
    await expect(status(page)).toContainText(/Valid|Checking/);
    await expect(status(page).getByRole("button", { name: /grid|snap/i })).toHaveCount(0);
    await expect(status(page).getByRole("checkbox", { name: /grid|snap/i })).toHaveCount(0);
  });
}

test("the mouse wheel on a flowchart changes the zoom shown", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await settleNewShape(page);
  const before = await zoomOf(page);
  const canvas = await page.getByRole("region", { name: "Diagram canvas" }).boundingBox();
  if (!canvas) throw new Error("no canvas");
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => zoomOf(page)).toBeGreaterThan(before);
});
