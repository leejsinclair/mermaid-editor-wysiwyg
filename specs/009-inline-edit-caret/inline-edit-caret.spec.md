# Feature Specification: Inline Edit Caret Stays Put

**Feature Branch**: `009-inline-edit-caret`
**Created**: 2026-11-06
**Status**: Draft

**Grilled on**: 2026-11-06

**Input**: "There is an issue when editing labels and shape text. When I start typing, say at the beginning of the text, the first letter I type appears there and then the cursor jumps to the end of the text and what I type is appended to the end. This happens when I start typing at the beginning or somewhere in the middle. Typing text in the properties panel is fine."

## Clarifications

### Session 2026-11-06

- Q: Should the fix also be proved on a phone, where the on-screen keyboard holds each word back while it is being typed? → A: Yes, add one phone test that types at the start and in the middle of a shape label.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type in the middle of a label on the canvas (Priority: P1)

A diagram author opens a shape's text for editing on the canvas, places the cursor at the start or in the middle of the existing text, and types a word. Every character lands where the cursor is, one after another, and the cursor moves forward with them. Today only the first character lands in place; the cursor then jumps to the end and the rest of the word is appended there, so the author has to retype the label in the properties panel.

**Why this priority**: Editing text in place is the main way to name shapes. Any correction other than appending is broken, so this is the whole fix.

**Independent Test**: Open a shape labelled "World" for editing, put the cursor before "W", type "Hello ", and confirm the label reads "Hello World" both on the canvas and in the generated source.

**Acceptance Scenarios**:

1. **Given** a shape labelled "World" open for editing on the canvas, **When** the author moves the cursor to the start and types "Hello ", **Then** the text reads "Hello World" and the cursor sits just before "W".
2. **Given** a shape labelled "Ac" open for editing, **When** the author puts the cursor between "A" and "c" and types "bb", **Then** the text reads "Abbc" and the cursor sits just before "c".
3. **Given** a shape labelled "Hello World" open for editing, **When** the author selects "World" and types "There", **Then** the text reads "Hello There".
4. **Given** the edited text from any scenario above, **When** the author presses Enter, **Then** the shape and the generated source show exactly that text.

---

### User Story 2 - The same holds for connection labels and other diagram types (Priority: P2)

The author edits a connection's label on the canvas, or a label in a sequence or C4 diagram, and inserts text before or within the existing words. The cursor behaves exactly as for a shape.

**Why this priority**: The same in-place editor serves every label, so the fix must hold everywhere it appears. Shapes are reported first; the others follow from the same cause.

**Independent Test**: Open a connection labelled "yes" for editing, put the cursor at the start, type "say ", and confirm the label reads "say yes".

**Acceptance Scenarios**:

1. **Given** a connection labelled "yes" open for editing on the canvas, **When** the author types "say " at the start, **Then** the label reads "say yes".
2. **Given** a sequence or C4 label open for editing on the canvas, **When** the author types in the middle of it, **Then** the characters land at the cursor in the order typed.

### Edge Cases

- Deleting with Backspace or Delete in the middle of the text removes only the character beside the cursor, and the cursor stays where it was.
- Pasting in the middle of the text inserts the pasted text at the cursor and leaves the cursor at the end of the pasted part, as it does today.
- Typing fast (several keys before the screen redraws) keeps every character, in order, at the cursor.
- Composed input (accented letters, input methods for other scripts) lands at the cursor and is not split or duplicated.
- Shift+Enter in the middle of a label inserts a line break at the cursor, and the editor grows to show the new line without moving the cursor.
- Ctrl+Z while typing undoes the field's own typing, step by step, and leaves the diagram unchanged (the canvas-interaction living spec, "Shortcuts never take over typing").
- Undo and Redo after committing an inline edit restore the label as a whole, as they do today.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each character typed into a label being edited on the canvas MUST be inserted at the cursor position, whether the cursor is at the start, in the middle or at the end of the text.
- **FR-002**: After each typed character, the cursor MUST sit immediately after that character, so the next character continues from there.
- **FR-003**: Typing while part of the text is selected MUST replace exactly that selection and leave the cursor after the typed text.
- **FR-004**: Deleting a character in the middle of the text MUST leave the cursor at the place of the deletion.
- **FR-005**: The cursor behaviour in FR-001 to FR-004 MUST hold for every label edited in place: flowchart shapes and connections, and sequence and C4 labels.
- **FR-006**: The text committed from an inline edit MUST be exactly the text shown in the editor at the moment of committing.
- **FR-007**: Opening a label for editing on the canvas MUST still select the whole label, and pasting MUST still insert plain text at the cursor.
- **FR-008**: The behaviour in FR-001 and FR-002 MUST hold when typing on a phone with its on-screen keyboard.

### Key Entities

- **Label draft**: the text being typed into a label on the canvas before it is committed. It belongs to one shape, connection or diagram item, and becomes that item's label on commit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Typing a 10-character word at the start, in the middle and at the end of an existing label produces the expected text in 100% of attempts, for shapes, connections, sequence labels and C4 labels, and for a shape label typed on a phone.
- **SC-002**: After typing into the middle of a label, the cursor is at the expected position in 100% of attempts.
- **SC-003**: Existing tests for opening, committing, cancelling and pasting into an inline edit still pass.

## Assumptions

- The properties panel is unaffected and needs no change; the user reports it works.
- The fault lies in the shared in-place editor, so one fix covers every diagram type. The tests confirm this for each type.
- No change to how an edit opens, commits, cancels or reaches undo history is wanted.

## Approach

- **Likely cause**: the in-place editor's text is driven by the editor state, and on the canvas that state reaches the field a render later (the canvas library passes node and line data through its own store). React then rewrites the field's value after the keystroke, which drops the caret at the end. The properties panel field has no such hop, so it is fine. The first failing test confirms this before any fix.
- **Fix in one place**: `app/rendering/shared/InlineLabelEditor.tsx` keeps the typed text and caret in the field itself and reports each change upward, taking a new value from props only when it differs from what the field already shows (for example after paste). Every diagram type uses this editor, so one change covers FR-005.
- **Tests**: a new Playwright suite `e2e/inline-edit-caret.spec.ts` types at the start, in the middle and over a selection for a flowchart shape, a connection, a sequence label and a C4 label, and checks the text, the caret position and the generated source. One phone test in the touch suite (`e2e/touch/`) types at the start and in the middle of a shape label (FR-008). Existing `e2e/inline-edit*.spec.ts` suites cover open, commit, cancel and paste (SC-003).
- **No dependencies** added.

## ADDED Requirements
<!-- capability: canvas-interaction -->

### Typing a label in place keeps the caret where it is typed

This holds for shape, connection, sequence and C4 labels, and when typing with a phone's on-screen keyboard.

#### Scenario: typing at the start of a shape label

- **WHEN** a flowchart shape labelled "Rectangle" is open for editing, the caret is at the start and the person types "ab"
- **THEN** the field reads "abRectangle" and the caret sits just before "R"

#### Scenario: typing in the middle of a shape label

- **WHEN** a flowchart shape labelled "Rectangle" is open for editing, the caret is just after "R" and the person types "cd"
- **THEN** the field reads "Rcdectangle" and the caret sits just before "e"
