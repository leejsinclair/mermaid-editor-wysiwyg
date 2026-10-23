// @vitest-environment jsdom
 
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { markdownFence } from "../editor/clipboard";
import { parseLocated } from "../editor/mermaidParser";
import { snapshotFlowchart, snapshotSequence } from "../editor/mermaidSnapshot";
import { readDocument } from "../importing/readDocument";
import type { Diagram } from "../model/types";
import { parseFile, toFile } from "../persistence/codec";
import { generate } from "./generate";

// VO-044 (SC-002, FR-024, US4-AS4): the generated source, the Markdown fence and the saved-file content of every corpus
// document and every end-to-end fixture are byte-identical to what the editor produced before the Blueprint Studio redesign.
// The snapshot holds a SHA-256 and the byte length of each output, captured from the unchanged code (task T002).

const realDeps = { parse: parseLocated, snapshotFlowchart, snapshotSequence };
const corpus = join(__dirname, "..", "importing", "corpus");
const fixtures = join(__dirname, "..", "..", "e2e", "fixtures");
const SNAPSHOT = join(__dirname, "redesign-output.snapshot.json");

interface Digest {
  readonly sha256: string;
  readonly bytes: number;
}

const digest = (text: string): Digest => ({ sha256: createHash("sha256").update(text).digest("hex"), bytes: Buffer.byteLength(text) });

/** The three outputs of one diagram: its source, the source in a Markdown fence, and the saved-file text. */
function outputsOf(diagram: Diagram): Readonly<Record<string, Digest>> {
  const { source } = generate(diagram);
  return {
    source: digest(source),
    markdown: digest(markdownFence(source)),
    file: digest(JSON.stringify(toFile(diagram), null, 2)),
  };
}

const sorted = (names: readonly string[]): string[] => [...names].sort((a, b) => a.localeCompare(b));

const CORPUS = sorted(readdirSync(corpus).filter((file) => file.endsWith(".md") && file !== "SOURCES.md")).map((name) => ({ name, text: readFileSync(join(corpus, name), "utf8") }));
const FIXTURES = sorted(readdirSync(fixtures).filter((file) => file.endsWith(".mermaid-editor.json"))).map((name) => ({ name, text: readFileSync(join(fixtures, name), "utf8") }));

describe("the editor's output is unchanged by the redesign", () => {
  it("is byte-identical for every corpus document and every end-to-end fixture", async () => {
    const found: Record<string, unknown> = {};
    for (const { name, text } of CORPUS) {
      const outcome = await readDocument(text, realDeps);
      found[`corpus/${name}`] = outcome.kind === "ready" ? outputsOf(outcome.diagram) : { outcome: outcome.kind };
    }
    for (const { name, text } of FIXTURES) {
      const parsed = parseFile(text);
      found[`fixtures/${name}`] = parsed.ok ? outputsOf({ ...parsed.model, id: "fixture", changedAt: "2000-01-01T00:00:00.000Z" }) : { refused: parsed.reason };
    }
    await expect(JSON.stringify(found, null, 2) + "\n").toMatchFileSnapshot(SNAPSHOT);
  });
});
