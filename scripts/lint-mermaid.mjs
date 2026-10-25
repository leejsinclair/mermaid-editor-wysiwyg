// Validate Mermaid source with Mermaid's own parser.
//   node scripts/lint-mermaid.mjs <file>...   .mmd/.mermaid files whole, ```mermaid fences in .md files
//   node scripts/lint-mermaid.mjs             every such file in the project
// Exits 1 and prints file:line for each invalid diagram.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { JSDOM } from "jsdom";

// Mermaid's parser needs a DOM (DOMPurify) even though nothing is rendered.
const dom = new JSDOM("<!doctype html><body></body>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import("mermaid");

const SKIP = new Set(["node_modules", "build", ".git", ".react-router", "playwright-report", "test-results", "tools"]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

function diagramsIn(file) {
  const text = readFileSync(file, "utf8");
  const ext = extname(file);
  if (ext === ".mmd" || ext === ".mermaid") return [{ line: 1, source: text }];
  if (ext !== ".md") return [];
  const found = [];
  let current;
  for (const [index, line] of text.split("\n").entries()) {
    if (current) {
      if (/^\s*(```|~~~)\s*$/.test(line)) {
        found.push({ line: current.line, source: current.body.join("\n") });
        current = undefined;
      } else {
        current.body.push(line);
      }
    } else if (/^\s*(```|~~~)\s*mermaid\s*$/.test(line)) {
      current = { line: index + 2, body: [] };
    }
  }
  return found;
}

const files = process.argv.length > 2 ? process.argv.slice(2) : [...walk(".")];
let failures = 0;
let checked = 0;
for (const file of files) {
  for (const { line, source } of diagramsIn(file)) {
    checked++;
    try {
      await mermaid.parse(source);
    } catch (error) {
      failures++;
      const message = String(error?.message ?? error).split("\n").slice(0, 3).join(" | ");
      console.error(`${file}:${line}: invalid Mermaid: ${message}`);
    }
  }
}
console.error(`mermaid: ${checked} diagram(s) checked, ${failures} invalid`);
process.exit(failures ? 1 : 0);
