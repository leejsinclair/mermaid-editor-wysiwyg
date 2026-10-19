// Test support: applies operations to a history, expecting each to be accepted.
import { commit, type History } from "../history/history";
import type { Operation } from "../model/operations";

/** Applies each operation in turn, expecting every one to be committed. */
export function run(history: History, ...operations: Operation[]): History {
  return operations.reduce((current, operation) => {
    const result = commit(current, operation);
    if (!result.outcome.committed) throw new Error(`${operation.op} was not committed: ${JSON.stringify(result.outcome)}`);
    return result.history;
  }, history);
}
