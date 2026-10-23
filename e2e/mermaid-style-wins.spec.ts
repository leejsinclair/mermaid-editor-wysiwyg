import { expect, test } from "@playwright/test";

// VO-028 (FR-019, US4-AS3, decision DN-01): in Blueprint Studio the editor's drawing function, given source with a style statement
// and a class statement, draws node A with the style's fill and node B with the class's fill, and other nodes with the blueprint
// fill. (No editor screen draws such source: import drops style statements and draws the generated source.)

const SOURCE = ["flowchart TD", "  A[Pink] --> B[Warm]", "  B --> C[Plain]", "  style A fill:#ff99ff", "  classDef warm fill:#ffcc88", "  class B warm"].join("\n");

test("style and class statements in a drawn source win over the blueprint look", async ({ page }) => {
  await page.goto("#/");
  const fills = await page.evaluate(async (source) => {
    const url = "/app/rendering/shared/MermaidPicture.tsx";
    const module = (await import(/* @vite-ignore */ url)) as { drawWithMermaid: (text: string) => Promise<{ svg?: string; error?: string }> };
    const drawn = await module.drawWithMermaid(source);
    if (drawn.svg === undefined) throw new Error(drawn.error ?? "no drawing");
    const host = document.createElement("div");
    host.innerHTML = drawn.svg;
    document.body.append(host);
    const result = [...host.querySelectorAll("g.node")].map((node) => {
      const shape = node.querySelector("rect, path, polygon");
      return { text: node.textContent.trim(), fill: shape ? getComputedStyle(shape).fill : "" };
    });
    host.remove();
    return result;
  }, SOURCE);
  const fillOf = (text: string) => fills.find((node) => node.text === text)?.fill;
  expect(fillOf("Pink"), "style statement").toBe("rgb(255, 153, 255)");
  expect(fillOf("Warm"), "class statement").toBe("rgb(255, 204, 136)");
  expect(fillOf("Plain"), "blueprint fill").toBe("rgb(13, 43, 69)");
});
