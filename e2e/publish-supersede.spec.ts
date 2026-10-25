import { expect, test } from "@playwright/test";
import { job, readWorkflow, topLevel } from "./support/workflow";

// VO-007 (FR-010, EC-06): runs share one concurrency group and a newer run supersedes an older one; the site is replaced
// by a single uploaded artifact built from the revision that passed the checks.

test("every run belongs to one concurrency group and a newer run cancels an older one", () => {
  const concurrency = topLevel(readWorkflow(), "concurrency");

  expect(concurrency).toMatch(/^ {2}group: pages$/m);
  expect(concurrency).toMatch(/^ {2}cancel-in-progress: true$/m);
});

test("the deploy job builds the revision and uploads one Pages artifact from the build folder", () => {
  const deploy = job(readWorkflow(), "deploy");

  expect(deploy).toMatch(/run: npm run build$/m);
  expect(deploy.match(/uses: actions\/upload-pages-artifact@/g) ?? []).toHaveLength(1);
  expect(deploy).toMatch(/^ {10}path: build\/client$/m);
});
