import { expect, test, type Request } from "@playwright/test";

// VO-005 (FR-003, FR-025, SC-008): using the editor and switching between the appearances makes no request to another origin and
// fetches no font; interface text is set in the system sans-serif stack and source text in the system monospace stack.

test("the editor fetches no font and no other origin's file, and sets text in the system faces", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", (request) => requests.push(request));
  await page.goto("#/new/flowchart");
  const origin = new URL(page.url()).origin;
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await page.getByRole("button", { name: /Mermaid source/ }).click();
  const source = page.getByRole("region", { name: /Mermaid source/ }).locator("pre");
  await expect(source).toContainText("flowchart");

  const faceOf = (text: ReturnType<typeof page.getByText>) => text.evaluate((element) => getComputedStyle(element).fontFamily);
  for (const appearance of ["Light", "Blueprint Studio", "Light", "Blueprint Studio"]) {
    await page.getByRole("button", { name: appearance, exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-appearance", appearance === "Light" ? "light" : "blueprint");
    expect(await faceOf(page.getByText("Mermaid diagram editor", { exact: true }))).toContain("system-ui");
    expect(await source.evaluate((element) => getComputedStyle(element).fontFamily)).toContain("ui-monospace");
  }

  expect(requests.filter((request) => !request.url().startsWith(origin)).map((request) => request.url())).toEqual([]);
  expect(requests.filter((request) => request.resourceType() === "font").map((request) => request.url())).toEqual([]);
});
