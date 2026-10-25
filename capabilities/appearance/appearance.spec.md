# Appearance — Living Spec

## Purpose

The appearance changes only how the editor looks. Without the rule that it is never saved with a diagram, a file could carry one person's colours to another, and without a fallback a refused preference could break the page.

## Requirements

### The editor offers Blueprint Studio and Light [inferred]
<!-- touches: app/rendering/theme/**, app/editor/AppearanceProvider.tsx -->

The header offers two appearances, Blueprint Studio and Light. Blueprint Studio is the default.

#### Scenario: the editor is opened for the first time

- **WHEN** a person opens the editor with no appearance chosen before
- **THEN** the editor is shown in Blueprint Studio

### The chosen appearance is kept for the next visit [inferred]
<!-- touches: app/persistence/appearance.ts, app/rendering/theme/AppearanceSwitch.tsx -->

The choice is remembered in this browser, and the next visit opens with it.

#### Scenario: Light is chosen and the page reopened

- **WHEN** the person chooses Light and opens the editor again in the same browser
- **THEN** the editor opens in Light

### The appearance is never part of a diagram or its output [inferred]
<!-- touches: app/persistence/appearance.ts, app/generation/generate.ts -->

A saved file, a stored diagram and the copied Mermaid source do not hold the appearance. Opening a diagram never changes the appearance.

#### Scenario: a diagram is saved in Light

- **WHEN** the person saves a file while the editor is in Light
- **THEN** the file holds no appearance, and opening it elsewhere keeps that browser's own choice

### A choice the browser cannot keep still applies, and the person is told [inferred]
<!-- touches: app/persistence/appearance.ts, app/rendering/theme/appearanceContext.ts -->

If the browser refuses to store the choice, the appearance still changes for the current visit, and the person is told it could not be kept for next time.

#### Scenario: storage refuses the choice

- **WHEN** the person chooses Light and the browser refuses to store it
- **THEN** the editor shows Light, and a message says the choice could not be saved for next time

### An unrecognised stored value is read as Blueprint Studio [inferred]
<!-- touches: app/persistence/appearance.ts -->

Anything stored other than the Light choice is read as Blueprint Studio.

#### Scenario: the stored value is garbage

- **WHEN** the stored appearance is a value this editor does not know
- **THEN** the editor opens in Blueprint Studio

### Mermaid's own pictures follow the chosen appearance [inferred]
<!-- touches: app/rendering/shared/mermaidRuntime.ts, app/rendering/shared/MermaidPicture.tsx -->

The preview and import pictures drawn by Mermaid take the colours of the chosen appearance.

#### Scenario: the preview is drawn in Light

- **WHEN** the editor is in Light and the preview is drawn
- **THEN** the picture uses Light colours

## Uncovered

- Nothing in this area is left without an owner.
