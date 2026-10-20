import { describe, expect, it } from "vitest";
import { createHistory } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import { run } from "../testing/run";
import { reducer, type EditorAction, type EditorState } from "./reducer";

// VO-053 (FR-002, FR-004, EC-15) and VO-009 (FR-004, US1-AS9): the inline draft commits or is discarded as asked,
// a Properties panel draft is left alone, and an unchanged label is no undo step.
const history = run(createHistory(newDiagram("d1", "flowchart")), { op: "addNode", shape: "rectangle", position: { x: 0, y: 0 } });
const nodeId = history.present.type === "flowchart" ? (history.present.content.nodes[0]?.id ?? 0) : 0;
const labelOfNode = (state: EditorState): string => (state.history.present.type === "flowchart" ? (state.history.present.content.nodes[0]?.label ?? "") : "");

const initial: EditorState = { history, selection: null, draft: null, nameDraft: null, gesture: 0, armed: null, feedback: null };
const step = (state: EditorState, ...actions: EditorAction[]): EditorState => actions.reduce(reducer, state);
const selected = step(initial, { type: "select", itemId: nodeId });
const original = labelOfNode(selected);

describe("startInlineEdit", () => {
  it("opens a canvas draft holding the item's current label", () => {
    const state = step(selected, { type: "startInlineEdit" });
    expect(state.draft).toMatchObject({ itemId: nodeId, text: original, origin: "canvas" });
  });

  it("is ignored with no selection", () => {
    expect(step(initial, { type: "startInlineEdit" })).toBe(initial);
  });
});

describe("blurInlineEdit", () => {
  const typing = step(selected, { type: "startInlineEdit" }, { type: "draft", itemId: nodeId, text: "Renamed", origin: "canvas" });

  it("commits the canvas draft when not discarding", () => {
    const state = step(typing, { type: "blurInlineEdit", discard: false });
    expect(state.draft).toBeNull();
    expect(labelOfNode(state)).toBe("Renamed");
    expect(state.history.past).toHaveLength(selected.history.past.length + 1);
  });

  it("drops the canvas draft when discarding", () => {
    const state = step(typing, { type: "blurInlineEdit", discard: true });
    expect(state.draft).toBeNull();
    expect(labelOfNode(state)).toBe(original);
    expect(state.history).toBe(selected.history);
  });

  it("leaves a Properties panel draft untouched", () => {
    const panel = step(selected, { type: "draft", itemId: nodeId, text: "Half typed", origin: "panel" });
    expect(step(panel, { type: "blurInlineEdit", discard: false })).toBe(panel);
    expect(step(panel, { type: "blurInlineEdit", discard: true })).toBe(panel);
  });

  it("adds no history entry when the text equals the current label", () => {
    const same = step(selected, { type: "startInlineEdit" }, { type: "blurInlineEdit", discard: false });
    expect(same.draft).toBeNull();
    expect(same.history).toBe(selected.history);
  });

  it("closes the draft and sets the rejection feedback for invalid text", () => {
    const blank = step(selected, { type: "startInlineEdit" }, { type: "draft", itemId: nodeId, text: "   ", origin: "canvas" }, { type: "blurInlineEdit", discard: false });
    expect(blank.draft).toBeNull();
    expect(labelOfNode(blank)).toBe(original);
    expect(blank.history).toBe(selected.history);
    expect(blank.feedback).toMatchObject({ tone: "error" });
  });
});
