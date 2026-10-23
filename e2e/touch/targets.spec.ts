import { expect, test, type Page } from "@playwright/test";
import { openWithItem, tap, toggleTools, type DiagramKind } from "./support";

// VO-039 (FR-027): on the emulated phones every button, menu item, toggle and toolbox item in each diagram type's editor is at least
// 24 x 24 CSS px, and every connection handle's hit area is at least 28 px.

const KINDS: readonly DiagramKind[] = ["flowchart", "sequence", "c4"];
const CONTROLS = 'button, [role="button"][aria-label*="handle" i], [role="menuitem"], [role="radio"], [role="switch"], [role="tab"], a[href], input, select, textarea';
const HANDLES = '[data-zone="connect"]';

interface Small {
  readonly what: string;
  readonly width: number;
  readonly height: number;
}

/** Every visible control of the editor outside the drawing itself, and every connection handle, that is under its size. */
function tooSmall(page: Page): Promise<Small[]> {
  return page.evaluate(
    ({ controls, handles }) => {
      const found: { what: string; width: number; height: number }[] = [];
      const drawing = document.querySelector('[role="region"][aria-label="Diagram canvas"]');
      const visible = (box: DOMRect): boolean => box.width > 0 && box.height > 0;
      for (const element of document.querySelectorAll(controls)) {
        if (drawing?.contains(element) && !element.matches(handles)) continue;
        if (element.matches(handles)) continue;
        const box = element.getBoundingClientRect();
        if (!visible(box)) continue;
        if (box.width < 24 || box.height < 24) found.push({ what: `${element.tagName.toLowerCase()} "${element.getAttribute("aria-label") ?? element.textContent.trim().slice(0, 30)}"`, width: box.width, height: box.height });
      }
      for (const handle of document.querySelectorAll(handles)) {
        const box = handle.getBoundingClientRect();
        if (visible(box) && (box.width < 28 || box.height < 28)) found.push({ what: `connection handle ${handle.getAttribute("data-side") ?? ""}`, width: box.width, height: box.height });
      }
      return found;
    },
    { controls: CONTROLS, handles: HANDLES },
  );
}

for (const kind of KINDS) {
  test(`every control and handle of a ${kind} editor is big enough to touch`, async ({ page }) => {
    const item = await openWithItem(page, kind);
    await tap(page, kind === "sequence" ? item.getByTestId("participant-header") : item);
    expect(await tooSmall(page), "with the canvas and an item selected").toEqual([]);

    await toggleTools(page);
    expect(await tooSmall(page), "with the Tools panel open").toEqual([]);
    await toggleTools(page);

    await tap(page, page.getByRole("button", { name: "More actions", exact: true }));
    await expect(page.getByRole("menuitem").first()).toBeVisible();
    expect(await tooSmall(page), "with the More actions menu open").toEqual([]);
  });
}
