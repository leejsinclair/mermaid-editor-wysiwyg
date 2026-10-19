import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory, type History } from "../../history/history";
import type { Operation } from "../operations";
import { newDiagram } from "../newDiagram";
import type { Connection, FlowchartDiagram } from "../types";
import { addConnection, addNode } from "./apply";

// VO-027 (EC-18): a connection's line style and ending can change, and either end can move to any node,
// including the other end's node and a node it already connects. Each change is one history entry; the label and
// the other end are kept; a resulting self-loop or duplicate is accepted.

function start(): History {
  let diagram = newDiagram("d1", "flowchart") as FlowchartDiagram;
  for (let index = 0; index < 3; index += 1) diagram = addNode(diagram, "rectangle", { x: index * 400, y: 0 });
  diagram = addConnection(diagram, 1, 2, "solid", "arrow", "labelled");
  diagram = addConnection(diagram, 1, 3, "solid", "arrow");
  return createHistory(diagram);
}

const connection = (history: History, index = 0): Connection => {
  const found = (history.present as FlowchartDiagram).content.connections[index];
  if (!found) throw new Error("No connection");
  return found;
};

function run(history: History, operation: Operation) {
  const result = commit(history, operation);
  expect(result.outcome).toEqual({ committed: true });
  expect(result.history.past).toHaveLength(history.past.length + 1);
  return result.history;
}

describe("changing a connection's type", () => {
  it("changes the line style and ending, keeps label and ends, and shows in the source", () => {
    const before = start();
    const after = run(before, { op: "changeType", itemId: 4, to: { kind: "connection", line: "dotted", ending: "both" } });

    expect(connection(after)).toEqual({ ...connection(before), line: "dotted", ending: "both" });
    expect(generate(after.present).source).toContain('n1 <-.->|"labelled"| n2');
  });
});

describe("moving a connection's end", () => {
  it("moves the end to another node and keeps the label and the other end", () => {
    const after = run(start(), { op: "moveEnd", linkId: 4, end: "to", targetId: 3 });

    expect(connection(after)).toMatchObject({ from: 1, to: 3, label: "labelled" });
  });

  it("moves the start to the node at the other end, making a self-loop", () => {
    const after = run(start(), { op: "moveEnd", linkId: 4, end: "from", targetId: 2 });

    expect(connection(after)).toMatchObject({ from: 2, to: 2, label: "labelled" });
    expect(generate(after.present).source).toContain('n2 -->|"labelled"| n2');
  });

  it("moves an end onto a node it already connects, making a duplicate that is kept", () => {
    const after = run(start(), { op: "moveEnd", linkId: 4, end: "to", targetId: 3 });

    expect((after.present as FlowchartDiagram).content.connections.map((c) => [c.from, c.to])).toEqual([[1, 3], [1, 3]]);
  });

  it("rejects a node that does not exist with unknownEndpoint", () => {
    const history = start();

    const result = commit(history, { op: "moveEnd", linkId: 4, end: "to", targetId: 99 });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "unknownEndpoint" } });
    expect(result.history).toBe(history);
  });
});
