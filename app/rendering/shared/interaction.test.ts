import { describe, expect, it } from "vitest";
import { addNode } from "../../model/flowchart/apply";
import { newDiagram } from "../../model/newDiagram";
import { walkItems } from "../../model/c4/tree";
import { addParticipant } from "../../model/sequence/apply";
import type { C4Kind, FlowchartDiagram, SequenceDiagram } from "../../model/types";
import { boundary, c4Diagram, element, fullDiagram, node } from "../../testing/c4Builder";
import { handlesFit, isDoubleActivation, validEnds, type Release } from "./interaction";

// VO-037 (FR-006, EC-01): a double activation is two quiet releases on one item, close in time and space.
describe("isDoubleActivation", () => {
  const first: Release = { time: 1000, x: 100, y: 100, itemId: 7, dragged: false };
  const second = (change: Partial<Release>): Release => ({ ...first, time: 1200, ...change });

  it("is reported for two releases on the same item within 400 ms and 8 px", () => {
    expect(isDoubleActivation(first, second({}))).toBe(true);
    expect(isDoubleActivation(first, second({ time: 1400, x: 105, y: 105 }))).toBe(true);
  });

  it("is not reported for 401 ms, 9 px, a different item, or a drag between", () => {
    expect(isDoubleActivation(first, second({ time: 1401 }))).toBe(false);
    expect(isDoubleActivation(first, second({ x: 109 }))).toBe(false);
    expect(isDoubleActivation(first, second({ itemId: 8 }))).toBe(false);
    expect(isDoubleActivation(first, second({ dragged: true }))).toBe(false);
    expect(isDoubleActivation({ ...first, dragged: true }, second({}))).toBe(false);
  });

  it("is not reported for a first release", () => {
    expect(isDoubleActivation(undefined, second({}))).toBe(false);
  });
});

// VO-036 (FR-010): handles fit exactly when both on-screen dimensions are at least 52 px.
describe("handlesFit", () => {
  it("is true at 52 px and false at 51.9 px, on each side", () => {
    expect(handlesFit({ width: 52, height: 100 }, 1)).toBe(true);
    expect(handlesFit({ width: 51.9, height: 100 }, 1)).toBe(false);
    expect(handlesFit({ width: 100, height: 52 }, 1)).toBe(true);
    expect(handlesFit({ width: 100, height: 51.9 }, 1)).toBe(false);
  });

  it("scales the size by the zoom", () => {
    expect(handlesFit({ width: 208, height: 208 }, 0.25)).toBe(true);
    expect(handlesFit({ width: 207, height: 208 }, 0.25)).toBe(false);
    expect(handlesFit({ width: 13, height: 13 }, 4)).toBe(true);
    expect(handlesFit({ width: 12.9, height: 13 }, 4)).toBe(false);
    expect(handlesFit({ width: 52, height: 52 }, 0.25)).toBe(false);
  });
});

// VO-052 (FR-011): every node, participant, actor and C4 element can end a line; a boundary never can.
describe("validEnds", () => {
  it("lists every flowchart node", () => {
    let diagram = newDiagram("f", "flowchart") as FlowchartDiagram;
    diagram = addNode(diagram, "rectangle", { x: 0, y: 0 });
    diagram = addNode(diagram, "circle", { x: 300, y: 0 });
    expect(validEnds(diagram)).toEqual(diagram.content.nodes.map((entry) => entry.id));
  });

  it("lists every participant and actor", () => {
    let diagram = newDiagram("s", "sequence") as SequenceDiagram;
    diagram = addParticipant(diagram, "participant");
    diagram = addParticipant(diagram, "actor");
    expect(validEnds(diagram)).toEqual(diagram.content.participants.map((entry) => entry.id));
  });

  it("lists the empty diagrams as having no ends", () => {
    expect(validEnds(newDiagram("f", "flowchart"))).toEqual([]);
    expect(validEnds(newDiagram("s", "sequence"))).toEqual([]);
  });

  it.each<C4Kind>(["context", "container", "component", "dynamic"])("lists every element and no boundary in a %s diagram", (kind) => {
    const diagram = fullDiagram(kind);
    const ids = walkItems(diagram.content.tree).flatMap((entry) => (entry.item === "element" ? [entry.id] : []));
    expect(ids.length).toBeGreaterThan(0);
    expect([...validEnds(diagram)].sort((a, b) => a - b)).toEqual([...ids].sort((a, b) => a - b));
  });

  it("lists elements and Deployment nodes, and no boundary, in a Deployment diagram", () => {
    const diagram = c4Diagram("deployment", [boundary(1, "system", [element(2, "container")]), node(3, [element(4, "container")])]);
    expect(validEnds(diagram)).toEqual([2, 3, 4]);
    expect(validEnds(fullDiagram("deployment"))).toEqual(expect.arrayContaining([1, 2, 3, 4, 102, 103, 104]));
  });
});
