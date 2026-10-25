# Drafting Grid — Living Spec

> [DRAFT] Adopted from the code's surface and the project's conventions. Review before trusting.

## Purpose

The grid is how an author judges position and spacing on the canvas. Without it, moving an item gives no reference for where it lands, and the canvas reads as an empty field.

## Requirements

### Every editing canvas shows a drafting grid
<!-- touches: app/rendering/shared/gridStyle.ts, app/rendering/flowchart/DraftingGrid.tsx -->
<!-- adopted: specs/007-blueprint-redesign/spec.md FR-011 -->

An editing canvas shows a grid behind the drawing: a minor line every 16 px and a major line every 80 px at default zoom.

#### Scenario: a diagram opens at default zoom

- **WHEN** a diagram of any type opens at default zoom
- **THEN** a minor line is drawn every 16 px and a major line every 80 px, faint enough that items, labels and lines stand out above them

### The grid moves and scales with the drawing
<!-- touches: app/rendering/shared/grid.ts, app/rendering/shared/gridStyle.ts, app/rendering/flowchart/DraftingGrid.tsx -->
<!-- adopted: specs/007-blueprint-redesign/spec.md FR-013 -->

The grid stays aligned with the drawing while the canvas is panned, scrolled or zoomed.

#### Scenario: the author zooms in on an item

- **WHEN** the author zooms or pans the drawing
- **THEN** the grid moves and scales with it, so an item keeps the same position relative to the grid lines

### The minor grid drops out when zoomed too far out
<!-- touches: app/rendering/shared/grid.ts -->
<!-- adopted: specs/007-blueprint-redesign/spec.md EC-04 -->

When minor lines would be less than 6 px apart, the minor grid is not drawn and the major grid stays, so the canvas never becomes a dense texture.

#### Scenario: the canvas is at its smallest zoom

- **WHEN** the zoom is so small that minor lines would be under 6 px apart
- **THEN** only the major grid is drawn

### The grid never takes a press
<!-- touches: app/rendering/shared/gridStyle.ts, app/rendering/flowchart/DraftingGrid.tsx -->
<!-- adopted: specs/007-blueprint-redesign/spec.md User Story 2, scenario 3 -->

The grid receives no press, drag, hover or double-click. Every gesture on the canvas behaves as it would without the grid.

#### Scenario: the author presses on empty canvas over the grid

- **WHEN** the author presses, drags or double-clicks on empty canvas where a grid line is drawn
- **THEN** the gesture acts on the canvas exactly as it would with no grid

### The grid is drawn in both appearances
<!-- touches: app/rendering/shared/gridStyle.ts, app/rendering/flowchart/DraftingGrid.tsx -->
<!-- adopted: specs/007-blueprint-redesign/spec.md, clarification "Should the Light appearance have a grid?" -->

The grid is drawn in Blueprint Studio and in Light, each in its own faint colour, at the same 16 px and 80 px spacing.

#### Scenario: the author switches appearance

- **WHEN** the author switches between Blueprint Studio and Light
- **THEN** the grid stays visible, in the colour of the appearance now shown

## Uncovered

- The colour values behind `--grid-minor` and `--grid-major` belong to the appearance tokens in `app/rendering/theme/**`, which the `appearance` capability owns. This spec states only that each appearance has a faint grid.
- The Sequence and C4 canvases apply the grid as a background (`app/rendering/sequence/SequenceCanvas.tsx`, `app/rendering/c4/C4Canvas.tsx`) through `gridStyle.ts`. Their own specs, `sequence-editing` and `c4-editing`, do not yet describe the grid.
