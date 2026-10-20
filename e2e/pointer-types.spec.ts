import { expect, test, type CDPSession, type Locator, type Page } from "@playwright/test";
import { addShape } from "./support/flowchart";
import { addItem, canvas as c4Canvas, handlesOf, itemLabelled, openNew, sourceLines as c4SourceLines } from "./support/c4";
import { addParticipants, canvas as sequenceCanvas, participantLabelled, participantNames } from "./support/sequence";

// Touch and pen behave like the mouse (spec 004-canvas-usability, US5), in Chromium, through the DevTools protocol: Firefox has no
// protocol for synthetic touch or pen, so real hardware is checked by hand (MV-001).
// VO-027 (FR-019, US5-AS1): body and handle drags give the results of VO-017 and VO-025. VO-028 (FR-019, US5-AS2): a tap selects
// an unselected item and shows its handles. VO-029 (FR-019, US5-AS3): a double-tap on an item or a line opens the editor.

test.use({ hasTouch: true });
test.beforeEach(({ browserName }, testInfo) => {
  testInfo.skip(browserName !== "chromium", "Touch and pen are driven through the Chromium DevTools protocol");
});

interface Point {
  x: number;
  y: number;
}

const POINTERS = ["touch", "pen"] as const;
type Pointer = (typeof POINTERS)[number];

async function centreOf(item: Locator): Promise<Point> {
  const box = await item.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** One finger or one pen, driven through the DevTools protocol. */
class Stylus {
  private constructor(
    private readonly client: CDPSession,
    private readonly kind: Pointer,
  ) {}

  static async attach(page: Page, kind: Pointer): Promise<Stylus> {
    return new Stylus(await page.context().newCDPSession(page), kind);
  }

  private async send(phase: "down" | "move" | "up", at: Point): Promise<void> {
    if (this.kind === "touch") {
      const types = { down: "touchStart", move: "touchMove", up: "touchEnd" } as const;
      await this.client.send("Input.dispatchTouchEvent", { type: types[phase], touchPoints: phase === "up" ? [] : [{ x: at.x, y: at.y }] });
      return;
    }
    const types = { down: "mousePressed", move: "mouseMoved", up: "mouseReleased" } as const;
    await this.client.send("Input.dispatchMouseEvent", {
      type: types[phase],
      x: at.x,
      y: at.y,
      button: phase === "move" ? "none" : "left",
      buttons: phase === "up" ? 0 : 1,
      clickCount: phase === "move" ? 0 : 1,
      pointerType: "pen",
      force: 0.5,
    });
  }

  async drag(from: Point, to: Point, steps = 12): Promise<void> {
    await this.send("down", from);
    await this.send("move", { x: from.x + 4, y: from.y + 4 });
    for (let step = 1; step <= steps; step += 1) await this.send("move", { x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps });
    await this.send("up", to);
  }

  async tap(at: Point): Promise<void> {
    await this.send("down", at);
    await this.send("up", at);
  }

  async doubleTap(at: Point): Promise<void> {
    await this.tap(at);
    await new Promise((resolve) => setTimeout(resolve, 90));
    await this.tap(at);
  }
}

const properties = (page: Page) => page.getByRole("region", { name: "Properties" });

for (const kind of POINTERS) {
  test.describe(`with ${kind}`, () => {
    test(`a flowchart node is moved by its body and a line is drawn from its handle (${kind})`, async ({ page }) => {
      await page.goto("#/new/flowchart");
      const canvas = page.getByRole("region", { name: "Diagram canvas" });
      await addShape(page, canvas, "Rectangle", { x: 150, y: 140 });
      await addShape(page, canvas, "Circle", { x: 450, y: 140 });
      const [first, second] = [canvas.getByLabel(/^Rectangle node/), canvas.getByLabel(/^Circle node/)];
      const stylus = await Stylus.attach(page, kind);
      const before = await first.boundingBox();

      await stylus.drag(await centreOf(first), { x: (await centreOf(first)).x + 40, y: (await centreOf(first)).y + 150 });
      const after = await first.boundingBox();
      expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeGreaterThan(60);
      await expect(canvas.locator(".react-flow__edge")).toHaveCount(0);

      await stylus.drag(await centreOf(first.locator('[data-side="right"]')), await centreOf(second));
      await expect(canvas.locator(".react-flow__edge")).toHaveCount(1);
      await expect(canvas.locator(".react-flow__edge")).toHaveAccessibleName(/^Solid arrow connection from Rectangle to Circle$/);
    });

    test(`a participant is reordered by its header and a message is drawn from its lifeline (${kind})`, async ({ page }) => {
      await page.goto("#/new/sequence");
      await addParticipants(page, ["Participant", "A"], ["Participant", "B"], ["Participant", "C"]);
      const stylus = await Stylus.attach(page, kind);
      const header = (name: string) => participantLabelled(page, name).getByTestId("participant-header");

      await stylus.drag(await centreOf(header("A")), await centreOf(header("C")));
      expect(await participantNames(page)).toEqual(["Participant: B", "Participant: C", "Participant: A"]);
      await expect(sequenceCanvas(page).getByTestId("message")).toHaveCount(0);

      const lifeline = await participantLabelled(page, "B").getByTestId("lifeline").boundingBox();
      const target = await centreOf(header("C"));
      if (!lifeline) throw new Error("The lifeline must be on screen");
      await stylus.drag({ x: lifeline.x + lifeline.width / 2, y: lifeline.y + 24 }, target);
      await expect(sequenceCanvas(page).getByTestId("message")).toHaveCount(1);
    });

    test(`a C4 element is moved into a boundary by its body and a relationship is drawn from its handle (${kind})`, async ({ page }) => {
      await openNew(page, "container");
      await addItem(page, "Person", "Alpha");
      await addItem(page, "System", "Beta");
      await addItem(page, "System", "Gamma");
      const stylus = await Stylus.attach(page, kind);

      await stylus.drag(await centreOf(await handlesOf(itemLabelled(page, "Beta"), "right")), await centreOf(itemLabelled(page, "Gamma")));
      await expect(c4Canvas(page).getByTestId("c4-relationship")).toHaveCount(1);
      await expect(c4Canvas(page).getByTestId("c4-relationship")).toHaveAccessibleName(/^One-way relationship from Beta to Gamma: Uses$/);
      expect((await c4SourceLines(page)).slice(3)).toEqual(['Rel(e2, e3, "Uses")']);
    });
  });
}

test("a tap selects an unselected item and shows its handles, in each view", async ({ page }) => {
  await page.goto("#/new/flowchart");
  const canvas = page.getByRole("region", { name: "Diagram canvas" });
  await addShape(page, canvas, "Rectangle", { x: 300, y: 200 });
  const node = canvas.getByLabel(/^Rectangle node/);
  const stylus = await Stylus.attach(page, "touch");
  await page.mouse.move(2, 2);
  await page.getByRole("region", { name: "Diagram canvas" }).click({ position: { x: 5, y: 5 } });
  await expect(properties(page).getByRole("textbox", { name: "Label" })).toHaveCount(0);
  const handles = node.locator('[data-zone="connect"]');
  expect(await handles.first().evaluate((element) => getComputedStyle(element).opacity)).toBe("0");

  await stylus.tap(await centreOf(node));

  await expect(properties(page).getByRole("textbox", { name: "Label" })).toHaveValue("Rectangle");
  expect(await handles.first().evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
});

test("a double-tap on an item and on a line opens the editor", async ({ page }) => {
  await page.goto("#/new/sequence");
  await addParticipants(page, ["Participant", "A"], ["Participant", "B"]);
  await page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: "Solid arrow", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add message" });
  await dialog.getByRole("radiogroup", { name: "Sender" }).getByRole("radio", { name: /^A / }).check();
  await dialog.getByRole("radiogroup", { name: "Receiver" }).getByRole("radio", { name: /^B / }).check();
  await dialog.getByRole("button", { name: "Add message" }).click();
  const stylus = await Stylus.attach(page, "touch");
  const editor = page.getByTestId("inline-label-editor");

  await stylus.doubleTap(await centreOf(participantLabelled(page, "A").getByTestId("participant-header")));
  await expect(editor).toBeVisible();
  await editor.press("Escape");
  await expect(editor).toHaveCount(0);

  const message = sequenceCanvas(page).getByTestId("message");
  const row = await message.locator("path").first().boundingBox();
  if (!row) throw new Error("The message must be on screen");
  await stylus.doubleTap({ x: row.x + row.width * 0.25, y: row.y + row.height / 2 });
  await expect(editor).toBeVisible();
});
