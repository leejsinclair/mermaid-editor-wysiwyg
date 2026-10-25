import { Box, Button, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { useId, useRef, useState, type ReactElement } from "react";
import type { LabelField, TypeChange } from "../../model/operations";
import { en } from "../../text/en";
import { fill } from "../../text/fill";
import { ChangeEndpointsIcon, ChangeTypeIcon, ConnectIcon, DeleteIcon, MoveToIcon, RenameIcon, ReverseIcon } from "./icons";

export type SelectionKind = "node" | "connection" | "participant" | "message" | "boundary";

/** An element-level action the Properties panel can offer (FR-014). */
export type ElementAction = "rename" | "changeType" | "connect" | "changeEndpoints" | "reverse" | "moveTo" | "moveUp" | "moveDown" | "delete";

/** An action that applies to the selection, with the reason it cannot be used now when it cannot (FR-016). */
export interface ActionOffer {
  readonly action: ElementAction;
  readonly unavailable?: string | undefined;
}

/** A selected connection, message or relationship's two ends and which way it runs (FR-010). */
export interface Ends {
  readonly from: string;
  readonly to: string;
  readonly direction: string;
}

export interface ExtraField {
  readonly field: "description" | "technology";
  readonly name: string;
  readonly value: string;
}

export interface TypeOption {
  readonly name: string;
  readonly change: TypeChange;
}

interface PropertiesPanelProps {
  /** What is selected, or none. */
  readonly kind: SelectionKind | null;
  /** The selected item's type as the panel names it (FR-013). */
  readonly typeName: string | undefined;
  /** The actions that apply to the selection, each with the reason it cannot be used now when it cannot (FR-014, FR-016). */
  readonly actions: readonly ActionOffer[];
  /** A selected connection, message or relationship's ends and direction (FR-010). */
  readonly ends?: Ends | undefined;
  /** The selected item's current label, or undefined when nothing is selected. */
  readonly label: string | undefined;
  /** What to say while nothing is selected. */
  readonly nothingSelected: string;
  /** The getting-started steps shown while nothing is selected, in the diagram type's own words; the flowchart's when none are given. */
  readonly steps?: readonly string[];
  /** The unconfirmed text being typed, if any. */
  readonly draft: string | undefined;
  /** The types the selected item may change to (its family). */
  readonly typeOptions: readonly TypeOption[];
  /** The fields other than the label that the selected item has, with the unconfirmed text of the one being typed. */
  readonly extraFields?: readonly ExtraField[];
  readonly draftField?: LabelField | undefined;
  readonly onDraft: (text: string, field?: LabelField) => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  /** Fills the width it is given (a panel above the canvas) instead of standing as a column beside it. */
  readonly fullWidth?: boolean;
  readonly onChangeType: (change: TypeChange) => void;
  readonly onConnect: () => void;
  readonly onChangeEnd: () => void;
  readonly onReverse: () => void;
  readonly onDelete: () => void;
  /** Participants, messages and Dynamic relationships can be moved earlier and later in their order. */
  readonly onMove?: (direction: "up" | "down") => void;
  /** C4 elements, boundaries and nodes can be moved into and out of boundaries. */
  readonly onMoveTo?: () => void;
  /** The C4 diagram's title, which only a C4 diagram has. */
  readonly title?: TitleFieldProps;
}

interface ActionLook {
  readonly name: string;
  readonly icon?: ReactElement;
}

/** Each element action's name, shared with the toolbar (FR-039), and its icon where it has one. */
const ACTIONS: ReadonlyMap<ElementAction, ActionLook> = new Map<ElementAction, ActionLook>([
  ["rename", { name: en.properties.controls.rename, icon: <RenameIcon /> }],
  ["changeType", { name: en.properties.controls.changeType, icon: <ChangeTypeIcon /> }],
  ["connect", { name: en.properties.controls.connect, icon: <ConnectIcon /> }],
  ["changeEndpoints", { name: en.properties.controls.changeEndpoints, icon: <ChangeEndpointsIcon /> }],
  ["reverse", { name: en.properties.controls.reverse, icon: <ReverseIcon /> }],
  ["moveTo", { name: en.properties.controls.moveTo, icon: <MoveToIcon /> }],
  ["moveUp", { name: en.properties.controls.moveUp }],
  ["moveDown", { name: en.properties.controls.moveDown }],
  ["delete", { name: en.properties.controls.delete, icon: <DeleteIcon /> }],
]);

interface TitleFieldProps {
  readonly value: string;
  readonly onCommit: (text: string) => void;
}

/** The C4 diagram's title: typed freely, confirmed with Enter (Shift+Enter adds a line), dropped with Escape. */
function TitleField({ value, onCommit }: Readonly<TitleFieldProps>) {
  const [typed, setTyped] = useState<string | undefined>();
  return (
    <TextField
      label={en.properties.title}
      multiline
      fullWidth
      sx={{ mb: 2 }}
      value={typed ?? value}
      onChange={(event) => {
        setTyped(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (typed !== undefined) onCommit(typed);
          setTyped(undefined);
        } else if (event.key === "Escape") {
          setTyped(undefined);
        }
      }}
    />
  );
}

/** Edits the selected item. Enter confirms, Shift+Enter adds a line, Escape cancels and keeps the previous label. */
export function PropertiesPanel(props: Readonly<PropertiesPanelProps>) {
  const { kind, label, draft, typeOptions, nothingSelected, onDraft, onConfirm, onCancel } = props;
  const labelField = useRef<HTMLTextAreaElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const reasonId = useId();

  const run = (action: ElementAction, button: HTMLElement) => {
    const handlers = new Map<ElementAction, () => void>([
      ["rename", () => labelField.current?.focus()],
      [
        "changeType",
        () => {
          setMenuAnchor(button);
        },
      ],
      ["connect", props.onConnect],
      ["changeEndpoints", props.onChangeEnd],
      ["reverse", props.onReverse],
      ["moveTo", () => props.onMoveTo?.()],
      ["moveUp", () => props.onMove?.("up")],
      ["moveDown", () => props.onMove?.("down")],
      ["delete", props.onDelete],
    ]);
    handlers.get(action)?.();
  };

  return (
    <Box component="section" aria-label={en.properties.region} sx={{ width: props.fullWidth === true ? "100%" : 280, boxSizing: "border-box", p: 2, ...(props.fullWidth === true ? {} : { borderLeft: 1 }), borderColor: "divider", bgcolor: "background.paper" }}>
      {props.title && <TitleField {...props.title} />}
      {kind === null ? (
        <>
          <Typography variant="subtitle2" component="h2">
            {en.properties.gettingStarted}
          </Typography>
          <Box component="ol" sx={{ listStyle: "none", p: 0, my: 1 }}>
            {(props.steps ?? Object.values(en.canvasHelp.gettingStarted)).map((step) => (
              <Typography key={step} component="li" variant="body2">
                {step}
              </Typography>
            ))}
          </Box>
        </>
      ) : (
        <>
          <Typography variant="subtitle2" component="h2" sx={{ mb: 1 }}>
            {fill(en.properties.selected, { type: props.typeName ?? "" })}
          </Typography>
          {props.ends && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">{fill(en.properties.from, { end: props.ends.from })}</Typography>
              <Typography variant="body2">{fill(en.properties.to, { end: props.ends.to })}</Typography>
              <Typography variant="body2">{fill(en.properties.direction, { direction: props.ends.direction })}</Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {props.actions.map(({ action, unavailable }) => {
              const { name, icon } = ACTIONS.get(action) ?? { name: action };
              return (
                <Button
                  key={action}
                  size="small"
                  variant="outlined"
                  {...(icon && { startIcon: icon })}
                  {...(action === "delete" && { color: "error", "data-discards-draft": true })}
                  {...(unavailable !== undefined && { "aria-disabled": true, "aria-describedby": `${reasonId}-${action}`, sx: { opacity: 0.55 } })}
                  onClick={(event) => {
                    if (unavailable === undefined) run(action, event.currentTarget);
                  }}
                >
                  {name}
                </Button>
              );
            })}
          </Box>
          {props.actions.map(({ action, unavailable }) =>
            unavailable === undefined ? null : (
              <Typography key={action} id={`${reasonId}-${action}`} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {unavailable}
              </Typography>
            ),
          )}
        </>
      )}
      <Menu
        open={menuAnchor !== null}
        anchorEl={menuAnchor}
        onClose={() => {
          setMenuAnchor(null);
        }}
      >
        {typeOptions.map((option) => (
          <MenuItem
            key={option.name}
            onClick={() => {
              setMenuAnchor(null);
              props.onChangeType(option.change);
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
      {label === undefined ? (
        <Typography variant="body2" color="text.secondary">
          {nothingSelected}
        </Typography>
      ) : (
        <TextField
          label={en.properties.label}
          multiline
          fullWidth
          inputRef={labelField}
          value={props.draftField === undefined ? (draft ?? label) : label}
          onChange={(event) => {
            onDraft(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onConfirm();
            } else if (event.key === "Escape") {
              onCancel();
            }
          }}
        />
      )}
      {(props.extraFields ?? []).map((extra) => (
        <TextField
          key={extra.field}
          label={extra.name}
          multiline
          fullWidth
          sx={{ mt: 2 }}
          value={draft !== undefined && props.draftField === extra.field ? draft : extra.value}
          onChange={(event) => {
            onDraft(event.target.value, extra.field);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onConfirm();
            } else if (event.key === "Escape") {
              onCancel();
            }
          }}
        />
      ))}
    </Box>
  );
}
