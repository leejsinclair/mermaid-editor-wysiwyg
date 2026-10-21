import { MAX_C4_DEPTH, MAX_FILE_BYTES } from "../model/limits";
import type { C4Item, C4Kind, Diagram, DiagramModel } from "../model/types";
import { checkDiagram } from "../validation/checkDiagram";
import { readC4 } from "./c4";
import { c4KindsIn, detectType, splitDocument } from "./document";
import { readFlowchart } from "./flowchart";
import { nameFor } from "./naming";
import type { Outcome, ReadDeps } from "./outcome";
import { readSequence } from "./sequence";
import { scanC4, scanFlowchart, scanSequence } from "./scan";
import type { ReportEntry } from "./report";
import { en } from "../text/en";
import { fill } from "../text/fill";
import type { Detection, SplitDocument } from "./types";

// Reads one document into an Outcome (contracts/import-reading.md, "Order of work"). Never throws.
// The diagram has no id and no change time here: saving it gives it both (createImported).

const encoder = new TextEncoder();

/** The deepest nesting of boundaries and Deployment nodes, counted in levels. */
function depthOf(items: readonly C4Item[]): number {
  return items.reduce((deepest, item) => (item.item === "element" ? deepest : Math.max(deepest, 1 + depthOf(item.children))), 0);
}

const frontTitle = (split: SplitDocument): string | undefined => split.frontMatter?.title;

async function flowchartModel(split: SplitDocument, deps: ReadDeps): Promise<DiagramModel> {
  const read = readFlowchart(await deps.snapshotFlowchart(split.text));
  const name = nameFor({ type: "flowchart", frontMatterTitle: frontTitle(split) });
  return { name, type: "flowchart", nextId: read.nextId, content: { nodes: [...read.nodes], connections: [...read.connections] } };
}

async function sequenceModel(split: SplitDocument, deps: ReadDeps): Promise<DiagramModel> {
  const read = readSequence(await deps.snapshotSequence(split.text));
  const name = nameFor({ type: "sequence", frontMatterTitle: frontTitle(split) });
  return { name, type: "sequence", nextId: read.nextId, content: { participants: [...read.participants], messages: [...read.messages] } };
}

/** A C4 model, or a refusal when the document nests deeper than the editor holds. */
function c4Model(split: SplitDocument, kind: C4Kind): DiagramModel | Outcome {
  const read = readC4(split.text, kind);
  if (depthOf(read.tree) > MAX_C4_DEPTH) return { kind: "refused", reason: "tooDeep", limit: MAX_C4_DEPTH };
  const name = nameFor({ type: "c4", kind, c4Title: read.title, frontMatterTitle: frontTitle(split) });
  return { name, type: "c4", kind, title: read.title, nextId: read.nextId, content: { tree: [...read.tree], relationships: [...read.relationships] } };
}

async function modelOf(split: SplitDocument, detection: Detection, deps: ReadDeps): Promise<DiagramModel | Outcome> {
  if (detection.type === "flowchart") return flowchartModel(split, deps);
  if (detection.type === "sequence") return sequenceModel(split, deps);
  if (detection.type === "c4") return c4Model(split, detection.kind);
  return { kind: "unsupported", found: "" };
}

/** Every diagram model has a `type`; no outcome does. */
/** The scanner that lists what the document's type does not import (VO-055): none is silent. */
function scannerFor(detection: Detection): (text: string) => ReportEntry[] {
  switch (detection.type) {
    case "flowchart":
      return scanFlowchart;
    case "sequence":
      return scanSequence;
    case "c4":
      return scanC4;
    default:
      return () => [];
  }
}

/** The report's entries, with lines counted from the text the developer sees (the first block of a Markdown file). */
function reportOf(split: SplitDocument, detection: Detection): ReportEntry[] {
  const scanned = scannerFor(detection)(split.text);
  const shifted = scanned.map((entry) => ({ ...entry, line: entry.line + split.lineOffset }));
  // Each further Mermaid block, and a second header inside the block, was not imported; it is listed with its start.
  const ignored = split.ignored.map((block) => ({
    line: block.line,
    category: "ignored" as const,
    construct: "mermaid block",
    reason: fill(en.importMermaid.ignoredBlock, { first: block.firstLine }),
  }));
  return [...shifted, ...ignored].sort((a, b) => a.line - b.line);
}

/** A C4 document whose kind cannot be found, or that mixes kinds, is refused before parsing, naming the kinds (EC-06). */
function kindRefusal(split: SplitDocument, detection: Detection): Outcome | undefined {
  if (detection.type === "c4") {
    const kinds = c4KindsIn(split.text);
    return kinds.length > 1 ? { kind: "refused", reason: "kindsMixed", kinds } : undefined;
  }
  if (detection.type === "unsupported" && detection.found.startsWith("C4")) return { kind: "refused", reason: "kindUndetected" };
  return undefined;
}

const isOutcome = (value: DiagramModel | Outcome): value is Outcome => !("type" in value);

export async function readDocument(text: string, deps: ReadDeps): Promise<Outcome> {
  if (text.trim() === "") return { kind: "empty" };
  if (encoder.encode(text).byteLength > MAX_FILE_BYTES) return { kind: "refused", reason: "tooLarge", limit: MAX_FILE_BYTES };

  const split = splitDocument(text);
  const detection = detectType(split.text);
  const refusal = kindRefusal(split, detection);
  if (refusal !== undefined) return refusal;
  const parsed = await deps.parse(split.text);
  if (!parsed.ok) return { kind: "invalid", message: parsed.message, line: parsed.line + split.lineOffset, column: parsed.column };
  if (detection.type === "none") return { kind: "unsupported", found: "" };
  if (detection.type === "unsupported") return { kind: "unsupported", found: detection.found };

  const model = await modelOf(split, detection, deps);
  if (isOutcome(model)) return model;
  const check = checkDiagram(model);
  if (!check.ok) return { kind: "refused", reason: "notValid" };
  const diagram = { ...check.model, id: "", changedAt: "" } as Diagram;
  return { kind: "ready", diagram, name: diagram.name, detection, report: reportOf(split, detection) };
}
