import { describe, expect, it } from "vitest";
import { createHistory } from "../history/history";
import { newDiagram } from "../model/newDiagram";
import { run } from "../testing/run";
import { reducer, type EditorAction, type EditorState } from "./reducer";

// VO-003 (FR-005, FR-009, US1-AS3): cancelling a label edit keeps the previous label and adds no history step;
// cancelling an unfinished connection leaves the selected item selected. The connection cancel action is added to the
// reducer by T009, so until then the cast below reaches the reducer, which returns the state unchanged, and the test fails.
const history = run(createHistory(newDiagram("d1", "flowchart")), { op: "addNode", shape: "rectangle", position: { x: 0, y: 0 } });
const nodeId = history.present.type === "flowchart" ? (history.present.content.nodes[0]?.id ?? 0) : 0;
const labelOfNode = (state: EditorState): string => (state.history.present.type === "flowchart" ? (state.history.present.content.nodes[0]?.label ?? "") : "");

const initial: EditorState = { history, selection: null, draft: null, nameDraft: null, gesture: 0, armed: null, feedback: null };
const step = (state: EditorState, ...actions: EditorAction[]): EditorState => actions.reduce(reducer, state);
const cancelConnection = { type: "cancelConnection" } as unknown as EditorAction;
const selected = step(initial, { type: "select", itemId: nodeId });
const original = labelOfNode(selected);

describe("cancel label edit", () => {
  it("keeps the previous label when the typed text is cancelled", () => {
    const typing = step(selected, { type: "startInlineEdit" }, { type: "draft", itemId: nodeId, text: "Changed", origin: "canvas" });
    const cancelled = step(typing, { type: "cancelDraft" });
    expect(labelOfNode(cancelled)).toBe(original);
    expect(cancelled.draft).toBeNull();
  });

  it("adds no undo step for a cancelled label edit", () => {
    const typing = step(selected, { type: "startInlineEdit" }, { type: "draft", itemId: nodeId, text: "Changed", origin: "canvas" });
    const cancelled = step(typing, { type: "cancelDraft" });
    expect(cancelled.history.past).toBe(selected.history.past);
  });
});

describe("cancel connection", () => {
  it("clears the armed connection when an unfinished connection is cancelled", () => {
    const connecting = step(selected, { type: "arm", connection: { line: "solid", ending: "arrow" } });
    expect(step(connecting, cancelConnection).armed).toBeNull();
  });

  it("keeps the selection when an unfinished connection is cancelled", () => {
    const connecting = step(selected, { type: "arm", connection: { line: "solid", ending: "arrow" } });
    expect(step(connecting, cancelConnection).selection).toBe(nodeId);
  });
});

describe("confirm a restored label", () => {
  it("clears the blank-label message once the original label is typed back and confirmed", () => {
    const blank = step(selected, { type: "startInlineEdit" }, { type: "draft", itemId: nodeId, text: "   ", origin: "canvas" }, { type: "confirmLabel" });
    expect(blank.feedback).not.toBeNull();
    const restored = step(blank, { type: "draft", itemId: nodeId, text: original, origin: "canvas" }, { type: "confirmLabel" });
    expect(restored.draft).toBeNull();
    expect(restored.feedback).toBeNull();
  });
});
