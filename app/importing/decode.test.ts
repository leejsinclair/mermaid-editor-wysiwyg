import { describe, expect, it } from "vitest";
import { decodeLabel } from "./decode";

// VO-027 (FR-009, EC-03): labels decode to the text the editor would have typed; tags are stripped, text kept, and reported.

describe("decodeLabel", () => {
  it("decodes Mermaid's named and numeric entity placeholders to the characters they stand for", () => {
    expect(decodeLabel("Tom ﬂ°quot¶ß and Ann")).toEqual({ text: 'Tom " and Ann', stripped: false });
    expect(decodeLabel("A ﬂ°°35¶ß B")).toEqual({ text: "A # B", stripped: false });
  });

  it("decodes named and numeric HTML entities", () => {
    expect(decodeLabel("Fish &amp; chips &lt;3 &gt; &quot;x&quot; &apos;y&apos;")).toEqual({
      text: "Fish & chips <3 > \"x\" 'y'",
      stripped: false,
    });
    expect(decodeLabel("a&nbsp;b").text).toBe("a b");
    expect(decodeLabel("&#65;&#x42;").text).toBe("AB");
  });

  it("turns <br> and <br/> into line breaks", () => {
    expect(decodeLabel("Line one<br>Line two<br/>Line three<br />End")).toEqual({
      text: "Line one\nLine two\nLine three\nEnd",
      stripped: false,
    });
  });

  it("keeps quotes and Unicode as typed", () => {
    expect(decodeLabel("Zoë's “café” – 日本語")).toEqual({ text: "Zoë's “café” – 日本語", stripped: false });
  });

  it("strips other HTML tags, keeps their text, and flags the label", () => {
    expect(decodeLabel("<b>Pay</b> now")).toEqual({ text: "Pay now", stripped: true });
    expect(decodeLabel('<a href="x">link</a>')).toEqual({ text: "link", stripped: true });
  });

  it("returns an unchanged label, unflagged, when there is nothing to decode", () => {
    expect(decodeLabel("Plain label")).toEqual({ text: "Plain label", stripped: false });
    expect(decodeLabel("")).toEqual({ text: "", stripped: false });
  });
});
