import { readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { measure, openFixture, SCENARIOS, type Medians, type Scenario } from "./support/timing";

// VO-045 (SC-007, EC-01): on a flowchart, a sequence diagram and a C4 diagram of 100 elements and 150 relationships, dragging,
// panning and zooming take no longer than before the redesign: the median time of each action is within 10 % of its median
// recorded from the unchanged editor in e2e/fixtures/redesign-timing.json, for each browser. Setting REDESIGN_TIMING_CAPTURE
// records the medians instead of comparing them (task T003, run once on the unchanged editor).

const BASELINE = "e2e/fixtures/redesign-timing.json";
const TOLERANCE = 1.1;
/** Twenty drags of a 100-node flowchart take close to half a minute: the default test timeout is too short. */
const TEST_TIMEOUT_MS = 300_000;

interface Recorded extends Medians {
  readonly browser: string;
  readonly scenario: Scenario;
}

function read(): Recorded[] {
  try {
    return JSON.parse(readFileSync(BASELINE, "utf8")) as Recorded[];
  } catch {
    return [];
  }
}

// The medians were recorded on the developer's machine, and a hosted runner's speed varies (spec FR-007): the comparison is not run there.
test.skip(Object.hasOwn(process.env, "CI"), "Timings are compared with medians recorded on the developer's machine");

for (const scenario of SCENARIOS) {
  test(`dragging, panning and zooming a ${scenario} of 100 elements are no slower than before the redesign`, async ({ page, browserName }) => {
    test.setTimeout(TEST_TIMEOUT_MS);
    await openFixture(page, scenario);
    const now = await measure(page, scenario);
    if (Object.hasOwn(process.env, "REDESIGN_TIMING_CAPTURE")) {
      const others = read().filter((entry) => entry.browser !== browserName || entry.scenario !== scenario);
      writeFileSync(BASELINE, JSON.stringify([...others, { browser: browserName, scenario, ...now }], null, 2) + "\n");
      return;
    }
    const before = read().find((entry) => entry.browser === browserName && entry.scenario === scenario);
    expect(before, `a recorded baseline for ${scenario} in ${browserName}`).toBeDefined();
    if (before === undefined) return;
    const pairs: readonly (readonly [string, number, number])[] = [
      ["drag", now.drag, before.drag],
      ["pan", now.pan, before.pan],
      ["zoom", now.zoom, before.zoom],
    ];
    for (const [action, took, was] of pairs) {
      expect(took, `${action} median ${String(took)} ms against the baseline ${String(was)} ms`).toBeLessThanOrEqual(was * TOLERANCE);
    }
  });
}
