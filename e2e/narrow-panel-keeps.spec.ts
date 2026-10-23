import { expect, test } from "@playwright/test";

// VO-034 (US5-AS2): at 800 px, opening the tools panel, typing a label draft in Properties and closing the panel leaves the
// selection and the draft text in place, and the canvas's zoom and position unchanged.

test.use({ viewport: { width: 800, height: 900 } });

test("opening and closing the tools panel keeps the selection, the draft and the view", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const tools = page.getByRole("button", { name: "Tools", exact: true });
  await tools.click();
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await tools.click();
  const node = page.locator(".react-flow__node").first();
  await node.click();
  await expect(node).toHaveClass(/selected/);

  await page.getByRole("button", { name: "Zoom in" }).click();
  const viewport = page.locator(".react-flow__viewport");
  await expect.poll(async () => viewport.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  const settled = async () => {
    let previous = "";
    await expect
      .poll(async () => {
        const now = await viewport.evaluate((element) => element.getAttribute("style") ?? "");
        const same = now === previous;
        previous = now;
        return same;
      }, { intervals: [150] })
      .toBe(true);
    return previous;
  };
  const viewBefore = await settled();
  const zoomBefore = await page.getByRole("region", { name: "Editor status" }).textContent();

  await tools.click();
  const label = page.getByRole("region", { name: "Properties" }).getByRole("textbox", { name: "Label" });
  await label.fill("Draft label");
  await tools.click();
  await expect(page.getByRole("region", { name: "Properties" })).toBeHidden();

  await expect(node).toHaveClass(/selected/);
  await tools.click();
  await expect(label).toHaveValue("Draft label");
  await tools.click();
  expect(await settled(), "the canvas's position and zoom").toBe(viewBefore);
  expect(await page.getByRole("region", { name: "Editor status" }).textContent()).toBe(zoomBefore);
});
