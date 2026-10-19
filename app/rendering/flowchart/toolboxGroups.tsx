import { CONNECTION_TYPES, FLOWCHART_SHAPES } from "../../model/flowchart/catalogue";
import { en } from "../../text/en";
import type { ToolboxGroup } from "../shared/Toolbox";
import { ConnectionIcon, ShapeIcon } from "./icons";

/** Nine node shapes and nine connection types; direction is fixed top-to-bottom with no control (FR-024). */
export const FLOWCHART_TOOLBOX: readonly ToolboxGroup[] = [
  {
    label: en.toolbox.nodeShapes,
    items: FLOWCHART_SHAPES.map(({ shape, name }) => ({
      id: shape,
      name,
      icon: <ShapeIcon shape={shape} />,
      draggable: true,
    })),
  },
  {
    label: en.toolbox.connectionTypes,
    items: CONNECTION_TYPES.map(({ line, ending, name }) => ({
      id: `${line}-${ending}`,
      name,
      icon: <ConnectionIcon line={line} ending={ending} />,
      toggle: true,
    })),
  },
];
