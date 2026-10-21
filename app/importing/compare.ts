// The line comparison behind the Compare view (data-model.md, "Compare line"). Lines both texts share at the start and the
// end are matched first; Myers' O(ND) difference finds the fewest removed and added lines in the middle, in memory that
// grows with the number of edits, not with lines × lines (feature 006, FR-010, research R8). A run of removed lines
// followed by added lines is paired into changed lines, in order.

export type CompareKind = "same" | "changed" | "removed" | "added";

export interface CompareLine {
  readonly kind: CompareKind;
  readonly original?: string | undefined;
  readonly generated?: string | undefined;
  readonly originalLine?: number | undefined;
  readonly generatedLine?: number | undefined;
}

export interface CompareResult {
  readonly lines: readonly CompareLine[];
  /** True when the texts were too different to compare exactly and the middle is shown in simple form. */
  readonly simplified: boolean;
}

/** One step of the walk: a line both sides share (both indices), or a line only one side has (its index on that side). */
type Step = { readonly op: "same"; readonly i: number; readonly j: number } | { readonly op: "removed"; readonly i: number } | { readonly op: "added"; readonly j: number };

/**
 * One edit further along every diagonal k in -d..d: from the furthest x of the diagonal above or below, then down the run
 * of shared lines. True once a diagonal reaches the end of both texts.
 */
function advance(a: readonly string[], b: readonly string[], frontier: Int32Array, offset: number, d: number): boolean {
  for (let k = -d; k <= d; k += 2) {
    const down = k === -d || (k !== d && (frontier.at(offset + k - 1) ?? 0) < (frontier.at(offset + k + 1) ?? 0));
    let x = down ? (frontier.at(offset + k + 1) ?? 0) : (frontier.at(offset + k - 1) ?? 0) + 1;
    let y = x - k;
    while (x < a.length && y < b.length && a.at(x) === b.at(y)) {
      x += 1;
      y += 1;
    }
    frontier.set([x], offset + k);
    if (x >= a.length && y >= b.length) return true;
  }
  return false;
}

/** The most edits compared exactly; past it the middle is shown in simple form (Clarification 2, research R8). */
const WORK_LIMIT = 2000;

/**
 * Myers' shortest edit script turning a into b, as steps, or none when it needs more than WORK_LIMIT edits. `trace[d]`
 * keeps the furthest x reached on each diagonal k in -d-1..d+1 before edit d, so the path can be followed back; its
 * size grows with the edits (at most about 4 million numbers), never with lines × lines.
 */
function myers(a: readonly string[], b: readonly string[]): Step[] | undefined {
  const offset = a.length + b.length + 1;
  const frontier = new Int32Array(2 * offset + 1);
  const trace: Int32Array[] = [];
  for (let d = 0; d <= Math.min(a.length + b.length, WORK_LIMIT); d += 1) {
    trace.push(frontier.slice(offset - d - 1, offset + d + 2));
    if (advance(a, b, frontier, offset, d)) return backtrack(a.length, b.length, trace);
  }
  return undefined;
}

/** The simple form: every line of a's middle removed and every line of b's middle added, to be paired as changed. */
function simpleMiddle(a: readonly string[], b: readonly string[]): Step[] {
  return [...a.map((_, i): Step => ({ op: "removed", i })), ...b.map((_, j): Step => ({ op: "added", j }))];
}

/** The point edit d came from, given where it ended: the end of the diagonal above or below. */
function previousPoint(before: Int32Array, d: number, x: number, y: number): { readonly x: number; readonly y: number } {
  if (d === 0) return { x: 0, y: 0 };
  const at = (k: number): number => before.at(k + d + 1) ?? 0;
  const k = x - y;
  const previousK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
  return { x: at(previousK), y: at(previousK) - previousK };
}

/** Follows the trace back from the end of both texts to the start, giving the steps in order. */
function backtrack(n: number, m: number, trace: readonly Int32Array[]): Step[] {
  const steps: Step[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d -= 1) {
    const previous = previousPoint(trace.at(d) ?? new Int32Array(0), d, x, y);
    for (; x > previous.x && y > previous.y; x -= 1, y -= 1) steps.push({ op: "same", i: x - 1, j: y - 1 });
    if (d > 0) steps.push(x === previous.x ? { op: "added", j: previous.y } : { op: "removed", i: previous.x });
    x = previous.x;
    y = previous.y;
  }
  return steps.reverse();
}

/** The steps for two whole texts: shared lines at the start and end matched first, Myers (or the simple form) in between. */
function walk(a: readonly string[], b: readonly string[]): { readonly steps: Step[]; readonly simplified: boolean } {
  let head = 0;
  while (head < a.length && head < b.length && a.at(head) === b.at(head)) head += 1;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a.at(-1 - tail) === b.at(-1 - tail)) tail += 1;
  const middleA = a.slice(head, a.length - tail);
  const middleB = b.slice(head, b.length - tail);
  const exact = myers(middleA, middleB);
  const middle = (exact ?? simpleMiddle(middleA, middleB)).map((step): Step => {
    if (step.op === "same") return { op: "same", i: step.i + head, j: step.j + head };
    if (step.op === "removed") return { op: "removed", i: step.i + head };
    return { op: "added", j: step.j + head };
  });
  const start = Array.from({ length: head }, (_, index): Step => ({ op: "same", i: index, j: index }));
  const end = Array.from({ length: tail }, (_, index): Step => ({ op: "same", i: a.length - tail + index, j: b.length - tail + index }));
  return { steps: [...start, ...middle, ...end], simplified: exact === undefined };
}

/** Compares two texts line by line. Each line is same, changed (a removed and an added line paired), removed or added. */
export function compareLines(original: string, generated: string): CompareResult {
  const a = original.split("\n");
  const b = generated.split("\n");
  const out: CompareLine[] = [];
  let removed: number[] = [];
  let added: number[] = [];
  const flush = (): void => {
    const count = Math.max(removed.length, added.length);
    for (let k = 0; k < count; k += 1) {
      const i = removed[k];
      const j = added[k];
      if (i !== undefined && j !== undefined) {
        out.push({ kind: "changed", original: a[i], generated: b[j], originalLine: i + 1, generatedLine: j + 1 });
      } else if (i !== undefined) {
        out.push({ kind: "removed", original: a[i], originalLine: i + 1 });
      } else if (j !== undefined) {
        out.push({ kind: "added", generated: b[j], generatedLine: j + 1 });
      }
    }
    removed = [];
    added = [];
  };
  const { steps, simplified } = walk(a, b);
  for (const step of steps) {
    if (step.op === "removed") removed.push(step.i);
    else if (step.op === "added") added.push(step.j);
    else {
      flush();
      out.push({ kind: "same", original: a[step.i], generated: b[step.j], originalLine: step.i + 1, generatedLine: step.j + 1 });
    }
  }
  flush();
  return { lines: out, simplified };
}
