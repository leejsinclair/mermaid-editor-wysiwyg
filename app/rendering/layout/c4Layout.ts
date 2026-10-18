import { isContainer } from "../../model/c4/tree";
import type { Boundary, C4Content, C4Item, DeploymentNode } from "../../model/types";

// Where a C4 diagram's parts sit on the canvas. Pure: it depends only on the order and nesting of the tree, the way
// Mermaid arranges them, so there are no positions in the model and nothing to move freely (FR-038, FR-003). Within a
// boundary or at the top level, shapes come first, four to a row, then boundaries, two to a row.

export const SHAPES_PER_ROW = 4;
export const BOUNDARIES_PER_ROW = 2;
export const SHAPE_WIDTH = 216;
export const SHAPE_HEIGHT = 120;
export const GAP = 32;
export const PADDING = 32;
export const HEADER_HEIGHT = 44;
export const MARGIN = 32;

export interface C4Box {
  readonly id: number;
  readonly item: C4Item["item"];
  /** The enclosing boundary or node, or null at the top level. */
  readonly parentId: number | null;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface C4Layout {
  readonly width: number;
  readonly height: number;
  /** Every item's box, each container before what it holds, shapes before containers at every level. */
  readonly boxes: readonly C4Box[];
}

interface Size {
  readonly width: number;
  readonly height: number;
}

const isShape = (item: C4Item) => item.item === "element";
const containersOf = (items: readonly C4Item[]): (Boundary | DeploymentNode)[] => items.filter(isContainer);
const chunks = <T>(items: readonly T[], size: number): T[][] => Array.from({ length: Math.ceil(items.length / size) }, (_, row) => items.slice(row * size, row * size + size));

type Measure = (container: Boundary | DeploymentNode) => Size;

/** The size of what a list of items takes up: its shapes in rows of four, then its containers in rows of two. */
function contentSize(items: readonly C4Item[], measure: Measure): Size {
  const shapes = items.filter(isShape);
  const shapeRows = chunks(shapes, SHAPES_PER_ROW);
  const containerRows = chunks(containersOf(items), BOUNDARIES_PER_ROW).map((row) => row.map(measure));
  const widths = [
    ...shapeRows.map((row) => row.length * SHAPE_WIDTH + (row.length - 1) * GAP),
    ...containerRows.map((row) => row.reduce((total, size) => total + size.width, 0) + (row.length - 1) * GAP),
  ];
  const heights = [...shapeRows.map(() => SHAPE_HEIGHT), ...containerRows.map((row) => Math.max(...row.map((size) => size.height)))];
  return { width: Math.max(0, ...widths), height: heights.reduce((total, height) => total + height, 0) + Math.max(0, heights.length - 1) * GAP };
}

/** Items in statement order, wrapping and nesting as Mermaid arranges them. */
export function c4Layout(content: C4Content): C4Layout {
  const sizes = new Map<number, Size>();
  const measure: Measure = (container) => {
    const known = sizes.get(container.id);
    if (known) return known;
    const inner = contentSize(container.children, measure);
    const size = { width: Math.max(inner.width, SHAPE_WIDTH) + 2 * PADDING, height: HEADER_HEIGHT + Math.max(inner.height, SHAPE_HEIGHT / 2) + PADDING };
    sizes.set(container.id, size);
    return size;
  };

  const boxes: C4Box[] = [];
  const place = (items: readonly C4Item[], parentId: number | null, depth: number, x: number, y: number): void => {
    let top = y;
    for (const row of chunks(items.filter(isShape), SHAPES_PER_ROW)) {
      for (const [column, shape] of row.entries()) {
        boxes.push({ id: shape.id, item: shape.item, parentId, depth, x: x + column * (SHAPE_WIDTH + GAP), y: top, width: SHAPE_WIDTH, height: SHAPE_HEIGHT });
      }
      top += SHAPE_HEIGHT + GAP;
    }
    for (const row of chunks(containersOf(items), BOUNDARIES_PER_ROW)) {
      let left = x;
      let rowHeight = 0;
      for (const container of row) {
        const size = measure(container);
        boxes.push({ id: container.id, item: container.item, parentId, depth, x: left, y: top, ...size });
        place(container.children, container.id, depth + 1, left + PADDING, top + HEADER_HEIGHT);
        left += size.width + GAP;
        rowHeight = Math.max(rowHeight, size.height);
      }
      top += rowHeight + GAP;
    }
  };

  place(content.tree, null, 0, MARGIN, MARGIN);
  const inner = contentSize(content.tree, measure);
  return { width: inner.width + 2 * MARGIN, height: inner.height + 2 * MARGIN, boxes };
}
