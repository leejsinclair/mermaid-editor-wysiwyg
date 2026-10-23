import { expect, test, type Page } from "@playwright/test";
import { addShape, connect } from "./support/flowchart";

// VO-034: after each step of a mixed sequence of edits, undos and redos, the items and relationships on the
// canvas equal those in the source panel. Flowchart, Sequence and C4.

const sorted = (items: readonly string[]) => [...items].sort((a, b) => a.localeCompare(b));

async function readSource(page: Page): Promise<string> {
  const toggle = page.getByRole("button", { name: /Mermaid source/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  return (await page.getByRole("region", { name: /Mermaid source/ }).textContent()) ?? "";
}

/** Node ids with labels, and connections as "from label -> to label", as the source states them. */
function fromSource(source: string) {
  const labels = new Map<string, string>();
  for (const match of source.matchAll(/^ {0,4}(n\d+)[^"]{1,3}"([^"]*)"/gm)) labels.set(match[1] ?? "", match[2] ?? "");
  const links = [...source.matchAll(/^ {0,4}(n\d+) \S{1,5} (n\d+)$/gm)].map(
    (match) => `${labels.get(match[1] ?? "") ?? "?"} -> ${labels.get(match[2] ?? "") ?? "?"}`,
  );
  return { ids: sorted([...labels.keys()]), labels: sorted([...labels.values()]), links: sorted(links) };
}

async function fromCanvas(page: Page) {
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const ids = sorted(await canvas.locator(".react-flow__node").evaluateAll((els) => els.map((el) => `n${el.getAttribute("data-id") ?? ""}`)));
  const labels = sorted(await canvas.getByTestId("node-label").allTextContents());
  const names = await canvas.locator(".react-flow__edge").evaluateAll((els) => els.map((el) => el.getAttribute("aria-label") ?? ""));
  const links = names.map((name) => /from (.*) to (.*)$/.exec(name)).map((match) => `${match?.[1] ?? "?"} -> ${match?.[2] ?? "?"}`);
  return { ids, labels, links: sorted(links) };
}

async function agree(page: Page) {
  await expect.poll(async () => fromCanvas(page)).toEqual(fromSource(await readSource(page)));
}

test("canvas and source agree after every edit, undo and redo", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const properties = page.getByRole("region", { name: "Properties" });
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  await agree(page);

  await addShape(page, canvas, "Rectangle", { x: 200, y: 100 });
  await agree(page);
  await addShape(page, canvas, "Circle", { x: 520, y: 360 });
  await agree(page);
  await connect(page, canvas, canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/), 1);
  await agree(page);

  await canvas.getByLabel(/^Rectangle node/).click();
  await properties.getByRole("textbox", { name: "Label" }).fill("Start");
  await page.keyboard.press("Enter");
  await agree(page);

  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hexagon", exact: true }).click();
  await agree(page);

  for (const step of [undo, undo, undo, redo, redo]) {
    await step.click();
    await agree(page);
  }

  await canvas.getByLabel(/^Hexagon node|^Rectangle node/).click();
  await properties.getByRole("button", { name: "Delete", exact: true }).click();
  await agree(page);
  await undo.click();
  await agree(page);
  await redo.click();
  await agree(page);
});

/** The participants and messages in a sequence source, as "id label" and "from -> to: text" in order. */
function sequenceFromSource(source: string) {
  const labels = new Map<string, string>();
  const participants: string[] = [];
  const messages: string[] = [];
  for (const line of source.split("\n").map((text) => text.trim())) {
    if (line.startsWith("participant ") || line.startsWith("actor ")) {
      const [, id = "", , ...label] = line.split(" ");
      labels.set(id, label.join(" "));
      participants.push(`${id} ${label.join(" ")}`);
      continue;
    }
    const colon = line.indexOf(": ");
    const ends = colon === -1 ? null : /^p(\d+)[^\dp]+p(\d+)$/.exec(line.slice(0, colon));
    if (ends) {
      const [from, to] = [labels.get("p" + (ends[1] ?? "")) ?? "?", labels.get("p" + (ends[2] ?? "")) ?? "?"];
      messages.push(`${from} -> ${to}: ${line.slice(colon + 2)}`);
    }
  }
  return { participants, messages };
}

async function sequenceFromCanvas(page: Page) {
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const drawn = await canvas.getByTestId("participant").evaluateAll((els) =>
    els.map((el) => ({ id: el.getAttribute("data-id") ?? "", label: el.querySelector('[data-testid="participant-header"]')?.textContent ?? "" })),
  );
  const labels = new Map(drawn.map(({ id, label }) => [id, label]));
  const messages = await canvas.getByTestId("message").evaluateAll((els) =>
    els.map((el) => ({ from: el.getAttribute("data-from") ?? "", to: el.getAttribute("data-to") ?? "", text: el.querySelector('[data-testid="message-text"]')?.textContent ?? "" })),
  );
  return {
    participants: drawn.map(({ id, label }) => `p${id} ${label}`),
    messages: messages.map(({ from, to, text }) => `${labels.get(from) ?? "?"} -> ${labels.get(to) ?? "?"}: ${text}`),
  };
}

test("in a sequence diagram, canvas and source agree after every edit, undo and redo", async ({ page }) => {
  await page.goto("#/new/sequence");
  const agreeSequence = async () => {
    const source = await readSource(page);
    await expect.poll(async () => sequenceFromCanvas(page)).toEqual(sequenceFromSource(source));
  };
  const { addMessage, addParticipants, canvas } = await import("./support/sequence");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  await agreeSequence();

  await addParticipants(page, ["Participant", "A"], ["Actor", "B"]);
  await agreeSequence();
  await addMessage(page, "Solid arrow", "A", "B");
  await agreeSequence();
  await addMessage(page, "Dashed cross", "B", "B");
  await agreeSequence();

  await canvas(page).getByTestId("message").nth(1).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Move up", exact: true }).click();
  await agreeSequence();
  await canvas(page).getByTestId("message").nth(1).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Reverse", exact: true }).click();
  await agreeSequence();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await agreeSequence();

  let steps = 0;
  while (await undo.isEnabled()) {
    await undo.click();
    steps += 1;
    await agreeSequence();
  }
  expect(steps).toBe(9);
  for (let step = 0; step < steps; step += 1) {
    await redo.click();
    await agreeSequence();
  }
  await expect(redo).toBeDisabled();
});

/** The elements, boundaries and relationships in a C4 source, as "alias label" and "from -> to: label". */
function c4FromSource(source: string) {
  const labels = new Map<string, string>();
  const things: string[] = [];
  const links: string[] = [];
  for (const line of source.split("\n").map((text) => text.trim())) {
    const declared = /^(?:Person|System|Container|Component|\w+_Boundary|Boundary)\w*\(([eb])(\d+), "([^"]*)"/.exec(line);
    if (declared) {
      labels.set(`${declared[1] ?? ""}${declared[2] ?? ""}`, declared[3] ?? "");
      things.push(`${declared[1] ?? ""}${declared[2] ?? ""} ${declared[3] ?? ""}`);
      continue;
    }
    // eslint-disable-next-line security/detect-unsafe-regex -- fixed macro names, bounded digits, one fixture line
    const related = /^(?:Rel|BiRel|RelIndex)\((?:\d{1,6}, )?(e\d+), (e\d+), "([^"]*)"/.exec(line);
    if (related) links.push(`${labels.get(related[1] ?? "") ?? "?"} -> ${labels.get(related[2] ?? "") ?? "?"}: ${related[3] ?? ""}`);
  }
  return { things: sorted(things), links: sorted(links) };
}

async function c4FromCanvas(page: Page) {
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  const drawn = await canvas
    .locator('[data-testid="c4-element"], [data-testid="c4-boundary"], [data-testid="c4-node"]')
    .evaluateAll((els) =>
      els.map((el) => ({
        alias: `${el.getAttribute("data-testid") === "c4-boundary" ? "b" : "e"}${el.getAttribute("data-id") ?? ""}`,
        label: el.querySelector('[data-testid="item-label"]')?.textContent ?? "",
      })),
    );
  const names = await canvas.getByTestId("c4-relationship").evaluateAll((els) => els.map((el) => el.getAttribute("aria-label") ?? ""));
  return {
    things: sorted(drawn.map(({ alias, label }) => `${alias} ${label}`)),
    links: sorted(names.map((name) => /from (.*) to (.*): (.*)$/.exec(name)).map((match) => `${match?.[1] ?? "?"} -> ${match?.[2] ?? "?"}: ${match?.[3] ?? ""}`)),
  };
}

test("in a C4 diagram, canvas and source agree after every edit, undo and redo", async ({ page }) => {
  const support = await import("./support/c4");
  await support.openNew(page, "container");
  const agreeC4 = async () => {
    const source = await readSource(page);
    await expect.poll(async () => c4FromCanvas(page)).toEqual(c4FromSource(source));
  };
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });
  const properties = page.getByRole("region", { name: "Properties" });
  await agreeC4();

  await support.addItem(page, "Person", "Customer");
  await agreeC4();
  await support.addItem(page, "System", "Shop");
  await agreeC4();
  await support.addItem(page, "System boundary", "Zone");
  await agreeC4();
  await support.addRelationship(page, "One-way relationship", "Customer", "Shop");
  await agreeC4();
  await support.relabel(page, support.canvas(page).getByTestId("c4-relationship").first(), "Buys from");
  await agreeC4();

  await support.select(page, support.itemLabelled(page, "Shop"));
  await properties.getByRole("button", { name: "Move to…", exact: true }).click();
  await page.getByRole("dialog", { name: "Move to" }).getByRole("button", { name: /^Zone/ }).click();
  await agreeC4();
  await properties.getByRole("button", { name: "Change type", exact: true }).click();
  await page.getByRole("menuitem", { name: "External system", exact: true }).click();
  await agreeC4();
  await properties.getByRole("button", { name: "Delete", exact: true }).click();
  await agreeC4();

  let steps = 0;
  while (await undo.isEnabled()) {
    await undo.click();
    steps += 1;
    await agreeC4();
  }
  expect(steps).toBeGreaterThanOrEqual(8);
  for (let step = 0; step < steps; step += 1) {
    await redo.click();
    await agreeC4();
  }
  await expect(redo).toBeDisabled();
});
