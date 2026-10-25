import { describe, expect, it } from "vitest";
import { escapeTarget, type EscapeInput } from "./escape";

// VO-042 (FR-005, FR-009, EC-02): one Escape press cancels only the innermost active operation, in the order label edit,
// then connection, then selection. A text field that has focus keeps its own Escape.
const idle: EscapeInput = { labelEditing: false, connecting: false, selection: null, typing: false };

describe("escapeTarget", () => {
  it("cancels a label edit first, even while a connection is in progress", () => {
    expect(escapeTarget({ ...idle, labelEditing: true, connecting: true, selection: 4 })).toBe("label");
  });

  it("cancels a label edit with nothing else active", () => {
    expect(escapeTarget({ ...idle, labelEditing: true, selection: 4 })).toBe("label");
  });

  it("cancels a connection in progress when no label is being edited, and keeps the selection", () => {
    expect(escapeTarget({ ...idle, connecting: true, selection: 4 })).toBe("connection");
  });

  it("clears the selection when nothing is being edited or connected", () => {
    expect(escapeTarget({ ...idle, selection: 4 })).toBe("selection");
  });

  it("has nothing to do when nothing is active and nothing is selected", () => {
    expect(escapeTarget(idle)).toBeNull();
  });

  it("leaves Escape to the text field that has focus, whatever else is active", () => {
    expect(escapeTarget({ labelEditing: true, connecting: true, selection: 4, typing: true })).toBeNull();
    expect(escapeTarget({ ...idle, selection: 4, typing: true })).toBeNull();
  });
});
