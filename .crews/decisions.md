# Architectural Decisions

Accumulated decisions from previous crews runs. The `architect` agent appends new decisions here automatically when it emits a `## New Decisions` section.

Format for each entry:

```
## Decision Title

**Decision:** What was decided.
**Rationale:** Why this approach was chosen over alternatives.
**Implementation:** Where/how it's applied in the codebase.
```

---

<!-- Decisions will be appended here automatically during crews runs -->

## Pre-implementation review 002: open questions settled

**Decision:** (OQ-4) Copy Source and Copy for Markdown are refused with an explanation when the source is `invalid` or generation throws; notice-only sources (empty C4) are copied. (C4 table) The spec table is literal: Container kind has plain `system` only, Component and Dynamic have plain `system` and `container` only. (OQ-2) Overlap uses nominal per-shape footprints. (EC-04) Zero-width and other invisible format characters are not visible. (OQ-1) setup.md is not amended; the Clarification suffices. (OQ-3) Non-empty node labels, message text, C4 relationship labels and diagram names are Rule 8 editor rules. (OQ-6) Default names stay as in data-model.md. (OQ-5) SC-009 is already covered by VO-071 (axe) and MV-004 (manual Orca).
**Rationale:** Source-of-truth order puts the spec above the plan; AC15 requires valid copied source; nominal footprints keep the model pure and deterministic.
**Implementation:** contracts/mermaid-output.md, data-model.md, tasks.md T036. Pending Business Analyst confirmation.
