import { newDiagram } from "../model/newDiagram";
import type { C4Kind, DiagramType } from "../model/types";

export interface NameSource {
  readonly frontMatterTitle?: string | undefined;
  readonly c4Title?: string | undefined;
  readonly type: DiagramType;
  readonly kind?: C4Kind;
}

/** The name a new diagram from this document gets (FR-011): a non-blank front-matter title, else a non-blank C4 title, else the default name. */
export function nameFor(source: NameSource): string {
  const frontMatter = source.frontMatterTitle?.trim() ?? "";
  if (frontMatter !== "") return frontMatter;
  const c4 = source.c4Title?.trim() ?? "";
  if (c4 !== "") return c4;
  if (source.type === "c4") return newDiagram("name", "c4", source.kind ?? "context").name;
  return newDiagram("name", source.type).name;
}
