# Diagram validation — Living Spec

## Purpose

Validation keeps every diagram one that can be drawn and saved. Without it an operation could leave a connection pointing at nothing, or a file could open into a diagram the editor cannot show, and the person would find out only later.

## Requirements

### An operation that would break the diagram is refused with the reason [inferred]
<!-- touches: app/validation/**, app/model/operations.ts -->

Before an operation is applied, the editor checks it. An operation that would break the diagram, or that the diagram type does not offer, is refused, and the reason is given.

#### Scenario: a node is changed to a connection type

- **WHEN** the person tries to change a node into a connection
- **THEN** the change is refused and the reason says to delete it and add the other kind instead

#### Scenario: an operation the diagram type does not offer

- **WHEN** an operation is requested that the diagram's kind does not offer
- **THEN** the change is refused and the reason names the kind

### A blank label is refused and the previous label is kept [inferred]
<!-- touches: app/validation/label.ts -->

A label needs at least one visible character. Text made only of spaces, line breaks or invisible characters is refused, and the previous label stays.

#### Scenario: a label is cleared

- **WHEN** the person types a label made only of spaces
- **THEN** the change is refused and the previous label is kept

### A diagram file is checked as a whole before it opens [inferred]
<!-- touches: app/validation/checkDiagram.ts -->

A diagram is checked from start to finish, and the first problem found is named in words the person can follow. Item numbers must be unique, positive whole numbers below the item counter.

#### Scenario: two items share a number

- **WHEN** a file contains two items with the same number
- **THEN** the file is refused and the problem names the repeated item

### A connection must start and end on items that exist [inferred]
<!-- touches: app/validation/flowchart.ts, app/validation/sequence.ts, app/validation/c4.ts, app/model/targets.ts -->

A connection, message or relationship names two items in the diagram. Operations that would leave one end pointing at a missing item are refused.

#### Scenario: an end names a deleted item

- **WHEN** an operation would point a connection at an item that no longer exists
- **THEN** the change is refused with the reason that the item no longer exists

### Operations on a missing item are refused [inferred]
<!-- touches: app/validation/check.ts -->

An operation that names an item the diagram no longer has is refused, and the diagram is left unchanged.

#### Scenario: an item was deleted in another step

- **WHEN** an operation names an item that has already been deleted
- **THEN** the change is refused and the reason says that the item no longer exists

### Boundaries and deployment nodes nest no deeper than the editor holds [inferred]
<!-- touches: app/model/limits.ts, app/validation/checkDiagram.ts -->

The editor holds a fixed depth of nested C4 boundaries and deployment nodes. A diagram nested deeper is refused.

#### Scenario: a file nests deeper than the limit

- **WHEN** a diagram file nests boundaries deeper than the editor holds
- **THEN** the file is refused and the problem says it nests items too deeply

## Uncovered

- Nothing in this area is left without an owner.
