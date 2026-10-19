// Why an operation was rejected, and the outcome of a commit (contracts/operations.md).

export const REJECTION_REASONS = [
  "blankName",
  "unknownItem",
  "unknownEndpoint",
  "blankLabel",
  "blankMessage",
  "blankRelationshipLabel",
  "noSuchField",
  "crossFamily",
  "notOfferedInKind",
  "typeFixed",
  "endNotAllowed",
  "reverseSelf",
  "reverseUndirected",
  "unknownShape",
  "outOfRange",
  "parentNotAllowed",
  "nestingCycle",
  "needsSelection",
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];

export interface Rejection {
  readonly reason: RejectionReason;
  /** Values the fixed sentence names, for example the `from` and `to` types of `crossFamily`. */
  readonly details?: Readonly<Record<string, string>>;
}

/** The result of `commit`: accepted, unchanged with no rejection (nothing to change), or rejected. */
export type CommitOutcome =
  | { readonly committed: true }
  | { readonly committed: false; readonly rejection?: Rejection };
