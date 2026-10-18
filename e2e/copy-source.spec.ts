import { expect, test, type Page } from "@playwright/test";
import { readClipboard } from "./support/clipboard";

// VO-008: Copy Source is refused without a clipboard write while the source is being checked, and after a valid
// result the clipboard holds exactly the current source, with success shown only once the copy has completed.

async function putOnClipboard(page: Page, text: string) {
  await page.evaluate((value) => {
    const field = document.createElement("textarea");
    field.id = "scratch-sentinel";
    field.value = value;
    document.body.append(field);
    field.select();
  }, text);
  await page.keyboard.press("ControlOrMeta+C");
  await page.evaluate(() => {
    document.querySelector("#scratch-sentinel")?.remove();
  });
}

test("Copy Source is refused while the source is checked, then copies exactly the source once it is valid", async ({
  page,
}) => {
  // Hold Mermaid's parser back so the source stays in the checking state until released.
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/.vite/deps/mermaid*", async (route) => {
    if (route.request().resourceType() === "script") await held;
    await route.continue();
  });

  await page.goto("/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  await putOnClipboard(page, "sentinel");
  const messages = page.getByRole("status", { name: "Messages" });

  await page.getByRole("button", { name: "Copy Source" }).click();

  await expect(messages).toContainText("The source is still being checked");
  await expect(messages).not.toContainText("copied");
  expect(await readClipboard(page)).toBe("sentinel");

  release();
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await page.getByRole("button", { name: "Copy Source" }).click();

  await expect(messages).toContainText("Source copied");
  expect(await readClipboard(page)).toBe('flowchart TD\n  n1["Rectangle"]');
});
