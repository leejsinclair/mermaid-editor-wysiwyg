import { describe, expect, it } from "vitest";
import { readFlowchart } from "./flowchart";
import { scanC4, scanFlowchart, scanSequence } from "./scan";
import type { FlowchartSnapshot } from "./snapshots";

// VO-017 (FR-006, US2-AS1): unsupported flowchart constructs each have one report entry with their line and a reason; the
// supported nodes and connections are kept, including the nodes of a dropped subgraph (contracts/import-reading.md).

const DOCUMENT = [
  "flowchart LR",
  "  subgraph Billing",
  "    A[Invoice] --> B[Pay]",
  "  end",
  "  classDef hot fill:#f96",
  "  class A hot",
  "  style B fill:#0f0",
  "  linkStyle 0 stroke:#333",
  '  click A "https://example.com"',
  "  C:::hot --> A",
].join("\n");

const SNAPSHOT: FlowchartSnapshot = {
  direction: "LR",
  vertices: [
    { key: "A", text: "Invoice", shape: "square" },
    { key: "B", text: "Pay", shape: "square" },
    { key: "C", text: "C", shape: "" },
  ],
  edges: [
    { from: "A", to: "B", text: "", arrow: "arrow_point", stroke: "normal" },
    { from: "C", to: "A", text: "", arrow: "arrow_point", stroke: "normal" },
  ],
  subgraphs: [{ id: "Billing", title: "Billing" }],
};

describe("scanFlowchart", () => {
  it("gives each unsupported construct one entry, at its line, with a reason", () => {
    const entries = scanFlowchart(DOCUMENT);
    expect(entries.map((entry) => [entry.line, entry.construct, entry.category])).toEqual([
      [2, "subgraph", "dropped"],
      [5, "classDef", "dropped"],
      [6, "class", "dropped"],
      [7, "style", "dropped"],
      [8, "linkStyle", "dropped"],
      [9, "click", "dropped"],
      [10, "class", "dropped"],
    ]);
    for (const entry of entries) expect(entry.reason.length).toBeGreaterThan(0);
  });

  it("keeps the supported nodes and connections, including the nodes of the dropped subgraph", () => {
    const result = readFlowchart(SNAPSHOT);
    expect(result.nodes.map((node) => node.label)).toEqual(["Invoice", "Pay", "C"]);
    expect(result.connections.map((connection) => [connection.from, connection.to])).toEqual([
      [1, 2],
      [3, 1],
    ]);
  });
});

// VO-018 (FR-006, EC-05): a sequence's blocks, notes, activations, numbering, create and destroy, boxes and links are each
// reported at their line; a message kept inside a block names that block in its entry.

const SEQUENCE = [
  "sequenceDiagram",
  "  Alice->>Bob: Hi",
  "  loop Every minute",
  "    Bob-->>Alice: Ping",
  "  else Fallback",
  "    Bob->>Alice: Pong",
  "  end",
  "  Note over Alice: hi",
  "  activate Bob",
  "  Alice->>+Bob: call",
  "  deactivate Bob",
  "  autonumber",
  "  create participant C",
  "  destroy C",
  "  box Blue Group",
  "    participant D",
  "  end",
  "  link Alice: Dashboard @ https://example.com",
].join("\n");

describe("scanSequence", () => {
  it("reports each block line, note, activation, numbering, create, destroy, box and link at its line", () => {
    const entries = scanSequence(SEQUENCE);
    expect(entries.map((entry) => [entry.line, entry.construct, entry.category])).toEqual([
      [3, "loop", "dropped"],
      [4, "message", "approximated"],
      [5, "else", "dropped"],
      [6, "message", "approximated"],
      [7, "end", "dropped"],
      [8, "note", "dropped"],
      [9, "activation", "dropped"],
      [10, "activation", "dropped"],
      [11, "activation", "dropped"],
      [12, "autonumber", "dropped"],
      [13, "create", "dropped"],
      [14, "destroy", "dropped"],
      [15, "box", "dropped"],
      [17, "end", "dropped"],
      [18, "link", "dropped"],
    ]);
  });

  it("names the block each kept message was inside", () => {
    const entries = scanSequence(SEQUENCE).filter((entry) => entry.construct === "message");
    expect(entries.map((entry) => entry.reason)).toEqual([
      expect.stringContaining("loop Every minute"),
      expect.stringContaining("loop Every minute"),
    ]);
  });
});

// VO-019 (FR-006): C4 styling and layout lines, direction hints, and a relationship to an alias never declared are each
// reported at their line; the direction hint keeps its relationship, an undeclared end drops it.

const C4 = [
  "C4Context",
  "  title Bank",
  '  Person(cust, "Customer")',
  '  System(core, "Core")',
  '  UpdateElementStyle(cust, $bgColor="red")',
  '  UpdateRelStyle(cust, core, $offsetY="-10")',
  '  UpdateLayoutConfig($c4ShapeInRow="3")',
  '  AddElementTag("internal", $bgColor="grey")',
  "  LAYOUT_WITH_LEGEND()",
  '  Rel_U(core, cust, "Replies")',
  '  Rel(cust, ghost, "Calls")',
].join("\n");

describe("scanC4", () => {
  it("reports styling, layout, direction hints and an undeclared end, each at its line", () => {
    const entries = scanC4(C4);
    expect(entries.map((entry) => [entry.line, entry.construct, entry.category])).toEqual([
      [5, "UpdateElementStyle", "dropped"],
      [6, "UpdateRelStyle", "dropped"],
      [7, "UpdateLayoutConfig", "dropped"],
      [8, "AddElementTag", "dropped"],
      [9, "LAYOUT_WITH_LEGEND", "dropped"],
      [10, "Rel_U", "approximated"],
      [11, "relationship", "dropped"],
    ]);
  });
});

// VO-048 (EC-01): front matter, an init directive and accTitle and accDescr lines are not diagram elements: each is reported
// as ignored at its line, the front-matter title names the diagram, and the diagram is unaffected.

const WITH_IGNORED = [
  "---",
  "title: Login flow",
  "---",
  "%%{init: {'theme': 'dark'}}%%",
  "flowchart TD",
  "  accTitle: Login",
  "  accDescr: How a user logs in",
  "  A[Start] --> B[End]",
].join("\n");

describe("ignored lines", () => {
  it("reports front matter, a directive and the accessibility lines as ignored, each at its line", () => {
    const ignored = scanFlowchart(WITH_IGNORED).filter((entry) => entry.category === "ignored");
    expect(ignored.map((entry) => [entry.line, entry.construct])).toEqual([
      [1, "front matter"],
      [4, "directive"],
      [6, "accTitle"],
      [7, "accDescr"],
    ]);
  });

  it("uses the front-matter title as the name and leaves the diagram as it is", () => {
    const result = readFlowchart({
      direction: "TD",
      vertices: [
        { key: "A", text: "Start", shape: "square" },
        { key: "B", text: "End", shape: "square" },
      ],
      edges: [{ from: "A", to: "B", text: "", arrow: "arrow_point", stroke: "normal" }],
      subgraphs: [],
    });
    expect(result.nodes.map((node) => node.label)).toEqual(["Start", "End"]);
    expect(result.connections).toHaveLength(1);
  });
});
