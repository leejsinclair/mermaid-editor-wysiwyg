import { MESSAGE_STYLE_NAMES, ROLE_NAMES } from "../../model/sequence/catalogue";
import { en } from "../../text/en";
import type { ToolboxGroup } from "../shared/Toolbox";
import { MessageIcon } from "./messageDrawing";

const PersonIcon = ({ actor }: Readonly<{ actor: boolean }>) => (
  <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
    {actor ? (
      <g>
        <circle cx="20" cy="6" r="4" />
        <path d="M20 10v7M14 13h12M20 17l-5 6M20 17l5 6" />
      </g>
    ) : (
      <rect x="6" y="4" width="28" height="16" />
    )}
  </svg>
);

/** Participant and Actor, then the eight message types; nothing else is offered (FR-027). */
export const SEQUENCE_TOOLBOX: readonly ToolboxGroup[] = [
  {
    label: en.toolbox.participants,
    items: [...ROLE_NAMES].map(([role, name]) => ({ id: role, name, icon: <PersonIcon actor={role === "actor"} /> })),
  },
  {
    label: en.toolbox.messageTypes,
    items: [...MESSAGE_STYLE_NAMES].map(([style, name]) => ({ id: style, name, icon: <MessageIcon style={style} /> })),
  },
];
