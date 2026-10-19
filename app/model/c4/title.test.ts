// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { generate } from "../../generation/generate";
import { commit, createHistory } from "../../history/history";
import { c4Of, emptyC4 } from "../../testing/c4Builder";
import { readC4 } from "../../testing/mermaidReadback";
import { run } from "../../testing/run";
import { C4_KINDS } from "./catalogue";
import { newDiagram } from "../newDiagram";

// VO-058: a C4 title is set, changed and cleared in every kind; the escaped `title` line is read back exactly, there is
// no line when it is empty, and each change is one history entry. Flowchart and Sequence offer no title (FR-054).

const TITLES = ["Payments", "Two lines\nof title", "\"quoted\" <b>bold</b> & [a](b) {c} #d; e|f", "%% not a comment", "😀 日本語"];

describe.each(C4_KINDS)("the title of a %s diagram", (kind) => {
  it("is empty at first, with no title line in the source", () => {
    const history = emptyC4(kind);

    expect(c4Of(history).title).toBe("");
    expect(generate(history.present).source.split("\n").filter((line) => line.trimStart().startsWith("title"))).toEqual([]);
  });

  it.each(TITLES)("%j is written as one escaped line and read back exactly by Mermaid", async (title) => {
    const history = run(emptyC4(kind), { op: "setTitle", text: title });
    const { source } = generate(history.present);

    expect(source.split("\n").filter((line) => line.startsWith("  title "))).toHaveLength(1);
    expect((await readC4(source)).title).toBe(title);
  });

  it("is changed and cleared, each change one history entry, and no line remains once cleared", () => {
    const first = run(emptyC4(kind), { op: "setTitle", text: "First" });
    const second = run(first, { op: "setTitle", text: "Second" });
    const cleared = run(second, { op: "setTitle", text: "" });

    expect([c4Of(first).title, c4Of(second).title, c4Of(cleared).title]).toEqual(["First", "Second", ""]);
    expect([first.past.length, second.past.length, cleared.past.length]).toEqual([1, 2, 3]);
    expect(generate(cleared.present).source).not.toContain("title");
  });

  it("is restored by Undo to what it was", () => {
    const history = run(emptyC4(kind), { op: "setTitle", text: "First" }, { op: "setTitle", text: "Second" });

    expect(c4Of({ ...history, present: history.past.at(-1) ?? history.present }).title).toBe("First");
  });

  it("is not a change when set to what it already is", () => {
    const history = run(emptyC4(kind), { op: "setTitle", text: "Same" });

    const result = commit(history, { op: "setTitle", text: "Same" });

    expect(result.outcome).toEqual({ committed: false });
    expect(result.history).toBe(history);
  });
});

describe("a diagram that is not C4", () => {
  it.each(["flowchart", "sequence"] as const)("%s offers no title", (type) => {
    const history = createHistory(newDiagram("d1", type));

    const result = commit(history, { op: "setTitle", text: "Nope" });

    expect(result.outcome).toMatchObject({ committed: false, rejection: { reason: "notOfferedInKind", details: { kind: type } } });
    expect(result.history).toBe(history);
  });
});
