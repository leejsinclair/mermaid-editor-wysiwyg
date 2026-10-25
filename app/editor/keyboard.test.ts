// @vitest-environment jsdom
import { createElement, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { en } from "../text/en";
import { useEditorKeyboard, type KeyboardContext } from "./keyboard";
import type { EditorAction } from "./reducer";

// VO-019 (FR-005, FR-009, FR-032): Escape goes through the resolver, Delete reaches the reducer, and typing is left alone.
// Add and connect need no key of their own: the toolbox and panel buttons are focusable and dispatch through the same reducer.

let root: Root;
let host: HTMLElement;
let dispatch: ReturnType<typeof vi.fn<(action: EditorAction) => void>>;

function mount(context: KeyboardContext): void {
  function Harness() {
    useEditorKeyboard(dispatch, context);
    return null;
  }
  act(() => {
    root.render(createElement(Harness));
  });
}

function press(key: string, target: EventTarget = window): void {
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

function canvasItem(id: number): HTMLElement {
  const canvas = document.createElement("div");
  canvas.setAttribute("aria-label", en.editor.canvas);
  const item = document.createElement("div");
  item.setAttribute("data-id", String(id));
  canvas.append(item);
  document.body.append(canvas);
  return item;
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  dispatch = vi.fn<(action: EditorAction) => void>();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  document.body.replaceChildren();
});

describe("Escape", () => {
  it("cancels the label edit first, even with a connection in progress", () => {
    mount({ selection: 1, labelEditing: true, connecting: true });
    press("Escape");
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([{ type: "cancelDraft" }]);
  });

  it("cancels the connection when no label is being edited, and keeps the selection", () => {
    mount({ selection: 1, labelEditing: false, connecting: true });
    press("Escape");
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([{ type: "cancelConnection" }]);
  });

  it("clears the selection only when nothing else is active", () => {
    mount({ selection: 1, labelEditing: false, connecting: false });
    press("Escape");
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([{ type: "select", itemId: null }]);
  });

  it("leaves a press that a drag or a line being drawn has already cancelled", () => {
    mount({ selection: 1, labelEditing: false, connecting: false });
    const handled = (event: KeyboardEvent) => {
      event.preventDefault();
    };
    window.addEventListener("keydown", handled, true);
    press("Escape");
    window.removeEventListener("keydown", handled, true);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does nothing with nothing to cancel", () => {
    mount({ selection: null, labelEditing: false, connecting: false });
    press("Escape");
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("Delete", () => {
  it("deletes the selected canvas item through the reducer", () => {
    mount({ selection: 3, labelEditing: false, connecting: false });
    press("Delete", canvasItem(3));
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([{ type: "commit", operation: { op: "deleteItem", itemId: 3 } }]);
  });

  it("does not delete from outside the canvas", () => {
    mount({ selection: 3, labelEditing: false, connecting: false });
    press("Delete");
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("text entry", () => {
  it.each(["Escape", "Delete", "Backspace"])("leaves %s to a focused text field", (key) => {
    mount({ selection: 3, labelEditing: true, connecting: true });
    const field = document.createElement("input");
    document.body.append(field);
    press(key, field);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
