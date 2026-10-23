import { describe, expect, it } from "vitest";
import { statusText, statusTone, type SourcePanelStatus } from "./sourceStatus";

// VO-006 (FR-018, US3-AS3, EC-06): the source check status is presented as a tone and as words: invalid is an error with its reason
// in text, a notice a warning with its text, valid a success, and a check still under way muted; every tone comes with text, so
// colour is never the only cue.

const STATUSES: readonly SourcePanelStatus[] = [
  { kind: "checking" },
  { kind: "valid" },
  { kind: "invalid", reason: "Parse error on line 3" },
  { kind: "notice", notices: [{ code: "c4-empty", text: "The diagram is empty." }] },
];

describe("the source check status", () => {
  it("has the error tone, with the reason in its words, when Mermaid rejects the source", () => {
    expect(statusTone({ kind: "invalid", reason: "Parse error on line 3" })).toBe("error");
    expect(statusText({ kind: "invalid", reason: "Parse error on line 3" })).toContain("Parse error on line 3");
  });

  it("has the warning tone for a notice, the success tone for a valid source and the muted tone while it is being checked", () => {
    expect(statusTone({ kind: "notice", notices: [] })).toBe("warning");
    expect(statusTone({ kind: "valid" })).toBe("success");
    expect(statusTone({ kind: "checking" })).toBe("muted");
  });

  it("always comes with words", () => {
    for (const status of STATUSES) expect(statusText(status).trim(), status.kind).not.toBe("");
  });

  it("gives each state its own tone", () => {
    expect(new Set(STATUSES.map(statusTone)).size).toBe(STATUSES.length);
  });
});
