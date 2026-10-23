import type { C4Kind, Diagram, DiagramModel } from "../model/types";
import { en } from "../text/en";
import { fill } from "../text/fill";
import { checkDiagram } from "../validation/checkDiagram";
import { CURRENT_FORMAT_VERSION, migrate } from "./migrations";

export const FILE_FORMAT = "mermaid-editor-wysiwyg";

export type FileRefusalReason = "fileTooLarge" | "notJson" | "notEditorFile" | "newerVersion" | "invalidDiagram";

export type ParsedFile =
  | { readonly ok: true; readonly model: DiagramModel }
  | { readonly ok: false; readonly reason: FileRefusalReason; readonly message: string };

const refuse = (reason: FileRefusalReason, problem = ""): ParsedFile => ({
  ok: false,
  reason,
  // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
  message: fill(en.fileRefusals[reason], { problem }),
});

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Reads the text of a diagram file, stopping at the first failure with nothing opened (contracts/file-format.md, Open 2 to 5). */
export function parseFile(text: string): ParsedFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return refuse("notJson");
  }
  if (!isRecord(parsed) || parsed.format !== FILE_FORMAT) return refuse("notEditorFile");
  const version = parsed.formatVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 0) return refuse("notEditorFile");
  if (version > CURRENT_FORMAT_VERSION) return refuse("newerVersion");
  const checked = checkDiagram(migrate(parsed.diagram, version));
  return checked.ok ? { ok: true, model: checked.model } : refuse("invalidDiagram", checked.problem);
}

/** The stored form of a diagram (contracts/file-format.md, Browser storage). */
export interface DiagramRecord {
  /** The tab that may write this record: tab id and the turn it took the diagram on (set by the store). */
  readonly owner?: string;
  readonly id: string;
  readonly name: string;
  readonly type: Diagram["type"];
  readonly kind?: C4Kind;
  readonly changedAt: string;
  readonly formatVersion: number;
  readonly model: DiagramModel;
}

/** The file form of a diagram: the editor's format, without the id and the last-changed time. */
export interface DiagramFile {
  readonly format: typeof FILE_FORMAT;
  readonly formatVersion: number;
  readonly diagram: DiagramModel;
}

export type ReadRecord = { readonly ok: true; readonly diagram: Diagram } | { readonly ok: false; readonly problem: string };

/** The model of a diagram: everything that is saved, which is all but the id and the last-changed time. */
function modelOf(diagram: Diagram): DiagramModel {
  return Object.fromEntries(Object.entries(diagram).filter(([key]) => key !== "id" && key !== "changedAt")) as DiagramModel;
}

export function toRecord(diagram: Diagram): DiagramRecord {
  const model = modelOf(diagram);
  return {
    id: diagram.id,
    name: diagram.name,
    type: diagram.type,
    ...(diagram.type === "c4" && { kind: diagram.kind }),
    changedAt: diagram.changedAt,
    formatVersion: CURRENT_FORMAT_VERSION,
    model,
  };
}

/** Reads a stored record: migrated, then checked like a file, so a damaged record is told apart and never opened. */
export function fromRecord(record: unknown): ReadRecord {
  if (!isRecord(record) || typeof record.id !== "string" || typeof record.changedAt !== "string") {
    return { ok: false, problem: en.problems.notRecord };
  }
  const version = record.formatVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 0) return { ok: false, problem: en.problems.notRecord };
  if (version > CURRENT_FORMAT_VERSION) return { ok: false, problem: en.problems.newerRecord };
  const checked = checkDiagram(migrate(record.model, version));
  if (!checked.ok) return checked;
  return { ok: true, diagram: { ...checked.model, id: record.id, changedAt: record.changedAt } };
}

export function toFile(diagram: Diagram): DiagramFile {
  return { format: FILE_FORMAT, formatVersion: CURRENT_FORMAT_VERSION, diagram: modelOf(diagram) };
}
