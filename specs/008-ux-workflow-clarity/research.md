# Research: Mermaid Editor UX and Workflow Clarity

## R1. Escape: one resolver, innermost first

**Decision**: a pure function in `app/editor/escape.ts` decides what Escape does, using the editor state. Order: cancel an active label edit, else cancel an in-progress connection, else clear the selection. Canvas and drag listeners stop handling Escape.

**Rationale**: FR-009 and the clarification need a second Escape to clear the selection. Three listeners currently act on the same press (`keyboard.ts`, `FlowchartCanvas.tsx` around line 136, and `useDrag.ts` around line 74). Without one resolver, a single Escape cancels a connection and also clears the selection.

**Alternatives considered**: keep the listeners and add a flag to each. Rejected: that spreads the order across three files and is hard to test. A single pure resolver is testable without a browser (constitution II).

**Guard**: while a text field is focused, the window listener still returns no shortcut, so the inline editor keeps its own Escape (`InlineLabelEditor.tsx`, `PropertiesPanel.tsx`).

## R2. One shared icon set as inline SVG

**Decision**: `app/rendering/shared/icons.tsx` exports one component per action in the contract table. Each has `aria-hidden` unless it stands alone, and the text label stays beside it.

**Rationale**: FR-040 forbids an icon library dependency. The shape previews already use inline SVG, so the pattern exists.

**Alternatives considered**: an icon font or a package. Rejected by FR-040 and by the constitution's dependency rule.

## R3. Disabled, not hidden, for conditional actions

**Decision**: element actions appear only when they apply to the selection (FR-014). An action that applies but whose condition fails is disabled, uses `aria-disabled="true"`, and carries the reason as text (FR-016).

**Rationale**: the current `PropertiesPanel` always renders controls and calls `onNeed` on a wrong selection, so a screen reader hears nothing. The spec needs both the "shown when relevant" and the "announced as unavailable" behaviour.

## R4. Toolbar grouping and overflow

**Decision**: the toolbar renders four labelled groups (History, Diagram editing, Export and sharing, View). Less frequent actions move into `MoreActions`, which already exists. Icon-only display is used only when the toolbar has no room (FR-042).

**Rationale**: `Toolbar.tsx` is a flat row with no groups. `MoreActions.tsx` is the existing overflow pattern, so no new menu component is needed.

## R5. Preview scope

**Decision**: the preview covers all three diagram types (flowchart, sequence and C4), each with its own element names. Settled in the spec Clarifications (2026-10-24).

**Rationale**: the clarification answer is explicit. The current code opens the preview for flowcharts only (`Editor.tsx`, `showLayoutNote`), so sequence and C4 preview work is in tasks.md Phase 9b (T048–T057).

## R6. Storage wording

**Decision**: three distinct user-facing phrases are used, each with its own string in `app/text/en.ts`: saved in this browser, saved as an editable file, and exported Mermaid source. "Save file" is used only for the file action and "Copy" only for the clipboard (FR-026, FR-027).

**Rationale**: the current status says "Saved" with no qualifier, and the "Not saved" text says "Save a file" in a way that can be confused with the Copy actions.
