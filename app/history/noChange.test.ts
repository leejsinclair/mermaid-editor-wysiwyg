import { describe, expect, it } from "vitest";
import { addNode } from "../model/flowchart/apply";
import { newDiagram } from "../model/newDiagram";
import type { FlowchartDiagram } from "../model/types";
import { commit, createHistory } from "./history";

// VO-015: an operation that would change nothing is not an undo step (contracts/operations.md, Commit).

describe("commit of an operation that changes nothing", () => {
  const start = addNode(newDiagram("d1", "flowchart") as FlowchartDiagram, "rectangle", { x: 0, y: 0 });

  it("returns { committed: false } with no rejection and the same history", () => {
    const history = createHistory(start);

    const result = commit(history, { op: "moveNode", id: 1, position: { x: 0, y: 0 } });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(history);
  });

  it("still commits a move to a different position", () => {
    const result = commit(createHistory(start), { op: "moveNode", id: 1, position: { x: 500, y: 0 } });

    expect(result.outcome).toEqual({ committed: true });
    expect(result.history.past).toHaveLength(1);
  });
});
