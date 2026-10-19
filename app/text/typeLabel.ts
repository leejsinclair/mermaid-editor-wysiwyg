import type { C4Kind, DiagramType } from "../model/types";
import { en } from "./en";
import { fill } from "./fill";

const KIND_NAMES = new Map<string, string>(Object.entries(en.start.kinds));

/** "Flowchart", "Sequence diagram" or "C4 Context diagram": the type of a diagram, with the kind for C4. */
export function typeLabel(type: DiagramType, kind?: C4Kind): string {
  if (type === "flowchart") return en.editor.types.flowchart;
  if (type === "sequence") return en.editor.types.sequence;
  return fill(en.editor.types.c4, { kind: (kind && KIND_NAMES.get(kind)) ?? kind ?? "" });
}
