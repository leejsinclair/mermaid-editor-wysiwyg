import type { Locator, Page } from "@playwright/test";

// What a canvas draws as its grid, read from the page: the flowchart's two background layers (their pattern sizes and line colours),
// or the two gradients on the scrolling area of a sequence or C4 canvas (their sizes and colours).

export interface GridLayer {
  readonly size: number;
  readonly colour: string;
}

export interface Grid {
  readonly minor?: GridLayer;
  readonly major?: GridLayer;
}

export const canvasRegion = (page: Page): Locator => page.getByRole("region", { name: "Diagram canvas" });

export function readGrid(region: Locator): Promise<Grid> {
  return region.evaluate((element) => {
    const layers: { size: number; colour: string }[] = [];
    for (const svg of element.querySelectorAll("svg.react-flow__background")) {
      const pattern = svg.querySelector("pattern");
      const line = svg.querySelector("pattern path");
      if (pattern && line) layers.push({ size: Number.parseFloat(pattern.getAttribute("width") ?? "0"), colour: getComputedStyle(line).stroke });
    }
    if (layers.length === 0) {
      const scroller = [...element.querySelectorAll("div")].find((candidate) => getComputedStyle(candidate).overflow === "auto");
      if (scroller) {
        const style = getComputedStyle(scroller);
        const sizes = style.backgroundSize.split(", ").map((part) => Number.parseFloat(part));
        // A computed `transparent` is also written rgba(0, 0, 0, 0): only the line colours count.
        const colours = (style.backgroundImage.match(/rgba?\([^)]*\)/g) ?? []).filter((colour) => colour !== "rgba(0, 0, 0, 0)");
        for (const wanted of new Set(sizes)) {
          const at = sizes.indexOf(wanted);
          layers.push({ size: wanted, colour: colours.at(at) ?? "" });
        }
      }
    }
    layers.sort((a, b) => a.size - b.size);
    const [minor, major] = layers.length === 2 ? layers : [undefined, layers.at(0)];
    return { ...(minor && { minor }), ...(major && { major }) };
  });
}

/** The opacity of an `rgba(r, g, b, a)` colour, 1 for one without alpha. */
export function alphaOf(colour: string): number {
  const parts = /rgba?\(([^)]*)\)/.exec(colour)?.[1]?.split(",") ?? [];
  return parts.length === 4 ? Number.parseFloat(parts[3] ?? "1") : 1;
}

export interface GridFrame {
  /** Pixels between major lines now. */
  readonly gap: number;
  /** How far the shape's left and top edges are past the nearest major line to their left and above, in pixels. */
  readonly x: number;
  readonly y: number;
  /** Whether a minor grid is drawn. */
  readonly hasMinor: boolean;
}

/** Where a shape sits against the major grid lines, read from the page (the flowchart's pattern offsets or a scrolling area's origin). */
export async function frameOf(region: Locator, shape: Locator): Promise<GridFrame> {
  const box = await shape.boundingBox();
  if (!box) throw new Error("The shape must be on screen");
  return region.evaluate((element, at) => {
    const mod = (value: number, gap: number): number => ((value % gap) + gap) % gap;
    const widthOf = (svg: Element): number => Number.parseFloat(svg.querySelector("pattern")?.getAttribute("width") ?? "0");
    const backgrounds = [...element.querySelectorAll("svg.react-flow__background")].sort((first, second) => widthOf(second) - widthOf(first));
    const majorBackground = backgrounds.at(0);
    const layers = backgrounds.map(widthOf);
    if (majorBackground) {
      const pattern = majorBackground.querySelector("pattern");
      const gap = Number.parseFloat(pattern?.getAttribute("width") ?? "0");
      const rect = majorBackground.getBoundingClientRect();
      const px = Number.parseFloat(pattern?.getAttribute("x") ?? "0");
      const py = Number.parseFloat(pattern?.getAttribute("y") ?? "0");
      return { gap, x: mod(at.x - (rect.x + px), gap), y: mod(at.y - (rect.y + py), gap), hasMinor: layers.length === 2 };
    }
    const scroller = [...element.querySelectorAll("div")].find((candidate) => getComputedStyle(candidate).overflow === "auto");
    if (!scroller) throw new Error("No scrolling area");
    const sizes = getComputedStyle(scroller).backgroundSize.split(", ").map((part) => Number.parseFloat(part));
    const gap = sizes.at(0) ?? 0;
    const rect = scroller.getBoundingClientRect();
    return { gap, x: mod(at.x - (rect.x - scroller.scrollLeft), gap), y: mod(at.y - (rect.y - scroller.scrollTop), gap), hasMinor: new Set(sizes).size === 2 };
  }, box);
}
