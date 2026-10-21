import { useEffect, useMemo, useState } from "react";
import type { Outcome, ReadDeps } from "../../importing/outcome";
import { readDocument } from "../../importing/readDocument";
import { latestOnly } from "../shared/latestOnly";

/** How long the text must rest before it is read (SC-005). */
const PAUSE_MS = 300;

/**
 * The outcome for the text as it is now, read after a short pause; only the latest text's outcome is kept (EC-09).
 * `checking` is true while the text on the screen is not the text the outcome was read from: the previous outcome stays
 * on screen, dimmed, and typing is never held up (contracts/import-dialog.md, "Checking").
 */
export function useImport(text: string, deps: ReadDeps): { readonly outcome: Outcome | undefined; readonly checking: boolean } {
  const latest = useMemo(() => latestOnly(), []);
  const [result, setResult] = useState<{ readonly outcome: Outcome; readonly text: string } | undefined>();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      latest(() => readDocument(text, deps))
        .then((outcome) => {
          if (outcome) setResult({ outcome, text });
        })
        .catch(() => undefined);
    }, PAUSE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [deps, latest, text]);
  return { outcome: result?.outcome, checking: text.trim() !== "" && result?.text !== text };
}
