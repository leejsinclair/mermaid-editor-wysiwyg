# Idea Intake: Visual drag-and-drop Mermaid flowchart editor

- **Slug**: mermaid-editor-wysiwyg
- **Created**: 2026-10-18
- **Source**: repo file `setup.md` (user-supplied via `@setup`)
- **Type**: new-capability

## Idea (as captured)

From `setup.md`:

> **User Story**: As a business analyst or developer creating a diagram, I want to create and edit Mermaid diagrams using a visual drag-and-drop editor, So that I can communicate business processes, system behaviour and relationships without needing to learn or manually write Mermaid syntax.
>
> **Business Value**: Enable business analysts and developers to create accurate, readable diagrams more easily, reduce syntax-related errors, and allow diagrams to be reused in documentation and development workflows that support Mermaid.

Stated scope (summarized from `setup.md`):

- **Included**: create a diagram by selecting a supported type; add, select, move, rename and delete elements; create and delete connections between compatible elements; edit connection labels and properties; diagram-type-specific rules; generate valid Mermaid source from the visual diagram; render with feedback on invalid operations; undo/redo; copy source to clipboard; keep visual diagram and source consistent.
- **Excluded**: direct editing of Mermaid source; importing or editing existing Mermaid source; SVG/PNG export; real-time collaboration; version history or persistence across sessions; diagram types other than those explicitly supported.
- **Business rules (12)**: the visual diagram is the source of truth and the source is read-only; users must not need to know Mermaid syntax; the initial type is the Mermaid flowchart; invalid operations must not corrupt the diagram; deleting a node must not silently create new relationships; cycles and disconnected nodes are permitted; every committed operation is undoable and redoable; the visual diagram, rendering and source stay consistent; source can be copied; feedback is understandable.
- **Acceptance criteria**: AC1–AC17, plus a Definition of Done and implementation guidance (separate model, generation, validation, rendering and history layers).
- **Project setup** (also in `setup.md`): Spec Kit with the grill-specify, TDD-integrated, spec viewer/kanban and micro-kanban extensions, and a crew of technical lead, developer, QA and business analyst.

## Restated

Build a browser-based visual editor in which users compose Mermaid flowcharts by dragging and connecting nodes. The editor generates read-only Mermaid source, kept consistent with the visual model, that users can copy into other tools. The first release covers flowcharts only, with undo/redo and validation.

## Origin & Context

- **Raised by**: [NEEDS CLARIFICATION: who authored `setup.md`; the repo's git user is Lee Sinclair, but authorship of the requirement is not stated]
- **Trigger**: [NEEDS CLARIFICATION: no triggering event is recorded (complaint, stakeholder ask, strategy shift)]

## First-Glance Unknowns

- [NEEDS CLARIFICATION: Which flowchart node shapes, connection types (arrow, open link, dotted, thick) and connection properties count as "supported"? AC2, AC6 and AC7 leave the set undefined.]
- [NEEDS CLARIFICATION: Are flowchart subgraphs, styling/classes, click events and direction (TD/LR) in or out of scope?]
- [NEEDS CLARIFICATION: What is the "supported empty-flowchart representation" (AC16)?]
- [NEEDS CLARIFICATION: Which browsers and clipboard APIs does "supported browsers" (Definition of Done) include?]
- [NEEDS CLARIFICATION: How should "valid Mermaid" be checked: against the official Mermaid parser, a custom grammar, or both?]
- [NEEDS CLARIFICATION: Do users need keyboard shortcuts, accessibility conformance (e.g. WCAG level), or mobile and touch support?]
- [NEEDS CLARIFICATION: Do users accept losing work on reload, given there is no persistence and no import? Any unsaved-changes warning?]
- [NEEDS CLARIFICATION: Is the target audience (business analysts and developers) validated, and are there existing tools they use today (e.g. Mermaid Live Editor, draw.io)?]
- [NEEDS CLARIFICATION: Success measures and timeline for the initial release.]
