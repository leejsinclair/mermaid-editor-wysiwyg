import { memo, useMemo } from "react";
import { highlightRuns, type RunKind } from "./highlight";

/** The colour of each kind of run: the source highlighting tokens of the appearance (spec 007, FR-017). Spaces keep the text colour. */
const COLOUR = new Map<RunKind, string>([
  ["keyword", "var(--code-keyword)"],
  ["identifier", "var(--code-identifier)"],
  ["string", "var(--code-string)"],
  ["operator", "var(--code-operator)"],
  ["comment", "var(--code-comment)"],
  ["punctuation", "var(--code-operator)"],
]);

/**
 * The generated source, set in the monospace face and coloured by kind of run. It is a plain `pre` that nothing can type into, and
 * its text is exactly the source: the runs only wrap parts of it in coloured spans.
 */
export const HighlightedSource = memo(function HighlightedSource({ source }: { readonly source: string }) {
  const runs = useMemo(
    () =>
      highlightRuns(source).reduce<{ kind: RunKind; text: string; at: number }[]>((placed, run) => {
        const last = placed.at(-1);
        placed.push({ ...run, at: last ? last.at + last.text.length : 0 });
        return placed;
      }, []),
    [source],
  );
  return (
    <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)" }}>
      {runs.map((run) =>
        run.kind === "space" ? (
          run.text
        ) : (
          <span key={run.at} data-kind={run.kind} style={{ color: COLOUR.get(run.kind) }}>
            {run.text}
          </span>
        ),
      )}
    </pre>
  );
});
