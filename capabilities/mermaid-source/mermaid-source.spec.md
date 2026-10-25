# Mermaid source — Living Spec

## Purpose

The Mermaid source is the output a person takes away. It must follow the diagram exactly, and a copy that Mermaid would reject must never reach the clipboard looking successful.

## Requirements

### The source is generated from the diagram and never edited back [inferred]
<!-- touches: app/generation/**, app/rendering/shared/SourcePanel.tsx -->

The Mermaid source is read-only. It is made from the diagram, and changes to the source are not read back into the diagram. Node positions are not written to it.

#### Scenario: a node is moved

- **WHEN** the person moves a node on the canvas
- **THEN** the source is unchanged, because positions are kept in the editor only

### The same diagram always gives the same source [inferred]
<!-- touches: app/generation/generate.ts, app/generation/flowchart.ts, app/generation/sequence.ts, app/generation/c4.ts -->

Generating the source twice from the same diagram gives the same text.

#### Scenario: the source is generated twice

- **WHEN** the same diagram is generated twice
- **THEN** both results are identical

### Copy Source copies only a source Mermaid accepts [inferred]
<!-- touches: app/editor/clipboard.ts, app/editor/sourceCheck.ts, app/editor/useSourceCheck.ts -->

Before copying, the source is checked. A source Mermaid rejects is not copied, and the reason is shown. A source still being checked is not copied, and the person is asked to try again. A source Mermaid accepts only with a notice is copied, and the notice is repeated in the message.

#### Scenario: the source is still being checked

- **WHEN** the person chooses Copy Source before the check has finished
- **THEN** nothing is copied and the message asks them to try again in a moment

#### Scenario: the source has a notice

- **WHEN** Mermaid accepts the source only with a notice
- **THEN** the source is copied and the message says what the notice is

### Copy for Markdown wraps the source in a Mermaid code fence [inferred]
<!-- touches: app/editor/clipboard.ts -->

Copy for Markdown copies the source inside a `mermaid` code fence, ready to paste into a Markdown file.

#### Scenario: the source is copied for Markdown

- **WHEN** the person chooses Copy for Markdown
- **THEN** the clipboard holds the source between a `mermaid` fence line and a closing fence line

### A copy is reported only after the clipboard accepts it [inferred]
<!-- touches: app/editor/clipboard.ts -->

The success message appears only when the clipboard write has completed. Where the browser does not allow copying, the message says so and points to the Mermaid source panel.

#### Scenario: the browser blocks clipboard writes

- **WHEN** the browser does not allow the copy
- **THEN** the message says copying is not allowed here and names the Mermaid source panel as the way to copy the text

### A C4 diagram with nothing to draw is flagged [inferred]
<!-- touches: app/generation/generate.ts -->

Mermaid cannot draw an empty C4 diagram, and cannot draw a boundary with nothing in it. The editor says so, and says what to add.

#### Scenario: an empty boundary

- **WHEN** a boundary holds no element
- **THEN** the message names the boundary and asks for an element in it or its deletion

### The preview shows the diagram as Mermaid draws it [inferred]
<!-- touches: app/rendering/flowchart/Preview.tsx -->

The preview shows the picture Mermaid draws from the source. If Mermaid cannot draw it, the preview says why.

#### Scenario: Mermaid cannot draw the source

- **WHEN** Mermaid rejects the source while drawing the preview
- **THEN** the preview says that Mermaid could not draw the diagram, with the reason

## Uncovered

- Nothing in this area is left without an owner.
