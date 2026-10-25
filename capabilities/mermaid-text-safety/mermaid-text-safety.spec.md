# Mermaid text safety — Living Spec

> [DRAFT] Adopted from the code's surface and the project's conventions. Review before trusting.

## Purpose

Mermaid text comes from people and files the editor does not control. If it ran, linked out, or let a label change the diagram's structure, opening a shared file could act on the reader's behalf. This capability holds across import, generation and drawing.

## Requirements

### Mermaid text is never run, fetched or followed [inferred]
<!-- touches: app/importing/scan.ts, app/importing/decode.ts, app/rendering/shared/mermaidRuntime.ts -->
<!-- adopted: README.md:43 -->

Imported Mermaid text is read as data. Nothing in it is executed, and no link, click handler or address in it is followed or fetched.

#### Scenario: imported text contains a click handler

- **WHEN** the imported text contains a click or link statement
- **THEN** the statement is reported as not kept, and nothing is followed or fetched

### A label is drawn as the text the person typed [inferred]
<!-- touches: app/generation/escape.ts, app/generation/flowchart.ts -->
<!-- adopted: app/generation/escape.ts -->

Characters in a label that Mermaid reads as syntax, such as brackets, quotes, semicolons and line breaks, are escaped in the generated source. The picture then shows the label exactly as typed.

#### Scenario: a label contains brackets and a semicolon

- **WHEN** the person types a label containing `]` and `;`
- **THEN** the generated source keeps the label as text, and the picture shows the same characters

### Mermaid draws with the strict security setting whatever the text says [inferred]
<!-- touches: app/rendering/shared/mermaidRuntime.ts, app/rendering/shared/MermaidPicture.tsx -->
<!-- adopted: app/rendering/shared/mermaidRuntime.ts -->

Mermaid runs with its strict security level. A diagram's own text cannot change that level. A diagram's own colour statements still apply to its own items.

#### Scenario: the diagram text asks for a looser setting

- **WHEN** the imported text sets a configuration that would loosen security
- **THEN** the drawing keeps the strict level, and the setting is reported as not kept

## Uncovered

- Nothing in this area is left without an owner.
