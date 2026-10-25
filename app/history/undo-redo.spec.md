# Undo and redo — Living Spec

## Purpose

Undo and redo let a person recover from a wrong move. Without them every edit is permanent, and a refused edit that still left a trace would make undo reverse the wrong thing.

## Requirements

### Undo reverses the last change and redo applies it again [inferred]
<!-- touches: app/history/**, app/editor/keyboard.ts -->

Undo returns the diagram to the state before the last change. Redo reapplies the change that undo removed.

#### Scenario: a change is undone and redone

- **WHEN** the person undoes a change and then redoes it
- **THEN** the diagram is the same as it was after the change

### A change that alters nothing is not an undo step [inferred]
<!-- touches: app/history/history.ts -->

An operation that would leave the diagram unchanged does not add a step to the history.

#### Scenario: a label is set to the text it already has

- **WHEN** the person sets a label to the text it already has
- **THEN** undo still reverts the change before it, not a no-op

### Changes that belong to one gesture undo together [inferred]
<!-- touches: app/history/history.ts -->

Changes made within one open group, such as several steps of one gesture, form one undo step.

#### Scenario: a grouped gesture is undone

- **WHEN** the person undoes after a gesture that made several grouped changes
- **THEN** all of those changes are reverted together

### A refused change leaves the history as it was [inferred]
<!-- touches: app/history/history.ts -->

A change the editor refuses is not added to the history, and it does not disturb what undo or redo would do next.

#### Scenario: a refused change is followed by undo

- **WHEN** the person attempts a change that is refused, then chooses Undo
- **THEN** undo reverts the last accepted change, not the refused one

### Undo history lasts for the page's session only [inferred]
<!-- touches: app/editor/sessions.ts, app/editor/library.ts -->

The undo history survives moving between a new diagram and its saved address within one page. Reloading the page or reopening the diagram starts with an empty history.

#### Scenario: the page is reloaded

- **WHEN** the person reloads the page
- **THEN** the diagram loads from its last saved state with nothing to undo

## Uncovered

- Nothing in this area is left without an owner.
