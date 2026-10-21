import { describe, expect, it } from "vitest";
import { MAX_X, MAX_Y, NODE_HEIGHT, NODE_WIDTH } from "../model/flowchart/freePosition";
import { layoutFlowchart, type Direction, type LayoutInput, type Point } from "./layout";

// VO-025 (FR-008, EC-07): the layered layout follows the direction keyword, puts connected nodes in neighbouring ranks,
// spaces ranks evenly, never overlaps two nodes, is deterministic, and holds 500 nodes in under 100 ms.

const DIRECTIONS: readonly Direction[] = ["TD", "LR", "RL", "BT"];

/** The coordinate that grows along the flow: y for TD, -y for BT, x for LR, -x for RL. */
function alongFlow(direction: Direction, point: Point): number {
  switch (direction) {
    case "TD":
      return point.y;
    case "BT":
      return -point.y;
    case "LR":
      return point.x;
    case "RL":
      return -point.x;
  }
}

function overlaps(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < NODE_WIDTH && Math.abs(a.y - b.y) < NODE_HEIGHT;
}

function expectNoOverlaps(positions: ReadonlyMap<number, Point>): void {
  const points = [...positions.values()];
  points.forEach((point, index) => {
    for (const other of points.slice(index + 1)) {
      expect(overlaps(point, other)).toBe(false);
    }
  });
}

function expectWithinBounds(positions: ReadonlyMap<number, Point>): void {
  for (const point of positions.values()) {
    expect(Number.isInteger(point.x) && Number.isInteger(point.y)).toBe(true);
    expect(point.x).toBeGreaterThanOrEqual(0);
    expect(point.y).toBeGreaterThanOrEqual(0);
    expect(point.x).toBeLessThanOrEqual(MAX_X);
    expect(point.y).toBeLessThanOrEqual(MAX_Y);
  }
}

const chain: LayoutInput = { ids: [1, 2, 3], edges: [{ from: 1, to: 2 }, { from: 2, to: 3 }], direction: "TD" };
const fanOut: LayoutInput = {
  ids: [1, 2, 3, 4],
  edges: [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 }],
  direction: "TD",
};
const cycle: LayoutInput = {
  ids: [1, 2, 3],
  edges: [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }],
  direction: "TD",
};
const selfLoopAndIsolated: LayoutInput = {
  ids: [1, 2, 5],
  edges: [{ from: 1, to: 2 }, { from: 2, to: 2 }],
  direction: "TD",
};

function large(): LayoutInput {
  const ids = Array.from({ length: 500 }, (_, index) => index + 1);
  const chainEdges = ids.flatMap((from) => (from < ids.length ? [{ from, to: from + 1 }] : []));
  const skipEdges = ids.filter((_, index) => index % 5 === 0 && index + 7 < ids.length).map((from) => ({ from, to: from + 7 }));
  return { ids, edges: [...chainEdges, ...skipEdges], direction: "LR" };
}

describe("layoutFlowchart", () => {
  for (const direction of DIRECTIONS) {
    it(`places each edge's end in a later rank along ${direction}, for a chain and a fan-out`, () => {
      for (const input of [chain, fanOut]) {
        const positions = layoutFlowchart({ ...input, direction });
        for (const edge of input.edges) {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (from === undefined || to === undefined) throw new Error(`edge ${String(edge.from)} to ${String(edge.to)} has no position`);
          expect(alongFlow(direction, to)).toBeGreaterThan(alongFlow(direction, from));
        }
      }
    });

    it(`keeps ranks evenly spaced, with no overlap and whole coordinates in bounds, along ${direction}`, () => {
      const positions = layoutFlowchart({ ...fanOut, direction });
      const ranks = [...new Set([...positions.values()].map((point) => alongFlow(direction, point)))].sort((a, b) => a - b);
      const lower = ranks.slice(0, -1);
      const steps = ranks.slice(1).map((rank, index) => rank - (lower.at(index) ?? rank));
      expect(new Set(steps).size).toBeLessThanOrEqual(1);
      expectNoOverlaps(positions);
      expectWithinBounds(positions);
    });

    it(`lays out a cycle, a self-loop and a disconnected node without error along ${direction}`, () => {
      const cyclePositions = layoutFlowchart({ ...cycle, direction });
      expect(cyclePositions.size).toBe(3);
      expectNoOverlaps(cyclePositions);
      const selfPositions = layoutFlowchart({ ...selfLoopAndIsolated, direction });
      expect(selfPositions.size).toBe(3);
      expectNoOverlaps(selfPositions);
      expectWithinBounds(selfPositions);
    });

    it(`gives identical positions on every run along ${direction}`, () => {
      const first = layoutFlowchart({ ...fanOut, direction });
      const second = layoutFlowchart({ ...fanOut, direction });
      expect([...second]).toEqual([...first]);
    });
  }

  it("lays out 500 nodes in under 100 ms", () => {
    const input = large();
    const started = performance.now();
    const positions = layoutFlowchart(input);
    const elapsed = performance.now() - started;
    expect(positions.size).toBe(500);
    expect(elapsed).toBeLessThan(100);
  });
});
