import type { Operation } from "../model/operations";
import { isVisible } from "./label";
import type { Rejection } from "./reasons";

/** Checks that hold for every diagram type: today the diagram name. */
export function checkDiagramWide(operation: Operation): Rejection | undefined {
  return operation.op === "renameDiagram" && !isVisible(operation.name) ? { reason: "blankName" } : undefined;
}
