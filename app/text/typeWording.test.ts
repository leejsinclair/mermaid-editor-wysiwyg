import { describe, expect, it } from "vitest";
import { en } from "./en";
import { typeWording } from "./typeWording";

// Spec 008, VO-001 (FR-001, FR-002, Clarifications 2026-10-24): each diagram type's empty-canvas hint and connection prompt use
// that type's own element names, and no flowchart wording reaches a sequence or C4 diagram.

/** Words that name flowchart elements and have no place in a sequence or C4 diagram's guidance. */
const FLOWCHART_WORDS = /\b(shapes?|nodes?)\b/i;

function allText(type: "flowchart" | "sequence" | "c4"): string[] {
  const wording = typeWording(type);
  return [...wording.steps, wording.connectSource, wording.connectDestination];
}

describe("typeWording", () => {
  it("keeps the flowchart's own steps and prompts", () => {
    const wording = typeWording("flowchart");
    expect(wording.steps).toEqual(Object.values(en.canvasHelp.gettingStarted));
    expect(wording.connectSource).toBe(en.canvasHelp.connectSource);
    expect(wording.connectDestination).toBe(en.canvasHelp.connectDestination);
  });

  it.each(["flowchart", "sequence", "c4"] as const)("gives %s three numbered steps: add, label and connect", (type) => {
    const { steps } = typeWording(type);
    expect(steps).toHaveLength(3);
    steps.forEach((step, index) => {
      expect(step.startsWith(`${String(index + 1)}. `)).toBe(true);
    });
    expect(steps[0]).toMatch(/^1\. Add /);
    expect(steps[1]).toMatch(/label/i);
  });

  it.each(["flowchart", "sequence", "c4"] as const)("names the cancel key in both of %s's connection prompts", (type) => {
    const { connectSource, connectDestination } = typeWording(type);
    expect(connectSource).toContain("Press Escape to cancel.");
    expect(connectDestination).toContain("Press Escape to cancel.");
  });

  it("names participants and messages for a sequence diagram", () => {
    const { steps, connectSource, connectDestination } = typeWording("sequence");
    expect(steps[0]).toMatch(/participant/i);
    expect(steps[2]).toMatch(/message/i);
    expect(connectSource).toMatch(/sender|participant/i);
    expect(connectDestination).toMatch(/receiv/i);
  });

  it("names elements and relationships for a C4 diagram", () => {
    const { steps, connectSource, connectDestination } = typeWording("c4");
    expect(steps[0]).toMatch(/element/i);
    expect(steps[2]).toMatch(/relationship/i);
    expect(connectSource).toMatch(/source element/i);
    expect(connectDestination).toMatch(/target element/i);
  });

  it.each(["sequence", "c4"] as const)("uses no flowchart wording for %s", (type) => {
    for (const text of allText(type)) expect(text).not.toMatch(FLOWCHART_WORDS);
  });

  it.each(["sequence", "c4"] as const)("is catalogued in the English strings for %s", (type) => {
    const catalogued = JSON.stringify(en);
    for (const text of allText(type)) expect(catalogued).toContain(JSON.stringify(text));
  });
});
