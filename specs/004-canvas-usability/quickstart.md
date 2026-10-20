# Quickstart: Canvas Usability

How to see this feature working and run its checks. Behaviour details are in
[contracts/canvas-interaction.md](contracts/canvas-interaction.md).

## Run the checks

```bash
npm run typecheck
npm test                 # pure functions: nearestSides, handlesFit, insertIndexAt, isDoubleActivation, reducer
npm run test:e2e         # Chromium and Firefox; touch and pen tests run in Chromium only
npm run lint             # includes Stylelint for the new canvas stylesheet
```

During implementation, run tests only through `tdd_check.py run` with the commands in the plan's Verification Plan.

## Try it by hand

Start the app with `npm run dev` and open `#/new/flowchart`.

1. **Rename in place**: add two shapes, double-click one, type "Start", press Enter. The node and the source panel
   show "Start". Press Ctrl+Z (outside the editor): the old label returns in one step.
2. **Cancel**: double-click the node, type, press Escape. Nothing changes; Undo is unchanged.
3. **Move versus connect**: hover a node. The cursor is a move cursor and four handles appear. Hover a handle: the
   cursor becomes a crosshair. Drag the body: the node moves. Drag a handle to the other node: a line appears and
   the first node stays where it was.
4. **Drop targets**: while dragging from a handle, every node is outlined and the one under the pointer is marked
   more strongly. Release on empty canvas: no line.
5. **Line labels**: double-click the new line, type "Yes", press Enter. The source shows the label.
6. **Zoom**: zoom out until nodes are small. Handles keep their size, then disappear when a node becomes too small.

Open `#/new/sequence`, add three participants and two messages:

7. Hover a lifeline: a crosshair and the hint "Drag to another lifeline to add a message". Drag from it to another
   lifeline between the two messages: the insertion marker shows the gap, and the new message lands there.
8. Drag a participant header: the participant is reordered and no message is created.

Open a C4 Container diagram with a boundary and two elements:

9. Drag an element's body into the boundary: it moves in, and no relationship is created.
10. Drag from an element's handle to the other element: a one-way relationship labelled "Uses" appears.

## Keyboard and screen reader

- Tab to a node, press Enter to select it, press Enter again (or F2): the inline editor opens with the label
  selected. Type, press Enter: focus returns to the node.
- With a screen reader, focus a node: its description mentions dragging to move, dragging a handle to connect, F2
  to rename, and the Connect command.
