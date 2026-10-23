import { expect, test } from "@playwright/test";
import { buildSmallDiagram, copiedSource, sourceView, type SourceType } from "./support/sourceView";

// VO-023 (FR-017, US3-AS1): in each diagram type the source view's text equals, character for character, the text Copy Source
// puts on the clipboard; it is set in the monospace face, shows keywords, quoted labels and arrows (the kinds its type has)
// in different colours, and typing into it changes nothing.

const TYPES: readonly SourceType[] = ["flowchart", "sequence", "c4"];
const FIRST_LINE: Readonly<Record<SourceType, string>> = { flowchart: "flowchart", sequence: "sequenceDiagram", c4: "C4Context" };
/** The kinds of run each type's source has: the editor writes no quoted labels in a sequence diagram and no arrows in a C4 one. */
const KINDS: Readonly<Record<SourceType, readonly string[]>> = { flowchart: ["keyword", "string", "operator"], sequence: ["keyword", "operator"], c4: ["keyword", "string"] };

for (const type of TYPES) {
  test(`the ${type} source view is the copied text, highlighted, monospace and read-only`, async ({ page }) => {
    await buildSmallDiagram(page, type);
    const view = await sourceView(page);
    await expect(view).toContainText(FIRST_LINE[type]);

    expect(await view.textContent(), "the view's text against the copied text").toBe(await copiedSource(page));
    expect(await view.evaluate((element) => getComputedStyle(element).fontFamily)).toContain("ui-monospace");

    const colourOf = (kind: string) => view.locator(`[data-kind="${kind}"]`).first().evaluate((element) => getComputedStyle(element).color);
    const kinds = KINDS[type];
    const colours = new Set<string>();
    for (const kind of kinds) {
      await expect(view.locator(`[data-kind="${kind}"]`).first(), `a ${kind} run in the ${type} source`).toBeVisible();
      colours.add(await colourOf(kind));
    }
    expect(colours.size, "each kind of run has its own colour").toBe(kinds.length);

    const before = await view.textContent();
    await view.click();
    await page.keyboard.type("typed text");
    expect(await view.textContent(), "typing into the source view").toBe(before);
    expect(await view.evaluate((element) => (element as HTMLElement).isContentEditable)).toBe(false);
  });
}
