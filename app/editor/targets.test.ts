import { describe, expect, it } from "vitest";
import { addNode } from "../model/flowchart/apply";
import { newDiagram } from "../model/newDiagram";
import { addParticipant } from "../model/sequence/apply";
import { targetList } from "../model/targets";
import type { FlowchartDiagram, SequenceDiagram } from "../model/types";
import { boundary, c4Diagram, element, node } from "../testing/c4Builder";

// VO-064 (FR-019, EC-20): the target list of Connect and Change end tells equal labels apart by type and position number.

const names = (targets: readonly { name: string }[]): string[] => targets.map((target) => target.name);

describe("the target list", () => {
  it("tells flowchart nodes with equal labels apart by shape and by position among nodes of that shape", () => {
    let diagram = newDiagram("f", "flowchart") as FlowchartDiagram;
    diagram = addNode(diagram, "rectangle", { x: 0, y: 0 });
    diagram = addNode(diagram, "rectangle", { x: 400, y: 0 });
    diagram = addNode(diagram, "circle", { x: 800, y: 0 });
    diagram = { ...diagram, content: { ...diagram.content, nodes: diagram.content.nodes.map((entry) => ({ ...entry, label: "Same" })) } };

    const targets = targetList(diagram);

    expect(names(targets)).toEqual(["Same (Rectangle 1)", "Same (Rectangle 2)", "Same (Circle 1)"]);
    expect(targets.map((target) => target.id)).toEqual(diagram.content.nodes.map((entry) => entry.id));
  });

  it("tells participants with equal labels apart by role and position", () => {
    let diagram = newDiagram("s", "sequence") as SequenceDiagram;
    diagram = addParticipant(diagram, "participant");
    diagram = addParticipant(diagram, "participant");
    diagram = addParticipant(diagram, "actor");
    diagram = { ...diagram, content: { ...diagram.content, participants: diagram.content.participants.map((entry) => ({ ...entry, label: "Same" })) } };

    expect(new Set(names(targetList(diagram))).size).toBe(3);
    expect(names(targetList(diagram))[1]).toMatch(/^Same \(.+ 2\)$/);
  });

  it("offers C4 elements and deployment nodes but not boundaries, each told apart", () => {
    const diagram = c4Diagram("deployment", [
      boundary(1, "system", [element(2, "container", "Same")]),
      node(3, [element(4, "container", "Same")], "Same"),
    ]);

    const list = targetList(diagram);

    expect(list.map((target) => target.id)).toEqual([2, 3, 4]);
    expect(new Set(names(list)).size).toBe(3);
    expect(names(list)[0]).toMatch(/\b1\)$/);
    expect(names(list)[2]).toMatch(/\b2\)$/);
  });
});
