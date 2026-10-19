import { describe, expect, it } from "vitest";
import type { FlowchartDiagram } from "../model/types";
import { newDiagram } from "../model/newDiagram";
import { canUndo, commit, createHistory, redo, undo, type History } from "./history";

// VO-033: 2 000 operations committed in one open diagram can all be undone back to the start and redone.

const COUNT = 2000;

describe("a long history", () => {
  it("undoes all 2 000 operations back to the start and redoes them all", () => {
    const start = newDiagram("d1", "flowchart");
    let history: History = createHistory(start);
    // Each rename is a distinct change, so every commit is a history entry.
    history = commit(history, { op: "addNode", shape: "rectangle", position: { x: 0, y: 0 } }).history;
    for (let step = 1; step < COUNT; step += 1) {
      const result = commit(history, { op: "setLabel", itemId: 1, field: "label", text: `label ${String(step)}` });
      expect(result.outcome).toEqual({ committed: true });
      history = result.history;
    }
    expect(history.past).toHaveLength(COUNT);
    const final = history.present;

    while (canUndo(history)) history = undo(history);
    expect(history.present).toEqual(start);
    expect(history.future).toHaveLength(COUNT);

    for (let step = 0; step < COUNT; step += 1) history = redo(history);
    expect(history.present).toEqual(final);
    expect((history.present as FlowchartDiagram).content.nodes[0]?.label).toBe(`label ${String(COUNT - 1)}`);
  });
});
