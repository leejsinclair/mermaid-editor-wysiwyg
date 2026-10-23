import { expect, test, type Locator, type Page } from "@playwright/test";

// VO-012 (FR-021, FR-022, US1-AS5, EC-10): a control looks different at rest, hovered, focused from the keyboard (with a 3 px ring),
// pressed and disabled; transitions last at most 200 ms and nothing animates while the page is idle; with reduced motion requested
// every transition lasts 0 s; success feedback is drawn with the success colour, an error with the error colour and a warning with
// the warning colour (amber), each with its words.

const PROPERTIES = ["background-color", "color", "outline-color", "outline-width", "border-color", "box-shadow"];

async function look(control: Locator): Promise<string> {
  return control.evaluate((element, properties) => {
    const style = getComputedStyle(element);
    return properties.map((property) => `${property}: ${style.getPropertyValue(property)}`).join("; ");
  }, PROPERTIES);
}

const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Diagram actions" });

test("a control has a distinct look at rest, hovered, focused from the keyboard, pressed and disabled", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const zoomIn = toolbar(page).getByRole("button", { name: "Zoom in" });
  const disabled = toolbar(page).getByRole("button", { name: "Undo", exact: true });
  await expect(disabled).toBeDisabled();

  await page.mouse.move(2, 2);
  const rest = await look(zoomIn);

  await zoomIn.hover();
  await expect.poll(() => look(zoomIn)).not.toBe(rest);
  const hovered = await look(zoomIn);

  await page.mouse.down();
  await expect.poll(() => look(zoomIn)).not.toBe(hovered);
  const pressed = await look(zoomIn);
  await page.mouse.move(2, 2);
  await page.mouse.up();

  await toolbar(page).getByRole("button", { name: "Save file" }).focus();
  await page.keyboard.press("Tab");
  await expect(zoomIn).toBeFocused();
  await expect.poll(() => zoomIn.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe("3px");
  expect(await zoomIn.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
  const focused = await look(zoomIn);

  const looks = new Set([rest, hovered, pressed, focused, await look(disabled)]);
  expect(looks.size, "rest, hover, pressed, focus and disabled each look different").toBe(5);

  const pressedButton = page.getByRole("button", { name: "Blueprint Studio", exact: true });
  const otherButton = page.getByRole("button", { name: "Light", exact: true });
  await page.mouse.move(2, 2);
  expect(await look(pressedButton)).not.toBe(await look(otherButton));
});

const longestTransitionMs = (page: Page): Promise<number> =>
  page.evaluate(() => {
    let longest = 0;
    for (const element of document.querySelectorAll("*")) {
      for (const part of getComputedStyle(element).transitionDuration.split(",")) {
        const value = Number.parseFloat(part);
        longest = Math.max(longest, part.trim().endsWith("ms") ? value : value * 1000);
      }
    }
    return longest;
  });

test("transitions are short and nothing animates while the page is idle", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await page.mouse.move(2, 2);
  await expect.poll(() => page.evaluate(() => document.getAnimations().length), { message: "running animations while idle" }).toBe(0);
  expect(await longestTransitionMs(page)).toBeLessThanOrEqual(200);
});

test("with reduced motion requested every transition lasts 0 s", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#/new/flowchart");
  await toolbar(page).getByRole("button", { name: "Zoom in" }).hover();
  expect(await longestTransitionMs(page)).toBe(0);
});

const alertColour = (page: Page): Promise<string> =>
  page.getByRole("status", { name: "Messages" }).locator(".MuiAlert-root").evaluate((element) => getComputedStyle(element).borderLeftColor);

test("a success is drawn with the success colour and its words", async ({ page }) => {
  await page.goto("#/new/flowchart");
  await toolbar(page).getByRole("button", { name: "Save file" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("The file was offered for download.");
  expect(await alertColour(page)).toBe("rgb(127, 216, 166)");
});

test("an error is drawn with the error colour and its words", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException("Write denied", "NotAllowedError")) },
    });
  });
  await page.goto("#/new/flowchart");
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
  await expect(page.getByRole("button", { name: /Mermaid source/ })).toContainText("Valid");
  await toolbar(page).getByRole("button", { name: "Copy Source" }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("could not be copied");
  expect(await alertColour(page)).toBe("rgb(255, 138, 128)");
});

test("a warning is drawn with the amber warning colour and its words", async ({ page }) => {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- the original is called back with the storage as `this` below
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key === "mermaid-editor.appearance") throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.goto("#/new/flowchart");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.getByRole("status", { name: "Messages" })).toContainText("could not be saved for next time");
  expect(await alertColour(page)).toBe("rgb(138, 83, 0)");
});
