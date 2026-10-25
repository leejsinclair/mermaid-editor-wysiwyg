import { describe, expect, it } from "vitest";
import { en } from "./en";

// Every string the UI contract pins verbatim (specs/008-ux-workflow-clarity/contracts/ui-contract.md)
// must be a value in the English catalogue, so no screen carries wording that is not catalogued (FR-022).

function leafValues(node: unknown): string[] {
  if (typeof node === "string") return [node];
  if (node && typeof node === "object") {
    return Object.values(node).flatMap((child) => leafValues(child));
  }
  return [];
}

const catalogued = new Set(leafValues(en));

const contractStrings: readonly string[] = [
  // Toolbar groups (FR-017)
  "History",
  "Diagram editing",
  "Export and sharing",
  "View",
  "More actions",
  // Verbatim labels
  "Preview as Mermaid draws it",
  "Back to editing",
  "Copy Source",
  "Copy for Markdown",
  "Save file",
  "Rename",
  "Connect…",
  "Change endpoints",
  "Reverse",
  "Delete",
  "Blueprint",
  "Light",
  // Messages
  "A label cannot be empty.",
];

describe("UI contract strings are catalogued in en.ts", () => {
  it.each(contractStrings)("contains %j", (text) => {
    expect(catalogued.has(text)).toBe(true);
  });
});
