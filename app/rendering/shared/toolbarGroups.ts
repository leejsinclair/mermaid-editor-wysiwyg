import { en } from "../../text/en";
import type { Layout } from "./layout";

export type ToolbarActionId =
  | "undo"
  | "redo"
  | "rename"
  | "changeType"
  | "moveTo"
  | "copySource"
  | "copyMarkdown"
  | "saveFile"
  | "zoomIn"
  | "zoomOut"
  | "fit"
  | "preview";

export interface ToolbarGroup {
  readonly id: "history" | "diagramEditing" | "exportSharing" | "view";
  readonly heading: string;
  readonly actions: readonly ToolbarActionId[];
}

/** The toolbar by intent (FR-017), in the order it is read. Diagram editing is offered in the Properties panel, with the same names. */
export const TOOLBAR_GROUPS: readonly ToolbarGroup[] = [
  { id: "history", heading: en.toolbar.groups.history, actions: ["undo", "redo"] },
  { id: "diagramEditing", heading: en.toolbar.groups.diagramEditing, actions: ["rename", "changeType", "moveTo"] },
  { id: "exportSharing", heading: en.toolbar.groups.exportSharing, actions: ["copySource", "copyMarkdown", "saveFile"] },
  { id: "view", heading: en.toolbar.groups.view, actions: ["zoomIn", "zoomOut", "fit", "preview"] },
];

export const TOOLBAR_ACTIONS: readonly ToolbarActionId[] = TOOLBAR_GROUPS.flatMap((group) => group.actions);

/** The actions with no room on a compact toolbar (spec 007, FR-010); they move to "More actions" and none is removed (FR-018). */
const LESS_FREQUENT: readonly ToolbarActionId[] = ["copySource", "copyMarkdown", "saveFile", "preview"];

export interface Placement {
  /** The groups as buttons, each without the actions that moved to the menu. */
  readonly groups: readonly ToolbarGroup[];
  readonly overflow: readonly ToolbarActionId[];
}

/** Where each action sits for a layout: as a button in its group, or as an item in the overflow menu. */
export function placeActions(layout: Layout): Placement {
  const moved = layout === "compact" ? LESS_FREQUENT : [];
  return {
    groups: TOOLBAR_GROUPS.map((group) => ({ ...group, actions: group.actions.filter((id) => !moved.includes(id)) })),
    overflow: TOOLBAR_GROUPS.flatMap((group) => group.actions.filter((id) => moved.includes(id))),
  };
}
