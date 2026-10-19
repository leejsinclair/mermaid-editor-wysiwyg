import { describe, expect, it } from "vitest";
import type { Generated } from "../generation/generate";
import { newDiagram } from "../model/newDiagram";
import { createSourceChecker, type ParseOutcome } from "./sourceCheck";

// VO-013: failures are reported and never shown as valid; only a known C4 notice maps a parser rejection to
// notice(list); a late answer for an older source never replaces the newer result (EC-06).

const diagram = newDiagram("d1", "flowchart");
const generated = (source: string, notices: Generated["notices"] = []): Generated => ({ source, notices });

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("a source check", () => {
  it("is valid when the parser accepts the source", async () => {
    const check = createSourceChecker({ generate: () => generated("flowchart TD"), parse: () => Promise.resolve({ ok: true }) });

    expect(await check(diagram)).toEqual({ source: "flowchart TD", notices: [], status: { kind: "valid" } });
  });

  it("is invalid, and never valid, when generation fails", async () => {
    let parsed = false;
    const check = createSourceChecker({
      generate: () => {
        throw new Error("boom");
      },
      parse: () => {
        parsed = true;
        return Promise.resolve({ ok: true });
      },
    });

    const result = await check(diagram);

    expect(result?.status).toEqual({ kind: "invalid", reason: expect.stringContaining("boom") as unknown });
    expect(parsed).toBe(false);
  });

  it("is invalid with the parser's reason when the parser rejects a source that has no notice", async () => {
    const check = createSourceChecker({
      generate: () => generated("flowchart TD\n  broken"),
      parse: () => Promise.resolve({ ok: false, reason: "Parse error on line 2" }),
    });

    expect((await check(diagram))?.status).toEqual({ kind: "invalid", reason: "Parse error on line 2" });
  });

  it("is invalid, and says it could not be checked, when the parser cannot run", async () => {
    const check = createSourceChecker({
      generate: () => generated("flowchart TD"),
      parse: () => Promise.reject(new Error("Failed to load")),
    });

    const result = await check(diagram);

    expect(result?.status.kind).toBe("invalid");
    expect(result?.status).toEqual({ kind: "invalid", reason: expect.stringContaining("could not be checked") as unknown });
  });

  it("is notice(list), not invalid, when the parser rejects a source that carries a known C4 notice", async () => {
    const notices = [{ code: "c4-empty", text: "Mermaid cannot draw an empty C4 diagram. Add an element or a title." }];
    const check = createSourceChecker({
      generate: () => generated("C4Context", notices),
      parse: () => Promise.resolve({ ok: false, reason: "Parse error" }),
    });

    expect((await check(diagram))?.status).toEqual({ kind: "notice", notices });
  });

  it("is invalid when the parser rejects a source whose notice is not a known C4 notice", async () => {
    const notices = [{ code: "something-else", text: "x" }];
    const check = createSourceChecker({
      generate: () => generated("C4Context", notices),
      parse: () => Promise.resolve({ ok: false, reason: "Parse error" }),
    });

    expect((await check(diagram))?.status).toEqual({ kind: "invalid", reason: "Parse error" });
  });

  it("drops a late answer for an older source so it never replaces the newer result", async () => {
    const first = deferred<ParseOutcome>();
    const answers = [first.promise, Promise.resolve<ParseOutcome>({ ok: true })];
    let call = 0;
    const check = createSourceChecker({
      generate: () => generated(`flowchart TD ${String(call)}`),
      parse: () => answers[call++] ?? Promise.resolve({ ok: true }),
    });

    const older = check(diagram);
    const newer = await check(diagram);
    first.resolve({ ok: false, reason: "old failure" });

    expect(newer?.status).toEqual({ kind: "valid" });
    expect(await older).toBeUndefined();
  });
});
