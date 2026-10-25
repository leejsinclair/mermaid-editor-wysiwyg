# C4 editing — Living Spec

## Purpose

A C4 diagram is a nested model: elements, boundaries and deployment nodes, joined by relationships. Without these operations a person cannot describe a system's structure, and a deleted boundary must not take its contents with it.

## Requirements

### An element is added inside a boundary or at the top level [inferred]
<!-- touches: app/model/c4/apply.ts, app/rendering/c4/C4Canvas.tsx, app/rendering/c4/toolboxGroups.tsx, app/rendering/layout/c4Layout.ts, app/model/c4/**, app/model/c4/catalogue.ts -->

An element takes the name of its type. It goes into the boundary the person chooses, or to the top level.

#### Scenario: an element is added to a system boundary

- **WHEN** the person adds a container to a system boundary
- **THEN** the container is inside that boundary

### Boundaries and deployment nodes are added and keep their type [inferred]
<!-- touches: app/model/c4/apply.ts, app/validation/c4.ts -->

A boundary or deployment node starts empty. Its type cannot be changed afterwards, and the change is refused with the reason.

#### Scenario: a boundary's type is changed

- **WHEN** the person tries to change a system boundary to another boundary type
- **THEN** the change is refused and the boundary keeps its type

### A relationship is labelled "Uses" until it is renamed [inferred]
<!-- touches: app/model/c4/apply.ts, app/model/c4/tree.ts -->

A new relationship has the label "Uses" and no technology. In a dynamic diagram the relationship numbers follow their order and are not stored.

#### Scenario: a relationship is moved in a dynamic diagram

- **WHEN** the person moves a relationship to a later place
- **THEN** the relationship numbers are renumbered in the new order

### Deleting a boundary lifts its contents up one level [inferred]
<!-- touches: app/model/c4/apply.ts, app/rendering/shared/LockDialogs.tsx -->

Deleting a boundary or deployment node gives its contents to its parent, at the boundary's own place. Relationships that belonged to the deleted items are removed. Nothing is added.

#### Scenario: a system boundary holding two containers is deleted

- **WHEN** the person deletes the boundary
- **THEN** the two containers move up one level, and the boundary is gone

### An item moves into a boundary, but never into itself [inferred]
<!-- touches: app/model/c4/apply.ts, app/validation/c4.ts -->

Moving an element, boundary or deployment node moves everything it holds with it. A boundary cannot be placed inside itself or inside one of its own boundaries.

#### Scenario: a boundary is moved into its own child

- **WHEN** the person moves a boundary into one of its own boundaries
- **THEN** the move is refused and the reason is shown

### Relationships start and end only at elements [inferred]
<!-- touches: app/validation/c4.ts, app/model/c4/apply.ts -->

A relationship starts and ends at elements. In a deployment diagram it may also start or end at a deployment node.

#### Scenario: a relationship is aimed at a boundary

- **WHEN** the person tries to end a relationship on a boundary
- **THEN** the change is refused and the reason names the allowed ends

## Uncovered

- Nothing in this area is left without an owner.
