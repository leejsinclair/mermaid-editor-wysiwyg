import { describe, expect, it } from "vitest";
import { readFlowchart } from "./flowchart";
import { scanFlowchart } from "./scan";
import type { FlowchartSnapshot } from "./snapshots";

// VO-046 (FR-014, EC-12): a click handler or link is dropped with an entry, HTML in a label is stripped with its text kept
// and reported once per label, and no markup survives in any label.

const TEXT = [
  "flowchart TD",
  '  A["<b>Pay</b> now"] --> B["<a href=\'https://evil.example\'>Go</a>"]',
  '  click A call doSomething()',
  '  click B href "https://evil.example"',
].join("\n");

const SNAPSHOT: FlowchartSnapshot = {
  direction: "TD",
  vertices: [
    { key: "A", text: "<b>Pay</b> now", shape: "square" },
    { key: "B", text: "<a href='https://evil.example'>Go</a>", shape: "square" },
  ],
  edges: [{ from: "A", to: "B", text: "", arrow: "arrow_point", stroke: "normal" }],
  subgraphs: [],
};

describe("untrusted document content", () => {
  it("keeps the text of a label without its tags, and no markup survives in any label", () => {
    const labels = readFlowchart(SNAPSHOT).nodes.map((node) => node.label);
    expect(labels).toEqual(["Pay now", "Go"]);
    for (const label of labels) expect(label).not.toMatch(/[<>]/);
  });

  it("reports each click handler or link and each label with tags as dropped, at its line", () => {
    const entries = scanFlowchart(TEXT);
    expect(entries.map((entry) => [entry.line, entry.construct, entry.category])).toEqual([
      [2, "HTML in a label", "dropped"],
      [2, "HTML in a label", "dropped"],
      [3, "click", "dropped"],
      [4, "click", "dropped"],
    ]);
  });
});
