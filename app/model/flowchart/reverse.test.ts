import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory } from "../../history/history";
import { newDiagram } from "../newDiagram";
import type { Ending, FlowchartDiagram } from "../types";
import { addConnection, addNode } from "./apply";

// VO-028: Reverse makes a one-way connection run the other way; it is refused, with nothing changed, where it
// would change nothing.

function with_(from: number, to: number, ending: Ending) {
  let diagram = addNode(addNode(newDiagram("d1", "flowchart") as FlowchartDiagram, "rectangle", { x: 0, y: 0 }), "circle", { x: 400, y: 0 });
  diagram = addConnection(diagram, from, to, "dotted", ending, "kept");
  return createHistory(diagram);
}

describe("Reverse", () => {
  it("makes a one-way connection run the other way, keeping label and type, in one history entry", () => {
    const history = with_(1, 2, "arrow");

    const result = commit(history, { op: "reverse", linkId: 3 });

    expect(result.outcome).toEqual({ committed: true });
    expect(result.history.past).toHaveLength(1);
    const after = result.history.present as FlowchartDiagram;
    expect(after.content.connections).toEqual([{ id: 3, from: 2, to: 1, line: "dotted", ending: "arrow", label: "kept" }]);
    expect(generate(after).source).toContain('n2 -.->|"kept"| n1');
  });

  it("is refused on a self-loop with reverseSelf", () => {
    const history = with_(1, 1, "arrow");

    const result = commit(history, { op: "reverse", linkId: 3 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "reverseSelf" } });
    expect(result.history).toBe(history);
  });

  it.each(["plain", "both"] as const)("is refused on a %s connection with reverseUndirected", (ending) => {
    const history = with_(1, 2, ending);

    const result = commit(history, { op: "reverse", linkId: 3 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "reverseUndirected" } });
    expect(result.history).toBe(history);
    expect(result.history.present).toEqual(history.present);
  });

  it("is refused for a connection that does not exist with unknownItem", () => {
    const result = commit(with_(1, 2, "arrow"), { op: "reverse", linkId: 99 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "unknownItem" } });
  });
});
