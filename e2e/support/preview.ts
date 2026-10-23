import { expect, type Page } from "@playwright/test";
import { addShape, connect } from "./flowchart";

export const SHAPES = ["Rectangle", "Rounded rectangle", "Stadium", "Diamond", "Circle", "Parallelogram", "Cylinder", "Subroutine", "Hexagon"] as const;

export const previewRegion = (page: Page) => page.getByRole("region", { name: "Preview as Mermaid draws it" });

/** A flowchart with every node shape and one connection, with the Mermaid preview open. */
export async function openPreviewOfEveryShape(page: Page): Promise<void> {
  await page.goto("#/new/flowchart");
  const toolbox = page.getByRole("region", { name: "Toolbox" });
  for (const shape of SHAPES.slice(0, 7)) await toolbox.getByRole("button", { name: shape, exact: true }).click();
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Hexagon", { x: 150, y: 120 });
  await addShape(page, canvas, "Circle", { x: 480, y: 120 });
  const nodes = canvas.locator(".react-flow__node");
  await expect(nodes).toHaveCount(9);
  await connect(page, canvas, nodes.nth(7), nodes.nth(8), 1);
  await page.getByRole("button", { name: "Preview as Mermaid draws it" }).click();
  await expect(previewRegion(page).locator("svg g.node")).toHaveCount(9);
}

export interface Drawn {
  readonly nodes: readonly { readonly outline: string; readonly fill: string; readonly stroke: string; readonly label: string }[];
  readonly edge: string;
  readonly surface: string;
}

/** What Mermaid's drawing in the preview looks like: each node's outline element kinds, fill, stroke and label colour, and the line colour. */
export function readDrawing(page: Page): Promise<Drawn> {
  return previewRegion(page).evaluate((region) => {
    const shapeOf = (node: Element): Element | undefined => [...node.querySelectorAll("rect, path, polygon, circle, ellipse")].find((element) => element.closest("foreignObject") === null && element.closest("marker") === null);
    const nodes = [...region.querySelectorAll("svg g.node")].map((node) => {
      const shape = shapeOf(node);
      const label = node.querySelector(".nodeLabel, .label span, text");
      const outline = [...node.querySelectorAll("rect, path, polygon, circle, ellipse")].filter((element) => element.closest("foreignObject") === null).map((element) => element.tagName).join(",");
      const style = shape ? getComputedStyle(shape) : undefined;
      return { outline, fill: style?.fill ?? "", stroke: style?.stroke ?? "", label: label ? getComputedStyle(label).color : "" };
    });
    const edge = region.querySelector("svg path.flowchart-link");
    const frame = region.querySelector("[data-testid='preview-frame']") ?? region;
    return { nodes, edge: edge ? getComputedStyle(edge).stroke : "", surface: getComputedStyle(frame).backgroundColor };
  });
}
