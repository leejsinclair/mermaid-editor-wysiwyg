# Editor workspace — Living Spec

## Purpose

The toolbox, properties panel, toolbar and status bar are how a person finds what they can do to the diagram. Without them the canvas has no visible actions, and on a narrow screen the same actions must still be reachable.

## Requirements

### The toolbox offers what the diagram type allows [inferred]
<!-- touches: app/rendering/shared/Toolbox.tsx, app/rendering/flowchart/toolboxGroups.tsx, app/rendering/sequence/toolboxGroups.tsx, app/rendering/c4/toolboxGroups.tsx -->

The toolbox groups its items by kind: node shapes and connection types for a flowchart, participants and message types for a sequence diagram, and elements, boundaries, nodes and relationships for C4.

#### Scenario: a sequence diagram is open

- **WHEN** the person opens the toolbox on a sequence diagram
- **THEN** it offers participants and message types, not flowchart shapes

### The properties panel edits the selected item [inferred]
<!-- touches: app/rendering/shared/PropertiesPanel.tsx, app/editor/Editor.tsx -->

The properties panel shows the fields of the selected item and the operations that apply to it. With nothing selected it says what to select.

#### Scenario: nothing is selected

- **WHEN** nothing is selected
- **THEN** the panel says to select a node or connection to edit it

### Move to places an item in a boundary or at the top level [inferred]
<!-- touches: app/rendering/shared/MoveToDialog.tsx, app/rendering/shared/TargetDialog.tsx -->

Move to lists the boundaries an item can go into, and Top level. Connect and Change end list the items a connection can reach.

#### Scenario: an element is moved to the top level

- **WHEN** the person chooses Move to, then Top level
- **THEN** the element leaves its boundary and sits at the top level

### A refused action says why [inferred]
<!-- touches: app/rendering/shared/Feedback.tsx, app/rendering/shared/MessageDialog.tsx -->

A refused action or a notice is shown in words the person can act on, and the diagram keeps its previous state.

#### Scenario: an action is refused

- **WHEN** the editor refuses an action
- **THEN** the reason is shown and nothing on the diagram changes

### The status bar shows the zoom [inferred]
<!-- touches: app/rendering/shared/StatusBar.tsx -->

The status bar shows the zoom as a percentage, and updates while the person zooms.

#### Scenario: the person zooms in

- **WHEN** the person zooms in on the canvas
- **THEN** the status bar shows the new percentage

### On a narrow screen the tools move into a Tools panel [inferred]
<!-- touches: app/rendering/shared/Workspace.tsx, app/rendering/shared/Panel.tsx, app/rendering/shared/MoreActions.tsx -->

Below 900 px wide, the toolbox and properties appear in a Tools panel above the canvas. Below 600 px, the document actions sit under More actions. Every action the wide layout offers stays reachable.

#### Scenario: the window is narrowed below 600 px

- **WHEN** the window is narrower than 600 px
- **THEN** the document actions are under More actions, and the toolbox is in the Tools panel

## Uncovered

- The layer order and the rule that only `app/editor` imports persistence are enforced by `eslint.config.js` (`layerRules`). No capability owns them, and they are not restated here.
- `app/testing` is for tests only, enforced by the same ESLint block.
