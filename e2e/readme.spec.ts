import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// VO-009 (FR-013, US3-AS2): the README gives the public address, says publishing runs from main and by manual start,
// and says how to serve the production build locally before merging.

test.beforeEach(({ browserName }) => {
  // Skipped outside Chromium on purpose: the README is read as text, so the browser makes no difference.
  test.skip(browserName !== "chromium", "The README is read as text; one browser is enough");
});

const readme = (): string => readFileSync(join(process.cwd(), "README.md"), "utf8");

test("the README gives the public address", () => {
  expect(readme()).toContain("https://leejsinclair.github.io/mermaid-editor-wysiwyg/");
});

test("the README says publishing runs from main and by a manual start, and what must pass first", () => {
  const text = readme();

  expect(text).toMatch(/merge[^.]*`main`/i);
  expect(text).toContain("Run workflow");
  expect(text).toMatch(/Chromium and Firefox/);
});

test("the README says how to serve the production build locally before merging", () => {
  const text = readme();

  expect(text).toContain("npm run build");
  expect(text).toContain("npm run preview");
});
