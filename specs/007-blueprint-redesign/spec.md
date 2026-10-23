# Feature Specification: Blueprint Studio Visual Redesign

**Feature Branch**: `007-blueprint-redesign`

**Created**: 2026-10-22

**Status**: Draft

**Grilled on**: 2026-10-22

**Input**: User description: "blueprint-redesign Visual Redesign: Mermaid Editor — Blueprint Studio. Redesign the existing Mermaid WYSIWYG editor as Blueprint Studio, a polished diagramming application inspired by vintage engineering blueprints: deep navy surfaces, subtle cyan drafting grids, ivory lines and labels, restrained amber annotations, modern professional controls. A visual redesign, not a rewrite: preserve rendering, synchronisation, editing, undo/redo, files, persistence, shortcuts and accessibility." (full brief recorded in the feature conversation of 2026-10-22)

## Context

The editor today uses a single light appearance with default control styling. This feature gives it a consistent
visual identity through a new default appearance, *Blueprint Studio*, without changing what the editor does or what it
is called: the application keeps its name, "Mermaid diagram editor". Every behaviour defined by features 002 to 006
stays as it is; only appearance, arrangement on screen and the small amount of status information already known to
the editor change.

Constraints carried from the constitution and earlier features that shape this redesign:

- The Mermaid source stays generated and **read-only** (constitution principle I). The "source editor" of the brief is
  therefore a read-only source view with highlighting and validation feedback; it never accepts typed changes, and
  "source-to-canvas synchronisation" means the view always shows the source generated from the current diagram.
- The editor makes no network request after load (002 FR-021), so no web font or remote asset may be fetched.
- SVG and PNG export are excluded (setup.md). "Exported output" in this feature means the copied Mermaid source, the
  copied Markdown and saved diagram files.
- 002 FR-021's exclusion of mobile browsers is superseded by this feature: the editor adds mobile browser support
  (FR-027). Its other parts (static files, no network request after load) stand.
- 002 FR-022's "one light theme" is superseded by this feature: the editor has two appearances, Blueprint Studio (the
  default) and Light, chosen with a switch in the header. Its other parts (English text, all user-facing text kept in
  one place) stand.

## Clarifications

### Session 2026-10-22

- Q: Should users still be able to switch back to a light appearance? → A: Blueprint Studio by default, plus a
  light/blueprint switch in the header.
- Q: How should Mermaid's own drawings (preview, import pictures) look? → A: Follow the current appearance: blueprint
  colours in Blueprint Studio, Mermaid's default look in Light.
- Q: How narrow must the redesign go? → A: Down to 360 px, and add mobile browser support.
- Q: Which mobile browsers must the editor support? → A: Chrome on Android and Safari on iOS.
- Q: Which touch gestures must the canvases support? → A: One-finger drag on empty canvas pans, two-finger pinch
  zooms, double-tap renames.
- Q: Which appearance should the editor open in on a later visit? → A: Remember the last choice in this browser.
- Q: Should the Light appearance have a grid? → A: Yes, the same 16/80 px grid in a faint light-palette colour.
- Q: Should the application itself be called "Blueprint Studio", with appearances "Blueprint" and "Light"? → A: No: the
  application keeps its current name, "Mermaid diagram editor"; the appearances are "Blueprint Studio" (default) and
  "Light".
- Q: How must mobile browser support be verified before release? → A: Automated runs in emulated mobile browsers only
  (Android Chrome and iOS Safari profiles); no real-device check is required.
- Q: How is US4-AS3 (custom styles winning over the blueprint look) verified, given that import drops style statements? → A: At the drawing function: a source with style statements is drawn and the styles win over the blueprint theme. No editor screen draws such source today (feature 005 drops them and draws the generated source); that behaviour is unchanged (decided by Lee Sinclair, 2026-10-23).
- Q: Which end-to-end tests run in the emulated mobile browsers? → A: The existing suite stays desktop-only; a new
  dedicated touch suite, run on both mobile profiles, performs every editing, file and copy operation by touch.
- Q: What happens when the chosen appearance cannot be saved for the next visit? → A: The switch still takes effect for
  the session, and the editor shows a notice that the choice could not be saved for next time.
- Q: What happens when a second finger touches down while an item is being dragged on a sequence or C4 canvas? → A: It
  is ignored until the drag ends: the drag continues and no zoom starts.
- Q: What timing allowance applies in Firefox to scrolling a sequence or C4 diagram, where the canvas now scrolls inside itself, and to
  actions that take under 100 ms? → A: One extra frame (1000/60 ms) over the 10 % limit, in Firefox only, for scrolling a
  sequence or C4 diagram and for any action whose baseline median is under 100 ms (SC-007, VO-045), where a median is a few
  frames and varies by a frame between runs. The canvas scrolling inside itself instead of widening the page is kept. Chromium
  keeps the plain 10 % limit. Approved by Lee Sinclair.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Work on a diagram in a cohesive blueprint workspace (Priority: P1)

A diagram author opens or creates a diagram and sees one consistent workspace: a compact header naming the
application and the diagram with the document actions and undo/redo, a spacious canvas on a deep-navy drafting
surface, a tools area with the item types and properties for the selected item, a read-only source view, and a short
status line. All controls share one colour scheme, type scale and spacing, and every existing action is where the
author can find it.

**Why this priority**: The visual identity and workspace arrangement are the feature. Without this story nothing has
changed for the user.

**Independent Test**: Open each start page and an editor for each supported diagram type (flowchart, sequence, C4)
and confirm that every surface uses the Blueprint Studio palette, every action available before the redesign is still
present and works, and no control appears that does nothing.

**Acceptance Scenarios**:

1. **Given** the start page in the Blueprint Studio appearance, **When** it loads, **Then** it shows the application
   name "Mermaid diagram editor" and uses only the Blueprint Studio palette and type faces.
2. **Given** an open diagram, **When** the editor loads, **Then** the header shows the application name, the
   diagram's name, the document actions (copy source, copy Markdown, save file and any others offered today) and
   undo/redo, and the canvas takes most of the window.
3. **Given** an open diagram, **When** the author compares the controls offered with those offered before the
   redesign, **Then** every earlier control is still offered, with the same name and effect, and no new control is
   offered that has no working effect.
4. **Given** the editor in either appearance, **When** the author uses the appearance switch in the header, **Then**
   every surface changes to the other appearance at once, and the diagram, selection, any draft label, undo history
   and generated source are unchanged.
5. **Given** any control, **When** it is hovered, focused, pressed, disabled, or reports success or an error, **Then**
   each state is visibly distinct, amber is used only for emphasis and warnings, and red only for actual errors.

---

### User Story 2 - Edit on a blueprint drafting canvas (Priority: P1)

The author edits on a solid deep-navy canvas with a faint fine grid and a slightly stronger major grid. Diagram items
are drawn with deep-blue fills, ivory labels and cyan outlines; lines are clearly visible; the selected item has a
distinct cyan highlight. Selection outlines, hover outlines, connection handles, end handles, drop-target rings and the
line being drawn all share the drafting style. The grid stays aligned with the drawing while the author pans and zooms,
and never gets in the way of a press, drag or keyboard action.

**Why this priority**: The canvas is where all editing happens; it must look distinctive while remaining at least as
easy to work with as before.

**Independent Test**: In each diagram type, add items, connect them, select, move, rename and delete them at minimum,
default and maximum zoom, and confirm every gesture still lands where it did before, the grid moves with the drawing,
and every item, label and line remains readable.

**Acceptance Scenarios**:

1. **Given** a canvas at default zoom, **When** it is shown, **Then** a minor grid is drawn every 16 px and a major
   grid every 80 px (5 minor cells), both faint enough that items, labels and lines stand out clearly above them.
2. **Given** a canvas that pans or zooms, **When** the author pans or zooms, **Then** the grid moves and scales with
   the drawing so that an item keeps the same position relative to the grid lines.
3. **Given** any canvas, **When** the author presses, drags, hovers or double-activates anywhere, **Then** the grid and
   any decoration never receive the event, and every gesture behaves exactly as before the redesign.
4. **Given** a selected item, **When** it is shown, **Then** its cyan selection highlight is clearly distinguishable
   from the hover outline and from an unselected item.
5. **Given** a line being drawn, **When** valid ends are ringed and one is under the pointer, **Then** the rings and
   the line preview use the drafting style and remain distinguishable from each other as they are today.

---

### User Story 3 - Read the generated source and its validation (Priority: P2)

The author opens the source view and reads the generated Mermaid source in a monospace face with syntax highlighting
(keywords, identifiers, labels, arrows and comments told apart), with a clear indication of whether Mermaid accepts it,
is still checking it, rejects it (with the reason) or accepts it with a notice. The view still cannot be typed in.

**Why this priority**: The source is the editor's output; it must stay readable and its status unmistakable, but the
diagram can be edited without opening it.

**Independent Test**: For a valid diagram, a diagram with a notice and a diagram whose source Mermaid rejects, open
the source view and confirm the highlighted text matches the copied source exactly and the status is shown in the
correct state colour with its text.

**Acceptance Scenarios**:

1. **Given** a diagram, **When** the source view is shown, **Then** its text is character-for-character the text that
   Copy source places on the clipboard, highlighted, in a monospace face, and cannot be edited.
2. **Given** an edit, undo or redo, **When** it completes, **Then** the source view shows the new generated source.
3. **Given** source Mermaid rejects, **When** the status is shown, **Then** it is in the error colour with the reason
   in text; a notice is in amber with its text; acceptance is in the success colour; colour is never the only cue.

---

### User Story 4 - See Mermaid's own drawing in the blueprint style (Priority: P2)

Where the editor shows a diagram drawn by Mermaid itself (the flowchart preview and the import pictures and
comparison), the drawing follows the current appearance. In Blueprint Studio it uses a dedicated blueprint look: deep-blue node fills, ivory text, cyan outlines and
clearly visible connectors, with standard shapes still recognisable; in Light it uses Mermaid's default look. Styles written in imported source still take
effect in the picture of that source. Nothing of this appearance is added to the copied source, the copied Markdown or
saved files.

**Why this priority**: These drawings sit inside the workspace and would clash with it otherwise, but they are
secondary views.

**Independent Test**: Open the flowchart preview and the import comparison for a source with custom style statements,
and confirm the blueprint appearance, that the custom styles still show, and that copied source, Markdown and saved
files are unchanged from before the redesign.

**Acceptance Scenarios**:

1. **Given** the flowchart preview in Blueprint Studio, **When** it is drawn, **Then** nodes, labels, outlines and
   connectors use the blueprint look and every shape is still the shape Mermaid draws for it.
2. **Given** an open preview, **When** the author switches to Light, **Then** the preview is redrawn in Mermaid's
   default look.
3. **Given** imported source containing its own style or class statements, **When** its picture is drawn, **Then**
   those styles are visible over the blueprint defaults.
4. **Given** any diagram, **When** source or Markdown is copied or the diagram is saved to a file, **Then** the result
   is identical to what the editor produced before the redesign for the same diagram.

---

### User Story 5 - Use the editor in a narrow window or on a phone (Priority: P3)

On a narrow browser window or a mobile browser the canvas keeps most of the space, and the tools and source areas become panels the author
can switch to or collapse and reopen, without losing any control or the current selection.

**Why this priority**: Desktop browsers remain the main use; narrow windows and phones widen who can use the editor.

**Independent Test**: At a window width of 360 px and 768 px, and in each supported mobile browser, edit a diagram using only the collapsed panels and
confirm every control is reachable, nothing scrolls the page sideways and the canvas stays usable.

**Acceptance Scenarios**:

1. **Given** a window narrower than the wide layout needs, **When** the editor is shown, **Then** the canvas occupies
   most of the window and the tools and source areas are reachable through clearly labelled panel controls.
2. **Given** a collapsed tools panel, **When** the author opens it, selects a property and closes it, **Then** the
   selection and any draft label are kept and the canvas is unchanged.
3. **Given** any width from 360 px upward, **When** the editor is shown, **Then** the page never scrolls horizontally
   and the header controls stay reachable (wrapping or collapsing into a labelled menu).
4. **Given** a supported mobile browser, **When** the author creates, edits, saves and copies a diagram by touch,
   **Then** every operation available on desktop can be completed.

---

### Edge Cases

- **EC-01** **Dense diagrams**: at 100 elements and 150 relationships (the size the existing performance tests use) the grid must not obscure items or lines, and
  canvas responsiveness must not degrade compared with before the redesign.
- **EC-02** **Long labels**: labels that wrap or are truncated today keep that behaviour and remain readable in ivory on the
  item fill.
- **EC-03** **Labelled connectors**: connector labels stay readable where a line crosses the grid or another line.
- **EC-04** **Extreme zoom**: at minimum zoom the grid must not become a dense solid texture (it may thin to the major grid
  only); at maximum zoom the grid stays faint and aligned.
- **EC-05** **Sequence and C4 canvases**, which scroll rather than pan freely, keep the grid aligned with the drawing while
  scrolled and zoomed.
- **EC-06** **Invalid or incomplete source** (in import or when Mermaid rejects generated source): the error state is shown in
  the error colour with text and never in amber alone.
- **EC-07** **Non-flowchart diagrams** (sequence, C4): use the same palette and selection style; their type-specific notices
  keep their wording.
- **EC-08** **Third-party text on the canvas** (the canvas library's attribution link) stays readable at 4.5:1 on navy.
- **EC-09** **Focus on dark surfaces**: the keyboard focus indicator, drawn today in a blue tuned for a white canvas, must meet
  3:1 against navy.
- **EC-10** **Reduced motion**: when the user's system asks for reduced motion, transitions are removed.
- **EC-11** **Dialogs and menus** (import, lock, move-to, target, message, C4 kind): adopt the palette and keep their behaviour.

## Requirements *(mandatory)*

### Functional Requirements

**Design system**

- **FR-001**: For each appearance (Blueprint Studio and Light) the editor MUST define its colours, type faces, spacing, border radii, borders and transition durations
  once, as named design tokens, and every surface MUST take its appearance from those tokens rather than from colours
  written into individual parts.
- **FR-002**: The token set MUST include at least: blueprint background `#071C30`, panel background `#0D2B45`,
  secondary blue `#174565`, drafting cyan `#72D7F2`, drafting ivory `#F1E9D7`, annotation amber `#E8AD63`, muted text
  `#A9C0D0`, plus an error red and a success colour each chosen to meet the contrast rules of FR-020 on the blueprint
  and panel backgrounds.
- **FR-003**: Interface text MUST use a clean sans-serif face and source text and technical annotations a readable
  monospace face, both from fonts already on the user's device; no font or other asset may be fetched over the network.
- **FR-004**: Amber MUST be used only for emphasis, notices and warnings; red only for actual errors.

**Workspace layout**

- **FR-005**: The editor MUST present a compact header with the application name ("Mermaid diagram editor", unchanged), the diagram's name with its
  existing rename control, the existing document actions, undo/redo and the appearance switch (FR-026).
- **FR-006**: The editor MUST present the diagram canvas as the largest area of the workspace.
- **FR-007**: The editor MUST present a contextual tools area holding the item types the current diagram type offers
  (toolbox) and the properties of the selected item.
- **FR-008**: The editor MUST present a concise status area showing the current zoom level, the save status and the
  source check status already known to the editor; it MUST NOT show grid or snap controls, because the editor has no
  snapping.
- **FR-009**: The redesign MUST NOT remove, rename or change the effect of any existing control, and MUST NOT add any
  control without a working effect. Placing an existing control in a different area is allowed.
- **FR-010**: Below a width at which header, canvas, tools and source cannot sit side by side usefully, the tools and
  source areas MUST become switchable or collapsible panels with labelled controls, the canvas MUST keep most of the
  window, and the page MUST NOT scroll horizontally at any width from 360 px.
- **FR-027**: The supported mobile browsers are current stable Chrome on Android and Safari on iOS (desktop Safari stays
  unsupported). The editor MUST be usable in them by touch: every operation available on desktop
  MUST be reachable, and every control and handle MUST be at least the target size already required on desktop.
- **FR-028**: On every canvas, by touch: a one-finger drag on empty canvas MUST pan (or scroll) the drawing, a
  two-finger pinch MUST zoom the drawing only (never the page), within the same zoom limits as the zoom buttons, and a
  double-tap on an item MUST start renaming it as a double-click does. Touches on items keep the drag, connect and tap
  behaviour of feature 004. Adding an item uses the toolbox tap that exists today. No touch-only control is added. On
  sequence and C4 canvases, a second finger that touches down while an item, handle or line end is being dragged MUST
  be ignored until the drag ends: the drag continues and no zoom starts.

**Canvas**

- **FR-011**: Every editing canvas MUST have a solid background surface with a minor grid every 16 px and a major grid
  every 80 px at default zoom, the major grid more visible than the minor. In Blueprint Studio the surface is the
  blueprint background and the grid drafting cyan at low opacity; in Light the surface is light and the grid a faint
  colour from the Light token set.
- **FR-012**: The grid MUST be drawn as a layer separate from the diagram drawing and the editing interaction layers,
  MUST NOT receive pointer events, and MUST NOT add a canvas element per grid line or any continuous animation.
- **FR-013**: The grid MUST stay aligned with the drawing while the canvas is panned, scrolled or zoomed.
- **FR-014**: Any drafting border or registration mark, if added, MUST sit outside the diagram's content area, MUST
  NOT receive pointer events and MUST NOT appear in copied or saved output.
- **FR-015**: Canvas items MUST be drawn with deep-blue fills, ivory labels and cyan outlines; lines MUST be clearly
  visible against the canvas; the selected item MUST carry a distinct cyan highlight; selection outlines, hover
  outlines, connection and end handles, drop-target rings and the line preview MUST use the drafting palette while
  keeping the visual distinctions defined in feature 004.
- **FR-016**: Every hit area, handle size, cursor and gesture defined in feature 004 MUST behave exactly as before.

**Source view**

- **FR-017**: The source view MUST show the generated source, exactly as copied, in the monospace face with syntax
  highlighting that distinguishes at least keywords, identifiers, labels/strings, arrows/operators and comments, and
  MUST remain read-only.
- **FR-018**: The source view MUST show the source check status (checking, valid, rejected with reason, notice) with
  text and state colour, never colour alone.

**Mermaid drawings**

- **FR-019**: In the Blueprint Studio appearance, every in-editor drawing made by Mermaid (flowchart preview, import
  picture, import comparison) MUST use a dedicated blueprint look (deep-blue fills, ivory text, cyan outlines, visible connectors), MUST keep standard
  shapes recognisable, and MUST let style and class statements in the drawn source take precedence over the blueprint
  defaults. In the Light appearance these drawings MUST use Mermaid's default look, as today. Switching appearance MUST
  redraw any Mermaid drawing on screen in the new look. The blueprint look MUST be applied when drawing only and MUST NOT be written into generated source,
  copied Markdown or saved files.

**Accessibility and interaction states**

- **FR-020**: Text MUST meet 4.5:1 contrast (3:1 for large text) and focus indicators, outlines, handles, lines and
  other meaningful graphics 3:1 against the surface they sit on; automated accessibility checks that pass today MUST
  still pass.
- **FR-021**: Every interactive element MUST show distinct hover, focus-visible, pressed/selected and disabled
  states; keyboard focus MUST always be visible.
- **FR-022**: State changes MAY animate with short transitions of at most 200 ms; nothing may animate continuously;
  all transitions MUST be removed when the user's system requests reduced motion.
- **FR-023**: All existing keyboard shortcuts, tooltips, accessible names, announcements and focus order MUST be
  preserved.

**Appearance switch**

- **FR-026**: The editor MUST offer two appearances, Blueprint Studio (the default) and Light, and a labelled switch in
  the header that changes between them. Switching MUST change every surface at once and MUST NOT change the diagram,
  selection, draft label, undo history, generated source, copied output or saved files. Both appearances MUST meet
  every requirement in this feature that is not specific to the Blueprint palette, including FR-001, FR-003, FR-004,
  FR-011 to FR-013, FR-015 to FR-023. The chosen appearance MUST be remembered in the browser's local storage and used on
  the next load; a missing, unreadable or unrecognised stored value MUST fall back to Blueprint Studio without an error.
  When the choice cannot be saved, the switch MUST still take effect for the session and the editor MUST show a notice
  that the choice could not be saved for next time.
  The remembered appearance is a preference only: it is never part of a diagram, a saved file or copied output.

**Preservation**

- **FR-024**: Mermaid generation, supported diagram types, source check, import, editing operations, selection,
  undo/redo, local persistence, file save and open, and copy actions MUST behave exactly as before; for any diagram the
  generated source, copied Markdown and saved file MUST be identical to what the editor produced before the redesign.
- **FR-025**: The redesign MUST NOT add dependencies unless the plan shows one is necessary, and MUST NOT add any
  network request.

### Key Entities

- **Appearance**: Blueprint Studio or Light; each has its own design token set.
- **Design token set**: the named colours, faces, spacing, radii, borders and durations that every surface draws from.
- **Workspace areas**: header, canvas, tools area (toolbox and properties), source view and status area, and their
  narrow-window panel form.
- **Blueprint drawing look**: the colours given to Mermaid's own drawings inside the editor in the Blueprint Studio
  appearance, separate from the generated source.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the existing automated tests (unit and end-to-end, both desktop browsers) that pass before the
  redesign pass after it, with expected behaviours changed only through a recorded, approved expectation change. The
  existing end-to-end suite stays desktop-only.
- **SC-002**: For every diagram in the import corpus and every end-to-end fixture, generated source, copied Markdown and
  saved file content are byte-identical before and after the redesign.
- **SC-003**: Automated accessibility checks report zero contrast or focus violations on the start page and on each
  diagram type's editor, in both appearances, including with a selection and with an error shown.
- **SC-004**: Every colour used on screen traces to a named design token; a search of the interface parts finds no
  colour value written outside the token definitions (third-party defaults overridden through tokens count as traced).
- **SC-005**: At window widths of 360 px, 768 px and 1440 px, and in automated runs in emulated Android Chrome and iOS
  Safari (the only mobile verification required), every control available before the redesign can be
  reached and used, and the page never scrolls horizontally.
- **SC-006**: At minimum, default and maximum zoom the grid stays aligned with the drawing to within 1 px after a pan,
  and a reviewer can read every label in a dense test diagram.
- **SC-007**: Canvas interactions (drag, pan, zoom) on a diagram at the model's item limit are no slower after the
  redesign than before, measured the same way as feature 004's interaction tests.
- **SC-008**: The editor makes zero network requests after load, as before.
- **SC-009**: A dedicated touch test suite passes on both emulated mobile profiles (Android Chrome, iOS Safari) and
  performs every editing, file and copy operation available on desktop by touch, including the gestures of FR-028.

## Assumptions

- **Light palette**: the Light token set starts from today's light colours (white surfaces, blue primary) with the same
  type faces, spacing and component styling as Blueprint Studio; the plan fixes its exact values against FR-020.
- **Header controls**: the appearance switch is the only new header control; no settings control is added, because
  there are no existing settings to host. The diagram name is shown with the rename control the editor already has.
- **Status area content**: the editor has no grid snapping, so no snap state is shown; the zoom level, save status
  and source check status are shown because the editor already knows them.
- **Source "editor"**: per constitution principle I the source view stays read-only; highlighting is the only change
  to how it presents source.
- **Fonts**: system font stacks (for example the platform UI face and the platform monospace face) satisfy FR-003
  without a network request.
- **Registration marks**: optional; the plan may omit them entirely.
- **Narrow windows and mobile**: desktop Chromium and Firefox stay supported; mobile browser support is added (FR-027);
  the narrow layout is tested at 360 px and 768 px.
- **Custom styles**: the visual model has no custom styles today (import reports and drops style statements), so
  preserving custom styles applies to Mermaid's drawing of imported source.
- **Existing visual tests**: screenshots or assertions that check specific colours of the old light appearance may need
  recorded expectation changes; these are not regressions.
