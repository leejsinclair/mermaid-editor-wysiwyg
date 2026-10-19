import type { Operation } from "../model/operations";
import type { Diagram } from "../model/types";
import { checkDiagramWide } from "./diagram";
import { checkC4 } from "./c4";
import { checkFlowchart } from "./flowchart";
import { checkSequence } from "./sequence";
import type { Rejection } from "./reasons";

/** Operations only a C4 diagram has. */
const C4_ONLY: ReadonlySet<Operation["op"]> = new Set(["addElement", "addContainer", "addRelationship", "moveToParent", "setTitle"]);

/** Decides whether an operation may be committed to a diagram: a rejection, or undefined to accept. */
export function check(diagram: Diagram, operation: Operation): Rejection | undefined {
  const shared = checkDiagramWide(operation);
  if (shared) return shared;
  if (diagram.type !== "c4" && C4_ONLY.has(operation.op)) return { reason: "notOfferedInKind", details: { kind: diagram.type } };
  if (diagram.type === "flowchart") return checkFlowchart(diagram, operation);
  if (diagram.type === "sequence") return checkSequence(diagram, operation);
  return checkC4(diagram, operation);
}
