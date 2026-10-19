import type { Diagram } from "../model/types";
import { generateC4 } from "./c4";
import { generateFlowchart } from "./flowchart";
import { generateSequence } from "./sequence";

export interface Notice {
  readonly code: string;
  readonly text: string;
}

/** Notices for which Mermaid 12.2 is known to reject an otherwise correct C4 source (research R6). */
export const KNOWN_C4_NOTICE_CODES: ReadonlySet<string> = new Set(["c4-empty", "c4-empty-container"]);

export interface Generated {
  readonly source: string;
  readonly notices: readonly Notice[];
}

/** A pure, deterministic function of the model (DC-03). */
export function generate(diagram: Diagram): Generated {
  if (diagram.type === "flowchart") return { source: generateFlowchart(diagram), notices: [] };
  if (diagram.type === "sequence") return { source: generateSequence(diagram), notices: [] };
  return generateC4(diagram);
}
