import { describe, expect, it } from "vitest";
import { createHistory } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import { reducer, type EditorState } from "./reducer";

// VO-045 (SC-007): choosing what is already chosen, with no draft open, leaves the state as it is, so a pan of the empty canvas
// does not draw the whole editor again. Choosing anything else, or closing a draft, still changes it.
const initial: EditorState = { history: createHistory(newDiagram("d1", "flowchart")), selection: null, draft: null, nameDraft: null, gesture: 0, armed: null, feedback: null };

describe("select", () => {
  it("returns the same state when nothing is chosen and nothing is chosen again", () => {
    expect(reducer(initial, { type: "select", itemId: null })).toBe(initial);
  });

  it("changes the selection to another item", () => {
    expect(reducer(initial, { type: "select", itemId: 3 }).selection).toBe(3);
  });

  it("closes an open draft even when the same item is chosen again", () => {
    const drafting: EditorState = { ...initial, selection: 3, draft: { itemId: 3, text: "x", origin: "canvas" } };
    expect(reducer(drafting, { type: "select", itemId: 3 }).draft).toBeNull();
  });
});
