import { KNOWN_C4_NOTICE_CODES, type Generated, type Notice } from "../generation/generate";
import type { Diagram } from "../model/types";
import { latestOnly } from "../rendering/shared/latestOnly";
import { en } from "../text/en";
import { fill } from "../text/fill";

export type ParseOutcome = { readonly ok: true } | { readonly ok: false; readonly reason: string };

export type SourceStatus =
  | { readonly kind: "checking" }
  | { readonly kind: "valid" }
  | { readonly kind: "invalid"; readonly reason: string }
  | { readonly kind: "notice"; readonly notices: readonly Notice[] };

export interface CheckResult {
  readonly source: string;
  readonly notices: readonly Notice[];
  readonly status: SourceStatus;
}

export interface SourceCheckDeps {
  readonly generate: (diagram: Diagram) => Generated;
  readonly parse: (source: string) => Promise<ParseOutcome>;
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Generates and parses a diagram's source. The answer to a call that a newer call has overtaken is `undefined`,
 * so a late answer never replaces a newer result. A failure is reported and never shown as valid.
 */
export function createSourceChecker(deps: SourceCheckDeps): (diagram: Diagram) => Promise<CheckResult | undefined> {
  const latest = latestOnly();
  return (diagram) =>
    latest(async (): Promise<CheckResult> => {
      let generated: Generated;
      try {
        generated = deps.generate(diagram);
      } catch (error) {
        const reason = fill(en.sourceCheck.generationFailed, { reason: messageOf(error) });
        return { source: "", notices: [], status: { kind: "invalid", reason } };
      }
      const { source, notices } = generated;

      let outcome: ParseOutcome;
      try {
        outcome = await deps.parse(source);
      } catch (error) {
        const reason = fill(en.sourceCheck.couldNotCheck, { reason: messageOf(error) });
        return { source, notices, status: { kind: "invalid", reason } };
      }
      if (outcome.ok) return { source, notices, status: { kind: "valid" } };
      if (notices.some((notice) => KNOWN_C4_NOTICE_CODES.has(notice.code))) {
        return { source, notices, status: { kind: "notice", notices } };
      }
      return { source, notices, status: { kind: "invalid", reason: outcome.reason } };
    });
}
