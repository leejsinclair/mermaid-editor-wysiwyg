import { expect, test } from "@playwright/test";
import { openPreviewOfEveryShape, readDrawing } from "./support/preview";

// VO-026 (FR-019, US4-AS1): the flowchart preview in Blueprint Studio fills nodes with the node fill, outlines them in cyan, sets
// labels in ivory and draws lines in the canvas ink, on the canvas surface; every shape has the outline Mermaid draws for it in
// Light.

const NODE_FILL = "rgb(13, 43, 69)";
const CYAN = "rgb(114, 215, 242)";
const IVORY = "rgb(241, 233, 215)";
const SURFACE = "rgb(7, 28, 48)";

test("the preview draws every node shape in the blueprint look, with the outlines Mermaid draws in Light", async ({ context }) => {
  const blueprint = await context.newPage();
  await openPreviewOfEveryShape(blueprint);
  const drawn = await readDrawing(blueprint);
  expect(drawn.nodes).toHaveLength(9);
  for (const node of drawn.nodes) {
    expect(node.fill, "node fill").toBe(NODE_FILL);
    expect(node.stroke, "node outline").toBe(CYAN);
    expect(node.label, "label").toBe(IVORY);
  }
  expect(drawn.edge, "connection line").toBe(IVORY);
  expect(drawn.surface, "preview surface").toBe(SURFACE);

  const light = await context.newPage();
  await light.goto("#/new/flowchart");
  await light.getByRole("button", { name: "Light", exact: true }).click();
  await openPreviewOfEveryShape(light);
  const inLight = await readDrawing(light);
  const outlines = (nodes: readonly { readonly outline: string }[]): string[] => nodes.map((node) => node.outline).sort((a, b) => a.localeCompare(b));
  expect(outlines(inLight.nodes)).toEqual(outlines(drawn.nodes));
});
