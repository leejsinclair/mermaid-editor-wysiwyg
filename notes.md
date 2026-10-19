# Pre-answered notes for the specification

Input to `/speckit-specify`, alongside `setup.md`, which outranks this file. Where the two disagree,
`setup.md` wins and the disagreement is raised, not resolved by assumption.

Status markers: **Decided** (the Business Analyst has answered), **Proposed** (the planner's draft from
Mermaid's grammar; please confirm or correct), **Open** (needs an answer).

The earlier flowchart-only attempt is kept in `specs/_archive/001-flowchart-visual-editor-v0` for reference.

> **Status (2026-10-18):** this file was the input to `specs/002-visual-diagram-editor/spec.md` and is
> no longer the current record. Every **Open** and **Proposed** item below has been answered in that
> spec's Clarifications. Items marked **Superseded** were changed by the Business Analyst afterwards
> (setup.md Scope and constitution 1.2.0). Where this file and the spec differ, the spec wins.

## 1. Scope

- **Decided**: one combined specification covering Flowchart, Sequence diagram and C4 diagram, all in the first release.
- **Decided**: the diagram type is chosen at creation and never changes. The toolbox shows only that type's elements.
- **Decided**: Sequence is core only. C4 covers all five kinds: Context, Container, Component, Dynamic, Deployment.
- **Decided**: out of scope as before: source editing or import, SVG or PNG export, collaboration, version history.
  **Superseded**: persistence is now in scope: autosave in the user's browser and saving to or opening
  the editor's own files (spec FR-042 to FR-052). Server or cloud storage and sync stay out.
- **Open**: is the C4 kind chosen at creation as part of the type (six start-screen choices) or as a second step (C4, then kind)? Proposed: a second step.
- **Open**: Mermaid marks C4 support experimental. Is it acceptable that generated C4 may render with Mermaid's known layout and styling limits? Proposed: yes, and the editor says so on the C4 start screen.

## 2. Shared decisions (all types)

- **Decided**: runs entirely in the browser; static files only; no network requests after load; not required to open from disk.
- **Decided**: browsers are current stable Chromium-based browsers and Firefox on desktop. Safari and mobile are not supported.
- **Decided**: the editing canvas is the rendered diagram, with an expandable read-only source panel (no separate Mermaid preview).
  **Superseded** for Flowchart: the canvas keeps the user's own positions (editor-only), with a note by
  Copy Source and a read-only "Preview as Mermaid draws it" view (spec FR-003, FR-053).
- **Decided**: keyboard: select, rename, delete, undo, redo and Copy Source must work from the keyboard. Adding, moving and connecting may need a pointer.
  **Superseded**: every operation must work from the keyboard and without dragging, to meet WCAG 2.2 AA
  in full (spec FR-019, FR-020).
- **Decided**: an element's kind is fixed at creation (a flowchart node's shape, a connection's type and endpoints). Only labels are editable after creation. To change anything else the user deletes and recreates.
  **Superseded**: types can change within a family (spec FR-040), connection ends can be moved and
  reversed (FR-041), and C4 boundary membership can change (FR-034).
- **Decided**: a drag that ends outside the canvas is cancelled. A drop or move onto an occupied position goes to the nearest free position (already reflected in AC3 and AC4).
- **Decided**: labels: required elements have a non-empty label with at least one visible character (spaces and line breaks alone count as empty); multi-line is allowed; no length limit. Relationship labels may be empty unless a type says otherwise.
- **Decided**: the UI uses a full component library (MUI). The canvas uses React Flow. Neither may load anything from a network at run time.
- **Decided**: one gesture is one undo step: a completed drag, a confirmed label edit.
- **Open**: do sequence and C4 diagrams use free canvas positions at all? Mermaid lays both out from statement order, not from coordinates (see sections 4 and 5), so positions would be editor-only and not reflected in the generated diagram.

## 2a. Additional shared decisions

All **Decided** (the Business Analyst accepted the planner's recommendations).

- **Mermaid baseline**: generated source targets Mermaid 12.x, the version the project installs and validates against. The C4 start screen carries a short note that C4 support is experimental and that external tools may render it differently or not at all.
- **Zoom, pan and fit-to-view**: in the first release, for every diagram type, on the canvas.
- **Leaving with unsaved work**: closing, reloading or navigating away from a non-empty diagram asks the user to confirm first. An empty diagram does not ask.
- **Starting a new diagram mid-session**: the user can return to the start screen. A non-empty diagram is discarded after the user confirms. This is not undoable.
  **Superseded**: returning to the start screen keeps the diagram saved; leaving asks only when the latest
  change is not saved (spec FR-018).
- **Accessibility target**: WCAG 2.2 level AA for colour contrast, focus visibility, accessible names and screen-reader announcements of feedback, in addition to the keyboard scope above.
- **Out of the first release**: multi-select and multi-delete, copy and paste of elements, grid snapping, auto-arrange.
- **Appearance**: a single light theme.
- **Language**: English only; text is kept in one place so translation is possible later.
- **Undo history**: unlimited for the session. (Clarified: unlimited while a diagram is open; not kept after
  it is closed, spec FR-008.)
- **Default labels and empty canvas**: a new element's default label is its type name (for example "Rectangle", "Person"). An empty canvas shows a short hint telling the user to drag an element from the toolbox.

## 3. Flowchart

All **Decided**.

- Shapes (nine): rectangle, rounded rectangle, stadium, diamond, circle, parallelogram, cylinder, subroutine, hexagon.
- Connections (nine): solid, dotted, thick, each as arrow, plain line or two-way arrow.
- Direction fixed top-to-bottom; no control.
- Self-loops, duplicate and opposite connections are valid; each connection is distinct.
- Node labels non-empty; connection labels may be empty.
- Empty diagram source is the bare flowchart header, and it can be copied.

## 4. Sequence diagram (core)

- **Decided**: core only: participants and actors, ordered messages, message text, self-messages. No notes, activations, loops, alternatives, grouping or autonumbering.
- **Proposed** elements: Participant (a box lifeline) and Actor (a stick figure lifeline), each with an id and a display label.
- **Proposed** message types (Mermaid operators): solid line with filled arrow, dashed line with filled arrow (typically a reply), solid line with open arrow, dashed line with open arrow, solid line with a cross (lost message), dashed line with a cross, solid line with async open arrow, dashed line with async open arrow.
- **Proposed** rules:
  - A message joins two participants or actors (the same one for a self-message) and has text.
  - Messages are ordered top to bottom; the order is part of the model and the source. The user can reorder.
  - Participants appear left to right in declaration order; the user can reorder.
  - Deleting a participant deletes its messages and creates nothing.
  - Duplicate participants with the same label are distinct (distinct ids).
- **Proposed** generated source: header `sequenceDiagram`, then participant and actor declarations in order, then messages in order.
- **Open**: may a message have empty text? Proposed: no, a message needs text.
- **Open**: may a message be created before any second participant exists (self-message on one)? Proposed: yes.
- **Open**: how does the user insert a message at a given position, and how are participants reordered (drag, or move up and down controls)?

## 5. C4 diagram (all five kinds)

Mermaid's C4 syntax, as the planner understands it. **Proposed**: please confirm the element list per kind.

Common to all kinds:

- A title (optional) and an optional set of boundaries that group elements.
- Elements have an alias (id), a label and an optional description. Many also take a technology or type.
- Relationships have a source, a target, a label and an optional technology. Relationships can be one-way or two-way.
- Mermaid lays C4 out by statement order and a layout setting, not by coordinates. Positions the user sets would not be encoded.

| Kind | Mermaid header | Proposed elements | Proposed boundaries |
|------|----------------|-------------------|---------------------|
| Context | `C4Context` | Person, external Person, System, external System, System database, System queue (each with an external variant) | Enterprise boundary, System boundary, generic boundary |
| Container | `C4Container` | Person, System, plus Container, Container database, Container queue (each with an external variant) | System boundary, Container boundary, generic boundary |
| Component | `C4Component` | Person, System, Container, plus Component, Component database, Component queue (each with an external variant) | Container boundary, generic boundary |
| Dynamic | `C4Dynamic` | As Component, with numbered relationships | Container boundary, generic boundary |
| Deployment | `C4Deployment` | Deployment node (and nested nodes), plus Container; nodes can nest | Nesting of nodes replaces boundaries |

- **Proposed** rules:
  - A relationship joins two elements that exist and has a label; technology is optional.
  - Dynamic relationships are numbered in order; the number is part of the model, and the user can reorder.
  - Deleting an element deletes its relationships and boundary membership and creates nothing.
  - An element belongs to at most one boundary; boundaries may nest only where Mermaid allows it.
- **Open**: does each kind offer only its own element set (so Context never shows Containers)? Proposed: yes.
- **Open**: are descriptions and technology fields editable properties? Proposed: yes, alongside the label, each optional.
- **Open**: is the element type (for example Person versus external Person) fixed at creation like a flowchart shape? Proposed: yes (consistent with the shared rule).
  **Superseded**: it can change within its family, for example Person ↔ external Person (spec FR-040).
- **Open**: are the Mermaid style and layout update statements (element colours, layout configuration) supported? Proposed: no, out of scope for the first release.
- **Open**: Mermaid's own C4 limitations (shape count per row, text overflow) are not corrected by the editor. Is that acceptable?

## 6. Acceptance criteria wording

`setup.md` AC2 to AC17 are worded for flowcharts. Proposed reading, stated in `setup.md`'s Implementation Guidance: they apply to each type with that type's own elements and connections. The specification restates them per type.

## 7. Items for the Business Analyst to confirm or answer

1. All **Open** items above (section 2a is already decided).
2. The **Proposed** element and message lists for Sequence and C4.
3. Whether any fixed C4 or Sequence restriction should be added to the constitution beyond what section 1 states.
