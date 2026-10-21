import { describe, expect, it } from "vitest";
import { newDiagram } from "../model/newDiagram";
import { nameFor } from "./naming";

// VO-033 (FR-011): the name is the front-matter title, else the C4 title, else the editor's default name for the type.

const defaultFlowchart = newDiagram("x", "flowchart").name;
const defaultC4 = newDiagram("x", "c4", "container").name;

describe("nameFor", () => {
  it("uses the front-matter title when there is one", () => {
    expect(nameFor({ frontMatterTitle: "Login flow", type: "flowchart" })).toBe("Login flow");
  });

  it("uses the C4 title when there is no front-matter title", () => {
    expect(nameFor({ c4Title: "Payments", type: "c4", kind: "container" })).toBe("Payments");
  });

  it("uses the editor's default name for the type when neither title is present", () => {
    expect(nameFor({ type: "flowchart" })).toBe(defaultFlowchart);
    expect(nameFor({ type: "c4", kind: "container" })).toBe(defaultC4);
  });

  it("prefers the front-matter title when both titles are present", () => {
    expect(nameFor({ frontMatterTitle: "Front", c4Title: "C4", type: "c4", kind: "container" })).toBe("Front");
  });

  it("lets a blank title fall through to the next source", () => {
    expect(nameFor({ frontMatterTitle: "   ", c4Title: "Payments", type: "c4", kind: "container" })).toBe("Payments");
    expect(nameFor({ frontMatterTitle: "", c4Title: " ", type: "flowchart" })).toBe(defaultFlowchart);
  });
});
