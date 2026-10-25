# Sequence editing — Living Spec

> [DRAFT] Adopted from the code's surface and the project's conventions. Review before trusting.

## Purpose

A sequence diagram is a set of participants and the messages between them, in order. Without these operations a person cannot draw an interaction, and a removed participant must not leave messages pointing at nothing.

## Requirements

### A participant or actor is added [inferred]
<!-- touches: app/model/sequence/apply.ts, app/rendering/sequence/SequenceCanvas.tsx -->
<!-- adopted: app/model/sequence/apply.ts -->

A participant takes the name of its role, participant or actor, and is placed at the position asked for, or at the right-hand end.

#### Scenario: an actor is added at the end

- **WHEN** the person adds an actor without choosing a position
- **THEN** the actor is placed at the right-hand end of the diagram

### A message is added between two participants [inferred]
<!-- touches: app/model/sequence/apply.ts, app/rendering/sequence/messageDrawing.tsx -->
<!-- adopted: app/model/sequence/apply.ts -->

A message joins a sender and a receiver, which may be the same participant. It goes at the position asked for, or after the last message.

#### Scenario: a participant sends a message to itself

- **WHEN** the person makes a message whose sender and receiver are the same participant
- **THEN** the message is added and drawn from that participant back to itself

### Participants move sideways and messages move up or down [inferred]
<!-- touches: app/model/sequence/apply.ts, app/rendering/sequence/gestures.ts -->
<!-- adopted: app/model/sequence/apply.ts -->

Dragging a participant changes its place from left to right. Dragging a message changes its place from top to bottom. A move to the place it already has changes nothing.

#### Scenario: a message is moved up

- **WHEN** the person moves a message above the message before it
- **THEN** the message is shown earlier in the sequence

### Deleting a participant deletes its messages [inferred]
<!-- touches: app/model/sequence/apply.ts -->
<!-- adopted: app/model/sequence/apply.ts -->

Deleting a participant also deletes every message it sends or receives, including messages to itself. Deleting a single message leaves the participants alone.

#### Scenario: a participant with messages is deleted

- **WHEN** the person deletes a participant that sent two messages
- **THEN** those two messages are gone and the other participants and messages remain

### A participant's role changes without losing its messages [inferred]
<!-- touches: app/model/sequence/apply.ts -->
<!-- adopted: app/model/sequence/apply.ts -->

Changing a participant between participant and actor keeps its label, its place and its messages.

#### Scenario: a participant becomes an actor

- **WHEN** the person changes a participant to an actor
- **THEN** the label, the place and every message remain

### A message's type and ends change without losing its text [inferred]
<!-- touches: app/model/sequence/apply.ts -->
<!-- adopted: app/model/sequence/apply.ts -->

Changing a message's style keeps its text, its ends and its place. Moving one end to another participant, or swapping sender and receiver, keeps its text.

#### Scenario: a message is swapped

- **WHEN** the person swaps the sender and receiver of a message
- **THEN** the message keeps its text and its place, and points the other way

## Uncovered

- Nothing in this area is left without an owner.
