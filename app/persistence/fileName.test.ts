import { describe, expect, it } from "vitest";
import { safeFileName } from "./fileName";

// VO-081: a diagram's file name keeps letters, digits, space, -, _ and .; everything else becomes _; it is never
// empty, at most 100 characters of name, and ends .mermaid-editor.json.

const EXTENSION = ".mermaid-editor.json";

describe("safeFileName", () => {
  it("keeps an ordinary name", () => {
    expect(safeFileName("Order flow v2.1_final-draft")).toBe(`Order flow v2.1_final-draft${EXTENSION}`);
  });

  it("keeps letters and digits of any script", () => {
    expect(safeFileName("日本語 Привет 123")).toBe(`日本語 Привет 123${EXTENSION}`);
  });

  it.each([
    ['a/b\\c:d*e?f"g<h>i|j', "a_b_c_d_e_f_g_h_i_j"],
    ["tab\there\nnewline", "tab_here_newline"],
    ["emoji 😀 name", "emoji _ name"],
    ["../../etc/passwd", ".._.._etc_passwd"],
  ])("replaces unsafe characters in %j with _", (name, safe) => {
    expect(safeFileName(name)).toBe(`${safe}${EXTENSION}`);
  });

  it("trims the name", () => {
    expect(safeFileName("  padded  ")).toBe(`padded${EXTENSION}`);
  });

  it("keeps a name of only unsafe characters as underscores", () => {
    expect(safeFileName("???")).toBe(`___${EXTENSION}`);
  });

  it.each(["", "   "])("falls back to diagram when nothing remains of %j", (name) => {
    expect(safeFileName(name)).toBe(`diagram${EXTENSION}`);
  });

  it("cuts a very long name to 100 characters", () => {
    const name = safeFileName("x".repeat(500));

    expect(name).toBe(`${"x".repeat(100)}${EXTENSION}`);
  });

  it("does not cut an astral character in half", () => {
    const name = safeFileName(`${"y".repeat(99)}😀😀`);

    expect(name.endsWith(EXTENSION)).toBe(true);
    expect(name.slice(0, -EXTENSION.length)).toHaveLength(100);
  });
});
