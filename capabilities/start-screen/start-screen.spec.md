# Start screen — Living Spec

> [DRAFT] Adopted from the code's surface and the project's conventions. Review before trusting.

## Purpose

The start screen is the only way in. Without it a person cannot begin a diagram or find the one they saved, and a saved diagram opened by a stale link must not show a broken editor.

## Requirements

### A person starts a new diagram of a chosen type [inferred]
<!-- touches: app/routes/start.tsx, app/model/newDiagram.ts, app/rendering/shared/C4KindDialog.tsx -->
<!-- adopted: app/routes/start.tsx -->

The start screen offers a new flowchart, sequence diagram or C4 diagram. Choosing one opens an empty diagram of that type in the editor. Choosing C4 first asks which kind, and says that Mermaid's C4 support is experimental.

#### Scenario: a C4 diagram is chosen

- **WHEN** the person chooses C4
- **THEN** they are asked for a kind before any diagram opens, and the experimental notice is shown

#### Scenario: a sequence diagram is chosen

- **WHEN** the person chooses sequence
- **THEN** an empty sequence diagram opens, named "Untitled sequence diagram"

### Saved diagrams are listed, most recently changed first [inferred]
<!-- touches: app/routes/start.tsx, app/editor/library.ts -->
<!-- adopted: app/editor/library.ts -->

The start screen lists the diagrams saved in this browser, most recently changed first, each with the time it was last changed. A record that cannot be read is still listed, with the reason, and it can only be deleted.

#### Scenario: a saved record cannot be read

- **WHEN** the start screen lists a saved record that is damaged
- **THEN** the record is shown with the reason it cannot be read, and no open action is offered for it

#### Scenario: nothing is saved yet

- **WHEN** no diagram has been saved in this browser
- **THEN** the list says that there are no saved diagrams yet

### Opening a saved diagram loads its last saved content [inferred]
<!-- touches: app/routes/editor.tsx, app/editor/library.ts, app/editor/sessions.ts -->
<!-- adopted: app/routes/editor.tsx -->

Opening a saved diagram shows the content as it was last saved, with an empty undo history. A link to a diagram that no longer exists returns the person to the start screen.

#### Scenario: the diagram id names nothing saved

- **WHEN** someone opens an editor address for a diagram id that is not saved in this browser
- **THEN** they are sent to the start screen

### Deleting a saved diagram asks first [inferred]
<!-- touches: app/editor/library.ts, app/routes/start.tsx -->
<!-- adopted: app/editor/library.ts -->

Deleting a saved diagram needs a confirmation. The confirmation says that the diagram is removed from this browser for good, and that a file saved from it is not affected.

#### Scenario: delete is confirmed

- **WHEN** the person chooses Delete and then confirms
- **THEN** the diagram is removed from this browser

#### Scenario: another tab has the diagram open

- **WHEN** the diagram is open in another tab
- **THEN** Delete is not offered, and the row says the diagram is open in another tab

## Uncovered

- Nothing in this area is left without an owner.
