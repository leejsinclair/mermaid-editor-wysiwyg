import type { C4Kind } from "./types";

const C4_KINDS: ReadonlySet<string> = new Set<C4Kind>(["context", "container", "component", "dynamic", "deployment"]);

export function isC4Kind(value: string | undefined): value is C4Kind {
  return value !== undefined && C4_KINDS.has(value);
}
