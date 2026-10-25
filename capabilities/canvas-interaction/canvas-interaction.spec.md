# Canvas interaction — Living Spec

## Purpose

The canvas is where a person places and moves things by hand. Without these gestures and keys the editor cannot be used, and a shortcut that takes over typing would lose what the person is writing.

## Requirements

### An item moves by dragging or by arrow keys [inferred]
<!-- touches: app/rendering/shared/dnd.ts, app/rendering/shared/useDrag.ts, app/rendering/shared/interaction.ts, app/editor/keyboard.ts, app/editor/selection.ts -->

A selected node or box can be dragged to a new place, or moved with the arrow keys.

#### Scenario: a selected node is moved with the arrow keys

- **WHEN** a node is selected and the person presses an arrow key
- **THEN** the node moves in that direction

### Shortcuts never take over typing [inferred]
<!-- touches: app/editor/keyboard.ts -->

While the person types in a text field, including a label typed on the canvas, the editor's shortcuts do not act. Undo in a text field is the browser's own.

#### Scenario: a label is being typed

- **WHEN** the person presses Ctrl+Z while typing a label
- **THEN** the text field undoes its own typing, and the diagram is not changed

### F2 renames the selected item [inferred]
<!-- touches: app/editor/keyboard.ts, app/editor/inlineEdit.ts -->

Pressing F2 opens the selected item's label for typing in place.

#### Scenario: F2 on a node

- **WHEN** a node is selected and the person presses F2
- **THEN** the node's label opens for editing on the canvas

### Zoom and fit show the whole drawing [inferred]
<!-- touches: app/rendering/shared/viewport.ts, app/rendering/shared/zoomStore.ts, app/rendering/shared/pinch.ts -->

The canvas zooms in and out. Fit to view shows the whole drawing, and never draws it larger than its own size. The zoom level is shown in the status bar.

#### Scenario: fit to view on a small sequence diagram

- **WHEN** the person chooses Fit to view on a diagram smaller than the canvas
- **THEN** the diagram is shown at its own size, not enlarged

### Touch screens pan, pinch and double-tap [inferred]
<!-- touches: app/rendering/shared/touchPan.ts, app/rendering/shared/pinch.ts, app/rendering/shared/useDoubleActivation.ts -->

On a touch screen, dragging empty canvas pans it, pinching zooms it, and double-tapping an item renames it.

#### Scenario: a double tap on a node

- **WHEN** the person double-taps a node on a touch screen
- **THEN** the node's label opens for editing

## Uncovered

- Nothing in this area is left without an owner.
