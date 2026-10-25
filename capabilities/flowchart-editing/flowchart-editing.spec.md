# Flowchart editing — Living Spec

## Purpose

A flowchart is built by placing nodes and connecting them. Without these operations a person cannot draw one, and a move or a delete that silently breaks a connection leaves a diagram that no longer says what was meant.

## Requirements

### A node is added at the free spot nearest the request [inferred]
<!-- touches: app/model/flowchart/apply.ts, app/model/flowchart/freePosition.ts, app/rendering/flowchart/FlowchartCanvas.tsx -->

A new node takes a shape and a label named for that shape. It is placed at the free spot nearest the place requested, so it never lands on another node.

#### Scenario: the requested spot is taken

- **WHEN** the person adds a node where another node already sits
- **THEN** the new node is placed at the nearest free spot

### A node moves but never onto another node [inferred]
<!-- touches: app/model/flowchart/apply.ts, app/model/flowchart/freePosition.ts -->

A dragged node stops at the nearest free spot. Dropping it where it already is changes nothing.

#### Scenario: a node is dropped onto another

- **WHEN** the person drops a node on top of another node
- **THEN** the node settles at the nearest free spot

### A node's shape changes without moving it [inferred]
<!-- touches: app/model/flowchart/apply.ts -->

Changing a node's shape keeps its label, its place and its connections.

#### Scenario: the shape is changed

- **WHEN** the person changes a node from a rectangle to a diamond
- **THEN** the label, the position and every connection stay as they were

### A connection's line style and ending change without changing its ends [inferred]
<!-- touches: app/model/flowchart/apply.ts -->

Changing a connection's line style or ending keeps its label and both of its ends.

#### Scenario: a dotted line becomes a thick arrow

- **WHEN** the person changes a connection's style
- **THEN** the connection keeps its label and its two ends

### Parallel and opposite connections are kept as separate connections [inferred]
<!-- touches: app/model/flowchart/apply.ts -->

Two connections between the same pair of nodes, including one in each direction and one from a node to itself, are all allowed, and each stays distinct.

#### Scenario: a second connection between the same nodes

- **WHEN** the person adds a connection between two nodes that are already connected
- **THEN** both connections exist and can be edited separately

### Deleting a node removes its connections and its number is not reused [inferred]
<!-- touches: app/model/flowchart/apply.ts -->

Deleting a node deletes every connection that touches it. A later node never takes the number of a deleted one.

#### Scenario: a node is deleted, then another is added

- **WHEN** the person deletes node 3 and then adds a node
- **THEN** the new node is not numbered 3

### A connection can be moved to another node and reversed [inferred]
<!-- touches: app/model/flowchart/apply.ts, app/validation/flowchart.ts -->

One end of a connection can be moved to another node. A one-way connection can be reversed. A connection that starts and ends at the same node, or has no direction, cannot be reversed, and the reason is given.

#### Scenario: a one-way connection is reversed

- **WHEN** the person reverses a one-way connection
- **THEN** the arrow points the other way

#### Scenario: a self-connection is reversed

- **WHEN** the person reverses a connection that starts and ends at the same node
- **THEN** the change is refused and the reason is shown

### A node must keep a label [inferred]
<!-- touches: app/validation/flowchart.ts, app/model/flowchart/apply.ts -->
<!-- aligns: diagram-validation#A blank label is refused and the previous label is kept -->

A node's label is required. A connection's label may be empty.

#### Scenario: a node's label is cleared

- **WHEN** the person clears a node's label
- **THEN** the change is refused and the previous label is kept

## Uncovered

- Nothing in this area is left without an owner.
