import { describe, expect, it } from "vitest";
import { newDiagram } from "../model/newDiagram";
import { canRedo, commit, createHistory, redo, undo, type History } from "./history";

// VO-031: after operations are undone and a new operation is committed, Redo is unavailable and the undone
// operations cannot be reapplied.

function addThree(): History {
  let history = createHistory(newDiagram("d1", "flowchart"));
  for (let index = 0; index < 3; index += 1) {
    history = commit(history, { op: "addNode", shape: "rectangle", position: { x: index * 400, y: 0 } }).history;
  }
  return history;
}

describe("a commit after an undo", () => {
  it("makes Redo unavailable and the undone operations unreachable", () => {
    const undone = undo(undo(addThree()));
    expect(canRedo(undone)).toBe(true);

    const result = commit(undone, { op: "addNode", shape: "circle", position: { x: 0, y: 300 } });

    expect(result.outcome).toEqual({ committed: true });
    expect(canRedo(result.history)).toBe(false);
    expect(result.history.future).toEqual([]);
    expect(redo(result.history)).toBe(result.history);
    expect(result.history.present.content).toMatchObject({ nodes: [{ shape: "rectangle" }, { shape: "circle" }] });
  });

  it("keeps Redo when the operation is rejected or changes nothing", () => {
    const undone = undo(addThree());

    const rejected = commit(undone, { op: "deleteItem", itemId: 99 });
    const unchanged = commit(undone, { op: "moveNode", id: 1, position: { x: 0, y: 0 } });

    expect(rejected.history).toBe(undone);
    expect(unchanged.history).toBe(undone);
    expect(canRedo(unchanged.history)).toBe(true);
  });
});
