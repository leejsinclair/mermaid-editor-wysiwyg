import { expect, test } from "@playwright/test";
import { job, readWorkflow } from "./support/workflow";

// VO-006 (FR-007, US2-AS2, DC-03): the deploy job waits for a check job that runs type checking, unit tests and the
// end-to-end tests with Chromium installed, and no step can fail without stopping the deploy.

test.beforeEach(({ browserName }) => {
  // Skipped outside Chromium on purpose: the workflow is read as text, so the browser makes no difference.
  test.skip(browserName !== "chromium", "The workflow is read as text; one browser is enough");
});

test("the deploy job needs the check job", () => {
  expect(job(readWorkflow(), "deploy")).toMatch(/^ {4}needs: check$/m);
});

test("the check job runs type checking, unit tests and the end-to-end tests with Chromium installed", () => {
  const check = job(readWorkflow(), "check");

  expect(check).toMatch(/run: npm ci$/m);
  expect(check).toMatch(/run: npm run typecheck$/m);
  expect(check).toMatch(/run: npm test$/m);
  expect(check).toMatch(/run: npx playwright install --with-deps chromium$/m);
  expect(check).toMatch(/run: npm run test:e2e( |$)/m);
});

test("the timing test is left out of the end-to-end step, and no step may fail without stopping the run", () => {
  const text = readWorkflow();

  expect(job(text, "check")).toContain('--grep-invert "within a second"');
  expect(text).not.toContain("continue-on-error");
});
