// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { C4_KINDS } from "../model/c4/catalogue";
import { newDiagram } from "../model/newDiagram";
import type { C4Diagram } from "../model/types";
import { readBack, readC4, readFlowchart, readSequence } from "../testing/mermaidReadback";
import { generate } from "./generate";

// VO-068 (EC-05): the source of an empty diagram is the bare header (plus the title for C4), Mermaid's parser accepts
// it, and an empty C4 diagram with no title carries the c4-empty notice.

const NOTICE = { code: "c4-empty", text: "Mermaid cannot draw an empty C4 diagram. Add an element or a title." };

describe("an empty diagram", () => {
  it("generates the bare flowchart header, which Mermaid accepts, and no notice", async () => {
    const { source, notices } = generate(newDiagram("f", "flowchart"));

    expect(source).toBe("flowchart TD");
    expect(notices).toEqual([]);
    expect(await readFlowchart(source)).toEqual({ vertices: [], edges: [] });
  });

  it("generates the bare sequence header, which Mermaid accepts, and no notice", async () => {
    const { source, notices } = generate(newDiagram("s", "sequence"));

    expect(source).toBe("sequenceDiagram");
    expect(notices).toEqual([]);
    expect(await readSequence(source)).toEqual({ actors: [], messages: [] });
  });
});

describe.each(C4_KINDS)("an empty %s diagram", (kind) => {
  const empty = (): C4Diagram => newDiagram("c", "c4", kind) as C4Diagram;

  it("generates the bare header and carries the c4-empty notice when it has no title", () => {
    const { source, notices } = generate(empty());

    expect(source.split("\n")).toHaveLength(1);
    expect(source).toMatch(/^C4(Context|Container|Component|Dynamic|Deployment)$/);
    expect(notices).toEqual([NOTICE]);
  });

  it("generates the header and the title line, with no notice, when it has a title", async () => {
    const { source, notices } = generate({ ...empty(), title: "Only a title" });

    expect(source.split("\n")).toEqual([source.split("\n")[0], "  title Only a title"]);
    expect(notices).toEqual([]);
    expect(await readBack(source)).toBeDefined();
    expect((await readC4(source)).shapes).toEqual([]);
  });
});
