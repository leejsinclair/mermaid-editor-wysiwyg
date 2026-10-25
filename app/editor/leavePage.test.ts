import { describe, expect, it } from "vitest";
import { createHistory } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import { unsafeToLeave } from "./leavePage";
import { reducer, type EditorState } from "./reducer";

// VO-016 (FR-028): an unsaved change makes leaving unsafe, so the page asks first; a saved or untouched diagram does not.
const fresh: EditorState = { history: createHistory(newDiagram("d1", "flowchart")), selection: null, draft: null, nameDraft: null, gesture: 0, armed: null, feedback: null };
const edited = reducer(fresh, { type: "commit", operation: { op: "addNode", shape: "rectangle", position: { x: 0, y: 0 } } });

describe("unsafeToLeave", () => {
  it("is unsafe while a committed change has no completed write", () => {
    for (const status of ["saving", "not-saved", "unavailable"] as const) expect(unsafeToLeave(edited, status)).toBe(true);
  });

  it("is safe once the newest change is written, and for a diagram never changed", () => {
    expect(unsafeToLeave(edited, "saved")).toBe(false);
    expect(unsafeToLeave(fresh, "new")).toBe(false);
  });

  it("is unsafe with a label typed over, and safe with a label editor left as it was", () => {
    const itemId = edited.history.present.type === "flowchart" ? (edited.history.present.content.nodes[0]?.id ?? 0) : 0;
    const opened = reducer(reducer(edited, { type: "select", itemId }), { type: "startInlineEdit" });
    expect(unsafeToLeave(opened, "saved")).toBe(false);
    expect(unsafeToLeave({ ...opened, draft: opened.draft && { ...opened.draft, text: "Half typed" } }, "saved")).toBe(true);
  });

  it("is unsafe with a C4 description or technology typed over, even when it matches the label", () => {
    const c4 = reducer({ ...fresh, history: createHistory(newDiagram("d2", "c4", "container")) }, { type: "commit", operation: { op: "addElement", elementType: "container" } });
    const present = c4.history.present;
    const element = present.type === "c4" ? present.content.tree[0] : undefined;
    const itemId = element?.id ?? 0;
    const label = element && "label" in element ? element.label : "";
    for (const field of ["description", "technology"] as const) {
      expect(unsafeToLeave({ ...c4, draft: { itemId, text: label, field, origin: "panel" } }, "saved")).toBe(true);
    }
  });

  it("is unsafe with a half-typed name even when saved", () => {
    expect(unsafeToLeave({ ...edited, nameDraft: "Half" }, "saved")).toBe(true);
  });
});
