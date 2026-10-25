import { expect, test } from "@playwright/test";
import { childKeys, job, readWorkflow, topLevel } from "./support/workflow";

// VO-005 (FR-006, FR-008, FR-009, US2-AS3, US3-AS1): the workflow starts on a push to main and on a manual start only,
// and the deploy job is limited to main, so no other branch can change the live site.

test("the workflow starts on a push to main and on a manual start, and on nothing else", () => {
  const triggers = topLevel(readWorkflow(), "on");

  expect(childKeys(triggers, 2).sort((a, b) => a.localeCompare(b))).toEqual(["push", "workflow_dispatch"]);
  expect(triggers).toMatch(/branches:\s*\[main\]/);
});

test("the deploy job runs only for the main branch, whichever branch started the run", () => {
  expect(job(readWorkflow(), "deploy")).toContain("if: github.ref == 'refs/heads/main'");
});
