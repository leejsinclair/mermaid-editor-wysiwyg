import type { Boundary, C4Item, DeploymentNode } from "../types";

// Helpers for the C4 tree: items are found, replaced, removed and inserted without changing anything else.

type Container = Boundary | DeploymentNode;

export const isContainer = (item: C4Item | undefined): item is Container => item !== undefined && item.item !== "element";

/** The item with this id, wherever it is in the tree. */
export function findItem(tree: readonly C4Item[], id: number): C4Item | undefined {
  for (const item of tree) {
    if (item.id === id) return item;
    if (isContainer(item)) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/** The boundary or node holding this item, or undefined at the top level or when the item is not in the tree. */
export function parentOf(tree: readonly C4Item[], id: number): Container | undefined {
  for (const item of tree) {
    if (!isContainer(item)) continue;
    if (item.children.some((child) => child.id === id)) return item;
    const found = parentOf(item.children, id);
    if (found) return found;
  }
  return undefined;
}

/** The tree with this item replaced by `replace(item)`. */
export function replaceItem(tree: readonly C4Item[], id: number, replace: (item: C4Item) => C4Item): readonly C4Item[] {
  return tree.map((item) => {
    if (item.id === id) return replace(item);
    return isContainer(item) ? { ...item, children: replaceItem(item.children, id, replace) } : item;
  });
}

/** The tree without this item (its children go with it). */
export function removeItem(tree: readonly C4Item[], id: number): readonly C4Item[] {
  return tree
    .filter((item) => item.id !== id)
    .map((item) => (isContainer(item) ? { ...item, children: removeItem(item.children, id) } : item));
}

function insertAt(items: readonly C4Item[], item: C4Item, index: number | undefined): readonly C4Item[] {
  const at = index === undefined ? items.length : Math.min(Math.max(index, 0), items.length);
  return [...items.slice(0, at), item, ...items.slice(at)];
}

/** The tree with `item` added to the children of `parentId`, or to the top level when that is null, at `index` or last. */
export function insertItem(tree: readonly C4Item[], parentId: number | null, item: C4Item, index?: number): readonly C4Item[] {
  if (parentId === null) return insertAt(tree, item, index);
  return replaceItem(tree, parentId, (parent) => (isContainer(parent) ? { ...parent, children: insertAt(parent.children, item, index) } : parent));
}

/** Every item in the tree, depth first in statement order. */
export function walkItems(tree: readonly C4Item[]): C4Item[] {
  return tree.flatMap((item) => [item, ...(isContainer(item) ? walkItems(item.children) : [])]);
}

/** The tree with this boundary or node replaced, at its position, by its children in order; an element is removed. */
export function liftItem(tree: readonly C4Item[], id: number): readonly C4Item[] {
  return tree.flatMap((item): readonly C4Item[] => {
    if (item.id === id) return isContainer(item) ? item.children : [];
    return [isContainer(item) ? { ...item, children: liftItem(item.children, id) } : item];
  });
}
