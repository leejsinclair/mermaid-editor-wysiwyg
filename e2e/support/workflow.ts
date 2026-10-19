import { readFileSync } from "node:fs";
import { join } from "node:path";

// The publish workflow is read as text (contracts/publish-workflow.md); no YAML library is added for it.

export function readWorkflow(): string {
  return readFileSync(join(process.cwd(), ".github", "workflows", "pages.yml"), "utf8");
}

/** The lines of one top-level key, from its own line to the line before the next key at the same indentation. */
function block(text: string, key: string, indent: number): string {
  const lines = text.split("\n");
  const pad = " ".repeat(indent);
  const start = lines.findIndex((line) => line === `${pad}${key}:` || line.startsWith(`${pad}${key}: `));
  if (start < 0) return "";
  const rest = lines.slice(start + 1);
  const length = rest.findIndex((line) => line.trim() !== "" && !line.startsWith(`${pad} `) && !line.startsWith(`${pad}#`));
  return [lines[start] ?? "", ...(length < 0 ? rest : rest.slice(0, length))].join("\n");
}

/** A key at the top of the file, such as `on` or `concurrency`. */
export const topLevel = (text: string, key: string): string => block(text, key, 0);

/** One job under `jobs:`. */
export const job = (text: string, name: string): string => block(text, name, 2);

/** The keys one level inside a block, such as the triggers under `on`. */
export function childKeys(blockText: string, indent: number): string[] {
  const pattern = new RegExp(`^ {${String(indent)}}([\\w-]+):`);
  return blockText
    .split("\n")
    .map((line) => pattern.exec(line)?.[1])
    .filter((key): key is string => key !== undefined);
}
