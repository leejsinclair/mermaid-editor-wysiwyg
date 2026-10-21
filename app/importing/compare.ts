// The line comparison behind the Compare view (data-model.md, "Compare line"): a longest-common-subsequence diff over
// lines. A run of removed lines followed by added lines is paired into changed lines, in order.

export type CompareKind = "same" | "changed" | "removed" | "added";

export interface CompareLine {
  readonly kind: CompareKind;
  readonly original?: string | undefined;
  readonly generated?: string | undefined;
  readonly originalLine?: number | undefined;
  readonly generatedLine?: number | undefined;
}

/** One step of the walk: a line both sides share (both indices), or a line only one side has (its index on that side). */
type Step = { readonly op: "same"; readonly i: number; readonly j: number } | { readonly op: "removed"; readonly i: number } | { readonly op: "added"; readonly j: number };

/** table[i][j] is the length of the longest common subsequence of the lines from i and from j onwards. */
function suffixTable(a: readonly string[], b: readonly string[]): number[][] {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      const row = table[i] ?? [];
      const below = table[i + 1] ?? [];
      row[j] = a[i] === b[j] ? (below[j + 1] ?? 0) + 1 : Math.max(below[j] ?? 0, row[j + 1] ?? 0);
    }
  }
  return table;
}

/** Walks the two texts from the start: a shared line, or else the line that only one side has. */
function walk(a: readonly string[], b: readonly string[]): Step[] {
  const table = suffixTable(a, b);
  const out: Step[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ op: "same", i, j });
      i += 1;
      j += 1;
    } else if ((table[i + 1]?.[j] ?? 0) >= (table[i]?.[j + 1] ?? 0)) {
      out.push({ op: "removed", i });
      i += 1;
    } else {
      out.push({ op: "added", j });
      j += 1;
    }
  }
  for (; i < a.length; i += 1) out.push({ op: "removed", i });
  for (; j < b.length; j += 1) out.push({ op: "added", j });
  return out;
}

/** Compares two texts line by line. Each line is same, changed (a removed and an added line paired), removed or added. */
export function compareLines(original: string, generated: string): CompareLine[] {
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
  for (const step of walk(a, b)) {
    if (step.op === "removed") removed.push(step.i);
    else if (step.op === "added") added.push(step.j);
    else {
      flush();
      out.push({ kind: "same", original: a[step.i], generated: b[step.j], originalLine: step.i + 1, generatedLine: step.j + 1 });
    }
  }
  flush();
  return out;
}
