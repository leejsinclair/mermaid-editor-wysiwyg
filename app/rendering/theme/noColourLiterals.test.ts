/* eslint-disable security/detect-non-literal-fs-filename -- every path is the app folder joined with a name read from it */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// VO-002 (FR-001, SC-004): every colour the application draws comes from the token module. No other source file under app/ holds a
// hex colour, an rgb(), rgba() or hsl() call, or a named colour (white, black) written as a style value.

const APP = join(process.cwd(), "app");
const TOKENS_FILE = join(APP, "rendering", "theme", "tokens.ts");

function sourcesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourcesUnder(path);
    return /\.(ts|tsx|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) && path !== TOKENS_FILE ? [path] : [];
  });
}

/** The code of a file without its comments, which may name a colour in words or in an example. */
function withoutComments(text: string): string {
  return text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[\s;{}),])\/\/.*$/gm, "$1");
}

const LITERALS: readonly (readonly [string, RegExp])[] = [
  ["a hex colour", /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])/i],
  ["an rgb(), rgba() or hsl() colour", /\b(?:rgba?|hsla?)\(/i],
  ["a named colour as a style value", /(?:color|background|fill|stroke|border|outline|shadow)[\w-]*["']?\s*[:=]\s*["']?(?:white|black)\b/i],
];

describe("colours outside the token module", () => {
  const found = sourcesUnder(APP).flatMap((path) => {
    const code = withoutComments(readFileSync(path, "utf8"));
    return LITERALS.filter(([, pattern]) => pattern.test(code)).map(([what]) => `${relative(process.cwd(), path)} holds ${what}`);
  });

  it("are not written in any other source file under app/", () => {
    expect(found).toEqual([]);
  });

  it("looks at the source files (the search is not empty)", () => {
    expect(sourcesUnder(APP).length).toBeGreaterThan(20);
  });
});
