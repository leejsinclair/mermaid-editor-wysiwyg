import type { CDPSession, Locator, Page } from "@playwright/test";

// Touch for the emulated phones (feature 007, research R9). A tap uses Playwright's touchscreen, which works in Chromium and
// WebKit. A drag and a pinch need several fingers over time, which Playwright has no call for: in Chromium they are sent as
// real touch input through the DevTools protocol; in WebKit, which has no such protocol, the same touch and pointer events a
// finger produces are dispatched from inside the page.

export interface Point {
  readonly x: number;
  readonly y: number;
}

interface Finger extends Point {
  readonly id: number;
}

export async function centreOf(target: Locator): Promise<Point> {
  const box = await target.boundingBox();
  if (!box) throw new Error("The element must be on screen");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const sessions = new WeakMap<Page, Promise<Touches>>();

/** One touch session per page, so taps and drags are sent the same way and the browser sees one stream of touches. */
function touchesOf(page: Page): Promise<Touches> {
  const known = sessions.get(page);
  if (known) return known;
  const made = Touches.open(page);
  sessions.set(page, made);
  return made;
}

/** Taps the middle of an element with one finger. */
export async function tap(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const at = await centreOf(target);
  await touchesOf(page).then((touches) => touches.tapAt(at));
}

/** Two taps in quick succession on one point: a double-tap. */
export async function doubleTap(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const at = await centreOf(target);
  const touches = await touchesOf(page);
  await touches.tapAt(at);
  await touches.tapAt(at, { quickly: true });
}

/** Fingers on the screen: put them down, move them, lift them, together or one at a time. Create one with `Touches.attach`. */
/** A finger takes a moment between coming up and going down again; Chromium loses a touch that begins sooner than this after one ended. */
const LIFT_TO_TOUCH_MS = 150;
/** How long a dragged finger rests before it lifts. */
const DRAG_REST_MS = 80;

export class Touches {
  private active: Finger[] = [];
  private nextId = 0;
  private lastLift = 0;

  private constructor(
    private readonly page: Page,
    private readonly client: CDPSession | undefined,
  ) {}

  /** The touch session of the page: taps and drags of one page share it. */
  static attach(page: Page): Promise<Touches> {
    return touchesOf(page);
  }

  static async open(page: Page): Promise<Touches> {
    const protocol = page.context().browser()?.browserType().name() === "chromium";
    return new Touches(page, protocol ? await page.context().newCDPSession(page) : undefined);
  }

  /** A tap: a finger goes down and comes up at once. WebKit has no touch protocol, so there Playwright's own touchscreen taps. */
  async tapAt(point: Point, { quickly = false }: { quickly?: boolean } = {}): Promise<void> {
    if (!this.client) {
      await this.page.touchscreen.tap(point.x, point.y);
      return;
    }
    // The second tap of a double-tap goes down at once, with no pause after the first came up.
    if (quickly) await this.down([point]);
    else await this.press(point);
    await this.lift();
  }

  /** Puts fingers down together at these points, after the pause a finger takes between coming up and going down. */
  async press(...points: readonly Point[]): Promise<void> {
    await this.afterLift();
    await this.down(points);
  }

  private async down(points: readonly Point[]): Promise<void> {
    if (this.active.length === 0) this.nextId = 0;
    const fingers = points.map((point) => this.finger(point));
    this.active = [...this.active, ...fingers];
    await this.send("start", fingers);
  }

  /** Puts one more finger down while the others stay where they are; returns which finger it is. */
  async addFinger(point: Point): Promise<number> {
    const added = this.finger(point);
    this.active = [...this.active, added];
    await this.send("start", [added]);
    return added.id;
  }

  /** Moves the fingers that are down, in the order they went down, in as many steps as asked, to these points. */
  async slide(steps: number, ...points: readonly Point[]): Promise<void> {
    const moving = this.active.slice(0, points.length);
    for (let step = 1; step <= steps; step += 1) {
      const share = step / steps;
      const now = moving.map((finger, at) => {
        const to = points.at(at) ?? finger;
        return { id: finger.id, x: finger.x + (to.x - finger.x) * share, y: finger.y + (to.y - finger.y) * share };
      });
      this.active = this.active.map((finger) => now.find((moved) => moved.id === finger.id) ?? finger);
      await this.send("move", now);
    }
  }

  /** Moves one finger, in as many steps as asked, to a point. */
  async moveFinger(id: number, steps: number, to: Point): Promise<void> {
    const from = this.active.find((finger) => finger.id === id);
    if (!from) throw new Error(`Finger ${String(id)} is not down`);
    for (let step = 1; step <= steps; step += 1) {
      const share = step / steps;
      const moved = { id, x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share };
      this.active = this.active.map((finger) => (finger.id === id ? moved : finger));
      await this.send("move", [moved]);
    }
  }

  /** Lifts one finger. */
  async liftFinger(id: number): Promise<void> {
    const lifted = this.active.filter((finger) => finger.id === id);
    this.active = this.active.filter((finger) => finger.id !== id);
    await this.send("end", lifted);
  }

  /** Lifts every finger. */
  async lift(): Promise<void> {
    const lifted = this.active;
    this.active = [];
    await this.send("end", lifted);
    this.lastLift = Date.now();
  }

  /** One finger from a point to another: press, slide, lift. */
  async drag(from: Point, to: Point, steps = 10): Promise<void> {
    await this.press(from);
    await this.slide(steps, to);
    // A finger that is lifted while it is still moving starts a fling, and Chromium takes the next tap to be the one that stops it: a
    // person lets go of a drag at rest, so the finger rests a moment first.
    await new Promise((done) => setTimeout(done, DRAG_REST_MS));
    await this.lift();
  }

  /** Two fingers either side of a centre, moved apart or together. */
  async pinch(centre: Point, fromDistance: number, toDistance: number, steps = 8): Promise<void> {
    const at = (distance: number): [Point, Point] => [
      { x: centre.x - distance / 2, y: centre.y },
      { x: centre.x + distance / 2, y: centre.y },
    ];
    await this.press(...at(fromDistance));
    await this.slide(steps, ...at(toDistance));
    await this.lift();
  }

  private async afterLift(): Promise<void> {
    const wait = this.lastLift + LIFT_TO_TOUCH_MS - Date.now();
    if (this.active.length === 0 && wait > 0) await new Promise((done) => setTimeout(done, wait));
  }

  private finger(point: Point): Finger {
    const id = this.nextId;
    this.nextId += 1;
    return { id, x: point.x, y: point.y };
  }

  /** `changed` are the fingers this event is about; the others that are down are carried along as they are. */
  private async send(phase: Phase, changed: readonly Finger[]): Promise<void> {
    if (this.client) {
      const type = PROTOCOL_TOUCH.get(phase) ?? "touchMove";
      await this.client.send("Input.dispatchTouchEvent", { type, touchPoints: this.active.map(({ id, x, y }) => ({ id, x, y })) });
      return;
    }
    await this.page.evaluate(dispatchInPage, { phase, active: [...this.active], changed: [...changed] });
  }
}

type Phase = "start" | "move" | "end";

type ProtocolTouch = "touchStart" | "touchMove" | "touchEnd";

const PROTOCOL_TOUCH: ReadonlyMap<Phase, ProtocolTouch> = new Map<Phase, ProtocolTouch>([
  ["start", "touchStart"],
  ["move", "touchMove"],
  ["end", "touchEnd"],
]);

/** Runs in the page, so it is self-contained: the pointer and touch events of fingers, in the order a browser sends them. */
function dispatchInPage({ phase, active, changed }: { phase: Phase; active: Finger[]; changed: Finger[] }): void {
  const pointerNames = new Map<Phase, string>([["start", "pointerdown"], ["move", "pointermove"], ["end", "pointerup"]]);
  const touchNames = new Map<Phase, string>([["start", "touchstart"], ["move", "touchmove"], ["end", "touchend"]]);
  const state = window as unknown as { __touchTargets?: Map<number, Element> };
  const targets = (state.__touchTargets ??= new Map<number, Element>());
  const targetOf = (finger: Finger): Element => targets.get(finger.id) ?? document.elementFromPoint(finger.x, finger.y) ?? document.body;
  const touchOf = (finger: Finger): Touch =>
    new Touch({ identifier: finger.id, target: targetOf(finger), clientX: finger.x, clientY: finger.y, pageX: finger.x + window.scrollX, pageY: finger.y + window.scrollY, radiusX: 1, radiusY: 1, force: 1 });
  const pointerFor = (finger: Finger): PointerEvent =>
    new PointerEvent(pointerNames.get(phase) ?? "pointermove", { bubbles: true, cancelable: true, composed: true, pointerId: 100 + finger.id, pointerType: "touch", isPrimary: finger.id === 0, clientX: finger.x, clientY: finger.y, buttons: phase === "end" ? 0 : 1 });

  if (phase === "start") for (const finger of changed) targets.set(finger.id, targetOf(finger));
  for (const finger of changed) targetOf(finger).dispatchEvent(pointerFor(finger));
  // WebKit as Playwright runs it has no Touch constructor: there the pointer events above are all that can be sent.
  const first = changed.at(0);
  if (first) {
    try {
      const touches = active.map(touchOf);
      targetOf(first).dispatchEvent(
        new TouchEvent(touchNames.get(phase) ?? "touchmove", { bubbles: true, cancelable: true, composed: true, touches, targetTouches: touches, changedTouches: changed.map(touchOf) }),
      );
    } catch {
      // No touch events in this browser.
    }
  }
  if (phase === "end") for (const finger of changed) targets.delete(finger.id);
}

export type DiagramKind = "flowchart" | "sequence" | "c4";

const ADDRESSES: ReadonlyMap<DiagramKind, string> = new Map([
  ["flowchart", "#/new/flowchart"],
  ["sequence", "#/new/sequence"],
  ["c4", "#/new/c4/context"],
]);

export const addressOf = (kind: DiagramKind): string => ADDRESSES.get(kind) ?? "#/";

/** The first toolbox item of each diagram type and what it draws, for tests that need one item on the canvas. */
const FIRST_ITEMS: ReadonlyMap<DiagramKind, { readonly add: string; readonly drawn: string }> = new Map([
  ["flowchart", { add: "Rectangle", drawn: ".react-flow__node" }],
  ["sequence", { add: "Participant", drawn: '[data-testid="participant"]' }],
  ["c4", { add: "Person", drawn: '[data-testid="c4-element"]' }],
]);

export const firstItemOf = (kind: DiagramKind): { readonly add: string; readonly drawn: string } => FIRST_ITEMS.get(kind) ?? { add: "", drawn: "" };

/** Opens or closes the Tools panel of a narrow layout by tap, when the layout has one. */
export async function toggleTools(page: Page): Promise<void> {
  await page.getByRole("region", { name: "Diagram canvas" }).waitFor();
  const tools = page.getByRole("button", { name: "Tools", exact: true });
  if (await tools.isVisible()) await tap(page, tools);
}

/** A new diagram of a type with one item on it, made by tapping, with the Tools panel closed again. */
export async function openWithItem(page: Page, kind: DiagramKind): Promise<Locator> {
  await page.goto(addressOf(kind));
  await page.getByRole("region", { name: "Diagram canvas" }).waitFor();
  await toggleTools(page);
  const { add, drawn } = firstItemOf(kind);
  await tap(page, page.getByRole("region", { name: "Toolbox" }).getByRole("button", { name: add, exact: true }));
  await toggleTools(page);
  const item = page.locator(drawn).first();
  await item.waitFor();
  return item;
}

/** The zoom shown in the status area, in percent. */
export async function zoomShown(page: Page): Promise<number> {
  const text = (await page.getByRole("region", { name: "Editor status" }).textContent()) ?? "";
  return Number(/Zoom (\d+)%/.exec(text)?.[1]);
}

/** Taps Zoom in until the zoom stops growing, so a drawing is larger than its canvas and can be scrolled. */
export async function zoomInFully(page: Page): Promise<void> {
  const zoomIn = page.getByRole("toolbar", { name: "Diagram actions" }).getByRole("button", { name: "Zoom in" });
  let last = await zoomShown(page);
  for (let press = 0; press < 14; press += 1) {
    await tap(page, zoomIn);
    await page.waitForTimeout(250);
    const now = await zoomShown(page);
    if (now === last) return;
    last = now;
  }
}

/** Taps Zoom in until a sequence or C4 drawing is wider than its canvas, so there is something to scroll. */
export async function zoomUntilScrollable(page: Page): Promise<void> {
  const zoomIn = page.getByRole("toolbar", { name: "Diagram actions" }).getByRole("button", { name: "Zoom in" });
  const scrolls = (): Promise<boolean> =>
    page.getByRole("region", { name: "Diagram canvas" }).evaluate((region) => {
      const area = [...region.querySelectorAll("div")].find((candidate) => getComputedStyle(candidate).overflow === "auto");
      return area !== undefined && area.scrollWidth > area.clientWidth + 120;
    });
  for (let press = 0; press < 12 && !(await scrolls()); press += 1) {
    await tap(page, zoomIn);
    await page.waitForTimeout(250);
  }
}

/** A point of the canvas that is on the screen and is not on an item, a handle or a line, found by looking from the bottom right. */
export function emptyPoint(page: Page): Promise<Point> {
  return page.getByRole("region", { name: "Diagram canvas" }).evaluate((region) => {
    const box = region.getBoundingClientRect();
    const right = Math.min(box.right, window.innerWidth) - 24;
    const bottom = Math.min(box.bottom, window.innerHeight) - 24;
    for (let y = bottom; y > box.top + 24; y -= 24) {
      for (let x = right; x > box.left + 24; x -= 24) {
        const found = document.elementFromPoint(x, y);
        if (found && region.contains(found) && found.closest("[data-zone], input, textarea, [contenteditable], a, button") === null) return { x, y };
      }
    }
    throw new Error("The canvas has no empty point on the screen");
  });
}

/** Two points of empty canvas on the screen, side by side and `spread` apart, found from the bottom right: where a pinch can begin. */
export function emptyPair(page: Page, spread: number): Promise<readonly [Point, Point]> {
  return page.getByRole("region", { name: "Diagram canvas" }).evaluate((region, apart) => {
    const box = region.getBoundingClientRect();
    const right = Math.min(box.right, window.innerWidth) - 24;
    const bottom = Math.min(box.bottom, window.innerHeight) - 24;
    const empty = (x: number, y: number): boolean => {
      const found = document.elementFromPoint(x, y);
      return found !== null && region.contains(found) && found.closest("[data-zone], input, textarea, [contenteditable], a, button") === null;
    };
    for (let y = bottom; y > box.top + 24; y -= 24) {
      for (let x = right; x - apart > box.left + 24; x -= 12) {
        if (empty(x, y) && empty(x - apart, y)) return [{ x: x - apart, y }, { x, y }] as const;
      }
    }
    throw new Error("The canvas has no two empty points that far apart on the screen");
  }, spread);
}
