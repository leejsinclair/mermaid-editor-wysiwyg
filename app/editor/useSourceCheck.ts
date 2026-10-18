import { useEffect, useMemo, useState } from "react";
import { generate, type Notice } from "../generation/generate";
import type { Diagram } from "../model/types";
import { parseWithMermaid } from "./mermaidParser";
import { createSourceChecker, type CheckResult, type SourceStatus } from "./sourceCheck";

export interface CheckedSource {
  readonly source: string;
  readonly notices: readonly Notice[];
  readonly status: SourceStatus;
}

function generateOrEmpty(diagram: Diagram): { source: string; notices: readonly Notice[] } {
  try {
    return generate(diagram);
  } catch {
    return { source: "", notices: [] };
  }
}

/** The current source at once, and its check status once Mermaid has answered for this very diagram. */
export function useSourceCheck(diagram: Diagram): CheckedSource {
  const check = useMemo(() => createSourceChecker({ generate, parse: parseWithMermaid }), []);
  const [checked, setChecked] = useState<{ diagram: Diagram; result: CheckResult } | undefined>();
  const current = useMemo(() => generateOrEmpty(diagram), [diagram]);

  useEffect(() => {
    void check(diagram).then((result) => {
      if (result) setChecked({ diagram, result });
    });
  }, [check, diagram]);

  const status: SourceStatus = checked?.diagram === diagram ? checked.result.status : { kind: "checking" };
  return { ...current, status };
}
