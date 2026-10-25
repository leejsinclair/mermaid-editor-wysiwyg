import { describe, expect, it } from "vitest";
import { en } from "../../text/en";
import { TOOLBAR_GROUPS, TOOLBAR_ACTIONS, placeActions, type ToolbarActionId } from "./toolbarGroups";
import type { Layout } from "./layout";

// VO-010 (FR-017, FR-018): four groups in the order History, Diagram editing, Export and sharing, View; every action the toolbar
// offered sits in exactly one group or in the overflow menu, in every layout.

const byName = (a: string, b: string): number => a.localeCompare(b);
const LAYOUTS: readonly Layout[] = ["wide", "narrow", "compact"];
const OFFERED_BEFORE: readonly ToolbarActionId[] = ["undo", "redo", "copySource", "copyMarkdown", "saveFile", "zoomIn", "zoomOut", "fit", "preview"];

describe("the toolbar groups", () => {
  it("are History, Diagram editing, Export and sharing and View, in that order", () => {
    expect(TOOLBAR_GROUPS.map((group) => group.heading)).toEqual([
      en.toolbar.groups.history,
      en.toolbar.groups.diagramEditing,
      en.toolbar.groups.exportSharing,
      en.toolbar.groups.view,
    ]);
  });

  it("hold Undo and Redo, then the diagram editing actions, then the three export actions, then the view actions", () => {
    const of = (heading: string): readonly ToolbarActionId[] => TOOLBAR_GROUPS.find((group) => group.heading === heading)?.actions ?? [];
    expect(of(en.toolbar.groups.history)).toEqual(["undo", "redo"]);
    expect(of(en.toolbar.groups.diagramEditing)).toEqual(["rename", "changeType", "moveTo"]);
    expect(of(en.toolbar.groups.exportSharing)).toEqual(["copySource", "copyMarkdown", "saveFile"]);
    expect(of(en.toolbar.groups.view)).toEqual(["zoomIn", "zoomOut", "fit", "preview"]);
  });

  it("place every action in exactly one group, with none repeated", () => {
    const all = TOOLBAR_GROUPS.flatMap((group) => group.actions);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort(byName)).toEqual([...TOOLBAR_ACTIONS].sort(byName));
  });
});

describe("the placement of actions in a layout", () => {
  for (const layout of LAYOUTS) {
    it(`keeps every action reachable exactly once as a button or a menu item (${layout})`, () => {
      const { groups, overflow } = placeActions(layout);
      const shown = groups.flatMap((group) => group.actions);
      const everywhere = [...shown, ...overflow];
      expect(new Set(everywhere).size).toBe(everywhere.length);
      expect([...everywhere].sort(byName)).toEqual([...TOOLBAR_ACTIONS].sort(byName));
      for (const id of OFFERED_BEFORE) expect(everywhere).toContain(id);
    });
  }

  it("shows every action as a button when the window is wide or narrow", () => {
    expect(placeActions("wide").overflow).toEqual([]);
    expect(placeActions("narrow").overflow).toEqual([]);
  });

  it("moves the export actions and the preview toggle to the menu when the window is compact", () => {
    expect(placeActions("compact").overflow).toEqual(["copySource", "copyMarkdown", "saveFile", "preview"]);
  });
});
