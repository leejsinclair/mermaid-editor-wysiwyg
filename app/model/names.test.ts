import { describe, expect, it } from "vitest";
import { generate } from "../generation/generate";
import { commit, createHistory } from "../history/history";
import { newDiagram } from "./newDiagram";
import type { C4Kind, FlowchartDiagram } from "./types";

// VO-077 (FR-045): every diagram has a name that defaults by type, is renamed as one undo step, needs a visible
// character, never reaches the source, and need not be unique.

const KINDS: readonly C4Kind[] = ["context", "container", "component", "dynamic", "deployment"];

describe("default names", () => {
  it("names a new flowchart and sequence diagram by type", () => {
    expect(newDiagram("a", "flowchart").name).toBe("Untitled flowchart");
    expect(newDiagram("b", "sequence").name).toBe("Untitled sequence diagram");
  });

  it.each(KINDS)("names a new C4 %s diagram by kind", (kind) => {
    expect(newDiagram("c", "c4", kind).name).toBe(`Untitled C4 ${kind} diagram`);
  });
});

describe("renaming a diagram", () => {
  it("is one history entry", () => {
    const history = createHistory(newDiagram("a", "flowchart"));

    const result = commit(history, { op: "renameDiagram", name: "Order flow" });

    expect(result.outcome).toEqual({ committed: true });
    expect(result.history.present.name).toBe("Order flow");
    expect(result.history.past).toHaveLength(1);
    expect(result.history.past[0]?.name).toBe("Untitled flowchart");
  });

  it.each(["", "   ", "\n\t", "​"])("rejects the blank name %j with blankName", (name) => {
    const history = createHistory(newDiagram("a", "flowchart"));

    const result = commit(history, { op: "renameDiagram", name });

    expect(result.outcome).toEqual({ committed: false, rejection: { reason: "blankName" } });
    expect(result.history).toBe(history);
  });

  it("never writes the name to the source", () => {
    const named = commit(createHistory(newDiagram("a", "flowchart")), { op: "renameDiagram", name: "Secret name" }).history.present;

    expect(generate(named).source).not.toContain("Secret name");
    expect(generate(named).source).toBe(generate(newDiagram("a", "flowchart")).source);
  });

  it("keeps two diagrams with equal names as two diagrams", () => {
    const first = commit(createHistory(newDiagram("a", "flowchart")), { op: "renameDiagram", name: "Same" }).history.present;
    const second = commit(createHistory(newDiagram("b", "flowchart")), { op: "renameDiagram", name: "Same" }).history.present;

    expect(first.name).toBe(second.name);
    expect(first.id).not.toBe(second.id);
    expect((first as FlowchartDiagram).content).toEqual((second as FlowchartDiagram).content);
  });
});
