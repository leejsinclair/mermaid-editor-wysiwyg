import { Box, Button, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import type { LabelField, TypeChange } from "../../model/operations";
import { en } from "../../text/en";

export type SelectionKind = "node" | "connection" | "participant" | "message" | "boundary";

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
  /** The selected item's current label, or undefined when nothing is selected. */
  readonly label: string | undefined;
  /** What to say while nothing is selected. */
  readonly nothingSelected: string;
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
  /** A control was used without the selection it needs: explain what is needed. */
  readonly onNeed: (thing: keyof typeof en.properties.things) => void;
  readonly onChangeType: (change: TypeChange) => void;
  readonly onConnect: () => void;
  readonly onChangeEnd: () => void;
  readonly onReverse: () => void;
  readonly onDelete: () => void;
  /** Participants and messages can be moved earlier and later in their order; flowcharts have no such order. */
  readonly onMove?: (direction: "up" | "down") => void;
  /** C4 elements, boundaries and nodes can be moved into and out of boundaries. */
  readonly onMoveTo?: () => void;
  /** The C4 diagram's title, which only a C4 diagram has. */
  readonly title?: TitleFieldProps;
}

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
  const { kind, label, draft, typeOptions, nothingSelected, onDraft, onConfirm, onCancel, onNeed } = props;
  const labelField = useRef<HTMLTextAreaElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const controls = en.properties.controls;

  /** Runs `action` when the selection is one of `allowed`, and otherwise says what is needed. */
  const need = (allowed: readonly SelectionKind[], thing: keyof typeof en.properties.things, action: () => void) => {
    if (kind !== null && allowed.includes(kind)) action();
    else onNeed(thing);
  };
  const any: readonly SelectionKind[] = ["node", "connection", "participant", "message", "boundary"];

  return (
    <Box component="section" aria-label={en.properties.region} sx={{ width: props.fullWidth === true ? "100%" : 280, boxSizing: "border-box", p: 2, ...(props.fullWidth === true ? {} : { borderLeft: 1 }), borderColor: "divider", bgcolor: "background.paper" }}>
      {props.title && <TitleField {...props.title} />}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => {
            need(any, "item", () => labelField.current?.focus());
          }}>
          {controls.rename}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={(event) => {
            const button = event.currentTarget;
            need(any, "item", () => {
              setMenuAnchor(button);
            });
          }}
        >
          {controls.changeType}
        </Button>
        <Button size="small" variant="outlined" onClick={() => {
            need(["node", "participant"], "node", props.onConnect);
          }}>
          {controls.connect}
        </Button>
        <Button size="small" variant="outlined" onClick={() => {
            need(["connection", "message"], "connection", props.onChangeEnd);
          }}>
          {controls.changeEnd}
        </Button>
        <Button size="small" variant="outlined" onClick={() => {
            need(["connection", "message"], "connection", props.onReverse);
          }}>
          {controls.reverse}
        </Button>
        {props.onMoveTo && (
          <Button size="small" variant="outlined" onClick={() => {
              need(["node", "boundary"], "item", () => props.onMoveTo?.());
            }}>
            {controls.moveTo}
          </Button>
        )}
        {props.onMove && (
          <>
            <Button size="small" variant="outlined" onClick={() => {
                need(["participant", "message", "connection"], "item", () => props.onMove?.("up"));
              }}>
              {controls.moveUp}
            </Button>
            <Button size="small" variant="outlined" onClick={() => {
                need(["participant", "message", "connection"], "item", () => props.onMove?.("down"));
              }}>
              {controls.moveDown}
            </Button>
          </>
        )}
        <Button size="small" variant="outlined" color="error" onClick={() => {
            need(any, "item", props.onDelete);
          }}>
          {controls.delete}
        </Button>
      </Box>
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
