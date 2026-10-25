// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { newDiagram } from "../model/newDiagram";
import type { Position } from "../model/operations";
import { en } from "../text/en";
import { Editor } from "./Editor";

// The Editor hands the save text, the unsaved flag and the cancel target to the components that show them (data-model.md).
// The children are replaced by recorders, so this checks the wiring and nothing about how each child draws it.

interface CanvasSeen {
  cancelTarget?: unknown;
  diagram?: { readonly content: { readonly nodes: readonly { readonly id: number }[] } };
  onAddNode?: (shape: string, position: Position) => void;
  onSelect?: (itemId: number | null) => void;
}

interface StatusSeen {
  saveText?: unknown;
  unsaved?: unknown;
}

const seen = vi.hoisted<{ canvas: CanvasSeen; status: StatusSeen }>(() => ({ canvas: {}, status: {} }));

vi.mock("../rendering/flowchart/FlowchartCanvas", () => ({
  FlowchartCanvas: (props: CanvasSeen) => {
    seen.canvas = props;
    return null;
  },
}));

vi.mock("../rendering/shared/StatusBar", () => ({
  StatusBar: (props: StatusSeen) => {
    seen.status = props;
    return null;
  },
}));

// A write that never finishes keeps the diagram unsaved for as long as the test looks at it.
vi.mock("./library", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  saveDiagram: () => new Promise<void>(() => undefined),
}));

class NoResize {
  observe(): void {
    return undefined;
  }
  unobserve(): void {
    return undefined;
  }
  disconnect(): void {
    return undefined;
  }
}

let root: Root;
let host: HTMLElement;
let ids = 0;

function mount(): void {
  act(() => {
    root.render(createElement(MemoryRouter, null, createElement(Editor, { initial: newDiagram(`wiring-${String(++ids)}`, "flowchart") })));
  });
}

function addNode(): number {
  act(() => {
    seen.canvas.onAddNode?.("rectangle", { x: 0, y: 0 });
  });
  const id = seen.canvas.diagram?.content.nodes[0]?.id;
  if (id === undefined) throw new Error("the node was not added");
  return id;
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = NoResize;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  document.body.replaceChildren();
  sessionStorage.clear();
});

describe("Editor wiring", () => {
  it("starts with the new-diagram text, nothing unsaved and nothing for Escape to cancel", () => {
    mount();
    expect(seen.status.saveText).toBe(en.saveStatus.new);
    expect(seen.status.unsaved).toBe(false);
    expect(seen.canvas.cancelTarget).toBeNull();
  });

  it("passes the saving text and an unsaved flag once a change is committed and not yet written", () => {
    mount();
    addNode();
    expect(seen.status.saveText).toBe(en.saveStatus.saving);
    expect(seen.status.unsaved).toBe(true);
  });

  it("passes a selection as the cancel target", () => {
    mount();
    const id = addNode();
    act(() => {
      seen.canvas.onSelect?.(id);
    });
    expect(seen.canvas.cancelTarget).toBe("selection");
  });
});
