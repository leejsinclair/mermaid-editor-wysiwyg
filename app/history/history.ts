import { apply } from "../model/apply";
import type { Operation } from "../model/operations";
import type { Diagram } from "../model/types";
import { check } from "../validation/check";
import type { CommitOutcome } from "../validation/reasons";

/** Snapshots of immutable diagrams: what Undo restores and Redo reapplies arrive with US3. */
export interface History {
  readonly past: readonly Diagram[];
  readonly present: Diagram;
  readonly future: readonly Diagram[];
  /** The group of changes the last one belongs to, while that group is open: the next change with this key joins it. */
  readonly merge?: string;
}

export function createHistory(present: Diagram): History {
  return { past: [], present, future: [] };
}

/**
 * Validates, applies and pushes one operation; a rejection returns the same history reference (FR-009). An operation
 * given the key of the open group joins the group's step instead of making a new one (FR-019); any other commit
 * starts a step of its own, and opens a group when it has a key.
 */
export function commit(history: History, operation: Operation, mergeKey?: string): { history: History; outcome: CommitOutcome } {
  const rejection = check(history.present, operation);
  if (rejection) return { history, outcome: { committed: false, rejection } };
  const present = apply(history.present, operation);
  // An operation that would change nothing is not an undo step.
  if (present === history.present) return { history, outcome: { committed: false } };
  const group = mergeKey === undefined ? {} : { merge: mergeKey };
  const joins = mergeKey !== undefined && history.merge === mergeKey && history.past.length > 0;
  return {
    history: { past: joins ? history.past : [...history.past, history.present], present, future: [], ...group },
    outcome: { committed: true },
  };
}

/** Closes the open group, so the next change makes a step of its own; the same history when none is open. */
export function seal(history: History): History {
  if (history.merge === undefined) return history;
  return { past: history.past, present: history.present, future: history.future };
}

export const canUndo = (history: History): boolean => history.past.length > 0;
export const canRedo = (history: History): boolean => history.future.length > 0;

/** Steps back one snapshot; the same history when there is nothing to undo. */
export function undo(history: History): History {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

/** Steps forward one snapshot; the same history when there is nothing to redo. */
export function redo(history: History): History {
  const [next, ...rest] = history.future;
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: rest };
}
