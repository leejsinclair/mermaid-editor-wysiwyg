import { expect, test, type Page } from "@playwright/test";

// VO-007 (FR-018, FR-004, US3-AS3): the source check status is drawn with the warning colour (amber) for a notice and the success
// colour for a valid source, each with its words, in both appearances.

const COLOURS = [
  { appearance: "Blueprint Studio", warning: "rgb(232, 173, 99)", success: "rgb(127, 216, 166)" },
  { appearance: "Light", warning: "rgb(138, 83, 0)", success: "rgb(46, 125, 50)" },
] as const;

const summary = (page: Page) => page.getByRole("button", { name: /Mermaid source/ });

test("a notice is drawn in the warning colour and a valid source in the success colour, in both appearances", async ({ context }) => {
  for (const { appearance, warning, success } of COLOURS) {
    const empty = await context.newPage();
    await empty.goto("#/new/c4/context");
    await empty.getByRole("button", { name: appearance, exact: true }).click();
    await expect(summary(empty).getByText("Valid except for a notice")).toHaveCSS("color", warning);
    await empty.close();

    const valid = await context.newPage();
    await valid.goto("#/new/flowchart");
    await valid.getByRole("button", { name: appearance, exact: true }).click();
    await valid.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Rectangle", exact: true }).click();
    await expect(summary(valid).getByText("Valid", { exact: true })).toHaveCSS("color", success);
    await valid.close();
  }
});
