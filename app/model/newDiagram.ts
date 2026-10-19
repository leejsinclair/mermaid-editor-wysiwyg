import { en } from "../text/en";
import { fill } from "../text/fill";
import type { C4Kind, Diagram, DiagramType } from "./types";

/** An empty diagram of a type (and, for C4, a kind). The id is chosen by the caller so this stays pure. */
export function newDiagram(id: string, type: "flowchart" | "sequence"): Diagram;
export function newDiagram(id: string, type: "c4", kind: C4Kind): Diagram;
export function newDiagram(id: string, type: DiagramType, kind?: C4Kind): Diagram {
  const base = { id, nextId: 1, changedAt: "" };
  switch (type) {
    case "flowchart":
      return { ...base, name: en.diagramName.flowchart, type, content: { nodes: [], connections: [] } };
    case "sequence":
      return { ...base, name: en.diagramName.sequence, type, content: { participants: [], messages: [] } };
    case "c4":
      if (kind === undefined) throw new Error("A C4 diagram needs a kind");
      return { ...base, name: fill(en.diagramName.c4, { kind }), type, kind, title: "", content: { tree: [], relationships: [] } };
  }
}
