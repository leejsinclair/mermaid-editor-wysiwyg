import { expect, test } from "@playwright/test";
import { job, readWorkflow, topLevel } from "./support/workflow";

// VO-008 (FR-011, EC-07): Pages is configured before anything is uploaded, so a repository with Pages switched off
// fails the run with GitHub's own message; permissions are the least the jobs need and the live address is reported.

test.beforeEach(({ browserName }) => {
  // Skipped outside Chromium on purpose: the workflow is read as text, so the browser makes no difference.
  test.skip(browserName !== "chromium", "The workflow is read as text; one browser is enough");
});

test("Pages is configured before the artifact is uploaded and deployed", () => {
  const deploy = job(readWorkflow(), "deploy");
  const at = (action: string): number => deploy.indexOf(`uses: actions/${action}@`);

  expect(at("configure-pages")).toBeGreaterThan(-1);
  expect(at("configure-pages")).toBeLessThan(at("upload-pages-artifact"));
  expect(at("upload-pages-artifact")).toBeLessThan(at("deploy-pages"));
});

test("only the deploy job may write to Pages, the rest of the workflow only reads", () => {
  const text = readWorkflow();
  const deploy = job(text, "deploy");

  expect(topLevel(text, "permissions")).toMatch(/^ {2}contents: read$/m);
  expect(deploy).toMatch(/^ {6}pages: write$/m);
  expect(deploy).toMatch(/^ {6}id-token: write$/m);
  expect(job(text, "check")).not.toContain("pages: write");
});

test("the deploy job reports the live address as the environment's address", () => {
  const deploy = job(readWorkflow(), "deploy");

  expect(deploy).toMatch(/^ {6}name: github-pages$/m);
  expect(deploy).toMatch(/^ {6}url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}$/m);
  expect(deploy).toMatch(/^ {6}- id: deployment$/m);
});
