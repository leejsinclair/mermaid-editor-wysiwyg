/** One pure step that brings a model from format version N to N + 1; `STEPS[N]` upgrades version N. */
type Step = (model: unknown) => unknown;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/** The largest item id anywhere in a model, found by walking every nested object and list. */
function largestId(value: unknown): number {
  if (Array.isArray(value)) return Math.max(0, ...(value as unknown[]).map(largestId));
  if (!isObject(value)) return 0;
  const own = typeof value.id === "number" && Number.isSafeInteger(value.id) ? value.id : 0;
  return Math.max(own, ...Object.values(value).map(largestId));
}

/** Version 0 had no item counter; version 1 added it, so it is set just above the largest id in use. */
const addItemCounter: Step = (model) =>
  isObject(model) && model.nextId === undefined ? { ...model, nextId: largestId(model.content) + 1 } : model;

const STEPS: readonly Step[] = [addItemCounter];

/** The format version this editor writes and understands (contracts/file-format.md). */
export const CURRENT_FORMAT_VERSION = 1;

/** Brings the model of a stored record or file written at `fromVersion` up to the current version, step by step. */
export function migrate(model: unknown, fromVersion: number): unknown {
  return STEPS.slice(fromVersion).reduce((value, step) => step(value), model);
}
