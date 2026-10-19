import { describe, expect, it } from "vitest";
import { boundary, c4Diagram, element, node } from "../testing/c4Builder";
import { generate } from "./generate";

// VO-097: an empty C4 diagram, an empty boundary and an empty Deployment node are kept in the source, and one notice
// names each of them (contracts/mermaid-output.md, research R6).

describe("empty parts of a C4 diagram", () => {
  it("keeps an empty boundary in the source and names it in one c4-empty-container notice", () => {
    const { source, notices } = generate(c4Diagram("container", [element(1, "person"), boundary(2, "system", [], "Payments")]));

    expect(source).toContain('System_Boundary(b2, "Payments") {\n  }');
    expect(notices).toEqual([{ code: "c4-empty-container", text: "Mermaid cannot draw an empty boundary: Payments. Add an element to it or delete it." }]);
  });

  it("gives one notice to each empty boundary, including nested ones, in source order", () => {
    const { notices } = generate(c4Diagram("component", [boundary(1, "container", [boundary(2, "generic", [], "Inner")], "Outer"), boundary(3, "generic", [], "Next")]));

    expect(notices.map((notice) => notice.text)).toEqual([
      "Mermaid cannot draw an empty boundary: Inner. Add an element to it or delete it.",
      "Mermaid cannot draw an empty boundary: Next. Add an element to it or delete it.",
    ]);
  });

  it("keeps an empty Deployment node and names it", () => {
    const { source, notices } = generate(c4Diagram("deployment", [node(1, [], "Server"), node(2, [element(3, "container")], "Cloud")]));

    expect(source).toContain('Deployment_Node(d1, "Server", "Technology 1", "Description 1") {\n  }');
    expect(notices).toEqual([{ code: "c4-empty-container", text: "Mermaid cannot draw an empty boundary: Server. Add an element to it or delete it." }]);
  });

  it("names a label as typed, with its line breaks, in the notice", () => {
    const { notices } = generate(c4Diagram("context", [boundary(1, "enterprise", [], "Two\nlines")]));

    expect(notices[0]?.text).toBe("Mermaid cannot draw an empty boundary: Two\nlines. Add an element to it or delete it.");
  });

  it("gives an empty diagram with no title the c4-empty notice, and a title alone does not need one", () => {
    expect(generate(c4Diagram("context", [])).notices).toEqual([{ code: "c4-empty", text: "Mermaid cannot draw an empty C4 diagram. Add an element or a title." }]);
    expect(generate(c4Diagram("context", [], [], "Only a title")).notices).toEqual([]);
  });

  it("gives no notice to a diagram with no empty parts", () => {
    expect(generate(c4Diagram("container", [boundary(1, "system", [element(2, "container")])])).notices).toEqual([]);
  });
});
