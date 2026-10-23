import { expect, test } from "@playwright/test";

// VO-008 (US1-AS1): with no stored appearance the start page shows the application name and draws its surfaces and text with the
// Blueprint Studio background (#071C30), panel (#0D2B45) and ivory text (#F1E9D7), in the interface's system sans-serif face.

test("the start page opens in Blueprint Studio when no appearance is stored", async ({ page }) => {
  await page.goto("#/");
  await expect(page.getByRole("heading", { name: "Mermaid diagram editor", level: 1 })).toBeVisible();

  const page_ = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { background: style.backgroundColor, text: style.color, face: style.fontFamily };
  });
  expect(page_.background).toBe("rgb(7, 28, 48)");
  expect(page_.text).toBe("rgb(241, 233, 215)");
  expect(page_.face).toContain("system-ui");

  const saved = page.getByRole("region", { name: "Saved diagrams" });
  await expect(saved).toHaveCSS("background-color", "rgb(13, 43, 69)");
  await expect(saved.getByRole("heading", { name: "Saved diagrams" })).toHaveCSS("color", "rgb(241, 233, 215)");
});
