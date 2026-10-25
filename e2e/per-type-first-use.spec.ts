import { expect, test, type Locator, type Page } from "@playwright/test";
import { addItem, handlesOf, itemLabelled, openNew } from "./support/c4";
import { addParticipants, participantLabelled } from "./support/sequence";

// Spec 008, US1 for the sequence and C4 editors (Clarifications 2026-10-24: all three types, each with its own element names).
// VO-001 hint in the type's own words, VO-002 a new element is selected with its label open, VO-003 Enter saves and Escape
// restores, VO-004 the connection prompt names the end being chosen and the cancel key, VO-041 an empty label is refused.

interface TypeCase {
  readonly name: string;
  readonly open: (page: Page) => Promise<void>;
  /** The toolbox button that adds the first element, which is also the label it starts with. */
  readonly add: string;
  /** What the Properties panel calls the added element. */
  readonly typeName: string;
  readonly steps: readonly string[];
  /** The added elements, newest last. */
  readonly items: (page: Page) => Locator;
  readonly labelled: (page: Page, label: string) => Locator;
}

const canvasOf = (page: Page) => page.getByRole("region", { name: "Diagram canvas" });
const editor = (page: Page) => page.getByTestId("inline-label-editor");
const toolbox = (page: Page, name: string) => page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name, exact: true });
const LABEL_PROMPT = "Press Enter to save the label or Escape to cancel.";

const CASES: readonly TypeCase[] = [
  {
    name: "sequence",
    open: async (page) => {
      await page.goto("#/new/sequence");
      await expect(canvasOf(page)).toBeVisible();
    },
    add: "Participant",
    typeName: "Participant",
    steps: ["1. Add a participant.", "2. Label it.", "3. Draw a message between two participants."],
    items: (page) => canvasOf(page).getByTestId("participant"),
    labelled: participantLabelled,
  },
  {
    name: "C4",
    open: (page) => openNew(page, "context"),
    add: "Person",
    typeName: "Person",
    steps: ["1. Add an element.", "2. Label it.", "3. Connect two elements with a relationship."],
    items: (page) => canvasOf(page).getByTestId("c4-element"),
    labelled: itemLabelled,
  },
];

for (const type of CASES) {
  test.describe(`a new ${type.name} diagram`, () => {
    test("the empty canvas names the three steps in the type's own words and leaves the canvas editable", async ({ page }) => {
      await type.open(page);
      for (const step of type.steps) await expect(canvasOf(page).getByText(step, { exact: true })).toBeVisible();
      await expect(canvasOf(page).getByText(type.steps[0] ?? "", { exact: true })).toHaveCSS("pointer-events", "none");
      for (const flowchartStep of ["1. Add a shape.", "3. Connect two shapes."]) await expect(page.getByText(flowchartStep)).toHaveCount(0);
    });

    test("a new element is selected with its label open and the whole label selected", async ({ page }) => {
      await type.open(page);
      await toolbox(page, type.add).click();
      await expect(type.items(page)).toHaveCount(1);
      await expect(editor(page)).toBeVisible();
      await expect(editor(page)).toBeFocused();
      await expect(editor(page)).toHaveValue(type.add);
      const selected = await editor(page).evaluate((field: HTMLTextAreaElement) => field.value.slice(field.selectionStart, field.selectionEnd));
      expect(selected).toBe(type.add);
      await expect(page.getByRole("region", { name: "Properties" }).getByText(`Selected: ${type.typeName}`, { exact: true })).toBeVisible();
      await expect(canvasOf(page).getByText(LABEL_PROMPT)).toBeVisible();
    });

    test("Enter saves the label and the element stays selected", async ({ page }) => {
      await type.open(page);
      await toolbox(page, type.add).click();
      await editor(page).fill("Alice");
      await editor(page).press("Enter");
      await expect(editor(page)).toHaveCount(0);
      await expect(type.labelled(page, "Alice")).toHaveCount(1);
      await expect(type.items(page).first()).toHaveAttribute("aria-pressed", "true");
      await expect(canvasOf(page).getByText(LABEL_PROMPT)).toHaveCount(0);
    });

    test("Escape restores the previous label", async ({ page }) => {
      await type.open(page);
      await toolbox(page, type.add).click();
      await editor(page).fill("Something else");
      await editor(page).press("Escape");
      await expect(editor(page)).toHaveCount(0);
      await expect(type.labelled(page, type.add)).toHaveCount(1);
      await expect(type.labelled(page, "Something else")).toHaveCount(0);
    });

    test("an empty label keeps the editor open with a message and keeps the previous label", async ({ page }) => {
      await type.open(page);
      await toolbox(page, type.add).click();
      await editor(page).fill("");
      await editor(page).press("Enter");
      await expect(editor(page)).toBeVisible();
      await expect(page.getByText("A label cannot be empty.")).toBeVisible();
      await editor(page).press("Escape");
      await expect(type.labelled(page, type.add)).toHaveCount(1);
    });
  });
}

async function centreOf(item: Locator): Promise<{ x: number; y: number }> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Presses on a handle and moves towards a point, leaving the pointer held down so the line is still being drawn. */
async function startLine(page: Page, handle: Locator, towards: { x: number; y: number }): Promise<void> {
  const from = await centreOf(handle);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 6, from.y + 6);
  await page.mouse.move(towards.x, towards.y, { steps: 10 });
}

test("while a message is drawn the prompt names the receiving participant and Escape, which cancels it", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "Alice"], ["Participant", "Bob"]);
  const prompt = "Choose the receiving participant. Press Escape to cancel.";
  await expect(canvasOf(page).getByText(prompt)).toHaveCount(0);

  const bob = await centreOf(participantLabelled(page, "Bob").getByTestId("lifeline"));
  await startLine(page, participantLabelled(page, "Alice").getByTestId("lifeline"), bob);
  await expect(canvasOf(page).getByText(prompt)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(canvasOf(page).getByText(prompt)).toHaveCount(0);
  await page.mouse.up();
  await expect(canvasOf(page).getByTestId("message")).toHaveCount(0);
});

test("while a relationship is drawn the prompt names the target element and Escape, which cancels it", async ({ page }) => {
  await openNew(page, "context");
  await addItem(page, "Person", "Customer");
  await addItem(page, "System", "Bank");
  const prompt = "Choose the target element. Press Escape to cancel.";
  await expect(canvasOf(page).getByText(prompt)).toHaveCount(0);

  await startLine(page, await handlesOf(itemLabelled(page, "Customer"), "right"), await centreOf(itemLabelled(page, "Bank")));
  await expect(canvasOf(page).getByText(prompt)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(canvasOf(page).getByText(prompt)).toHaveCount(0);
  await page.mouse.up();
  await expect(canvasOf(page).getByTestId("c4-relationship")).toHaveCount(0);
});
