import { describe, expect, it } from "vitest";
import { layoutFor } from "./layout";

// VO-032 (FR-010): a window width is classified as wide (900 px and over), narrow (600 to 899 px) or compact (under 600 px).

describe("the layout for a window width", () => {
  it("is wide from 900 px", () => {
    expect(layoutFor(1440)).toBe("wide");
    expect(layoutFor(900)).toBe("wide");
  });

  it("is narrow from 600 px up to 899 px", () => {
    expect(layoutFor(899)).toBe("narrow");
    expect(layoutFor(768)).toBe("narrow");
    expect(layoutFor(600)).toBe("narrow");
  });

  it("is compact under 600 px", () => {
    expect(layoutFor(599)).toBe("compact");
    expect(layoutFor(360)).toBe("compact");
  });
});
