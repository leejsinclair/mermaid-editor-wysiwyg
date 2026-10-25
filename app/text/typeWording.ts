import type { DiagramType } from "../model/types";
import { en } from "./en";

/** What the canvas says to a person starting a diagram of one type: the three steps, and the prompts while a line is drawn. */
export interface TypeWording {
  /** The empty-canvas hint and the getting-started help, one line per step. */
  readonly steps: readonly string[];
  /** Said while the start of a connection, message or relationship is being chosen. */
  readonly connectSource: string;
  /** Said while its end is being chosen. */
  readonly connectDestination: string;
}

/** A type's catalogued wording as the canvas and the Properties panel use it. */
const wordingOf = (own: { readonly gettingStarted: Readonly<Record<string, string>>; readonly connectSource: string; readonly connectDestination: string }): TypeWording => ({
  steps: Object.values(own.gettingStarted),
  connectSource: own.connectSource,
  connectDestination: own.connectDestination,
});

const FLOWCHART = wordingOf(en.canvasHelp);

const WORDING = new Map<DiagramType, TypeWording>([
  ["flowchart", FLOWCHART],
  ["sequence", wordingOf(en.canvasHelp.byType.sequence)],
  ["c4", wordingOf(en.canvasHelp.byType.c4)],
]);

/** The wording for a diagram type, in that type's own element names (FR-001, FR-007, Clarifications 2026-10-24). */
export function typeWording(type: DiagramType): TypeWording {
  return WORDING.get(type) ?? FLOWCHART;
}
