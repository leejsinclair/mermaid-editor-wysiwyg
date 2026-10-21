import { useEffect, useMemo, useRef, useState } from "react";
import type { Outcome, ReadDeps } from "../../importing/outcome";
import { readDocument } from "../../importing/readDocument";
import { latestOnly } from "../shared/latestOnly";

/** How long the text must rest after a keystroke before it is read (SC-005). */
const PAUSE_MS = 300;
/**
 * The shorter rest after a change of more than one character at once, as a paste, a drop or a file makes: no further
 * keystroke is likely to follow, so the preview is not held up by the typing pause (feature 006, DN-01).
 */
const PASTE_PAUSE_MS = 100;

/**
 * The outcome for the text as it is now, read after a short pause; only the latest text's outcome is kept (EC-09).
 * `checking` is true while the text on the screen is not the text the outcome was read from: the previous outcome stays
 * on screen, dimmed, and typing is never held up (contracts/import-dialog.md, "Checking"); Import waits for it.
 */
export function useImport(text: string, deps: ReadDeps): { readonly outcome: Outcome | undefined; readonly checking: boolean } {
  const latest = useMemo(() => latestOnly(), []);
  const [result, setResult] = useState<{ readonly outcome: Outcome; readonly text: string } | undefined>();
  const previous = useRef(text);
  useEffect(() => {
    const pause = Math.abs(text.length - previous.current.length) > 1 ? PASTE_PAUSE_MS : PAUSE_MS;
    previous.current = text;
    const timer = window.setTimeout(() => {
      latest(() => readDocument(text, deps))
        .then((outcome) => {
          if (outcome) setResult({ outcome, text });
        })
        .catch(() => undefined);
    }, pause);
    return () => {
      window.clearTimeout(timer);
    };
  }, [deps, latest, text]);
  // Empty text has nothing to import: the previous outcome is dropped at once, not after the pause (feature 006, FR-003).
  if (text.trim() === "") return { outcome: undefined, checking: false };
  return { outcome: result?.outcome, checking: result?.text !== text };
}
