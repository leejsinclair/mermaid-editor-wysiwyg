import { Box, Button, Tooltip, Typography } from "@mui/material";
import { useId, type ReactElement } from "react";
import { en } from "../../text/en";
import { CopyMarkdownIcon, CopySourceIcon, FitToViewIcon, PreviewIcon, RedoIcon, SaveIcon, UndoIcon, ZoomInIcon, ZoomOutIcon } from "./icons";
import { MoreActions, type MoreAction } from "./MoreActions";
import { placeActions, type ToolbarActionId } from "./toolbarGroups";
import { useLayout } from "./useLayout";

interface ToolbarProps {
  /** Only a flowchart has node positions of its own, so only it says they stay in the editor (FR-023, FR-024). */
  readonly showLayoutNote: boolean;
  readonly previewOpen: boolean;
  readonly onTogglePreview: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onCopySource: () => void;
  readonly onCopyMarkdown: () => void;
  readonly onSaveFile: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onFit: () => void;
}

/** Pressing a view control must not take focus from a label being typed on the canvas: zooming and panning keep the edit open. */
const keepFocus = (event: { preventDefault: () => void }): void => {
  event.preventDefault();
};

/** What the toolbar knows of one action: its name, icon and effect. Actions offered elsewhere (Rename, Change type, Move to…) are not here. */
interface Spec {
  readonly name: string;
  readonly icon: ReactElement;
  readonly run: () => void;
  readonly disabled?: boolean;
  /** Only these may lose their text, and only where the toolbar has no room (FR-042). */
  readonly iconOnlyWhenTight?: boolean;
  /** A view control, which must not take focus from a label being edited. */
  readonly view?: boolean;
  readonly pressed?: boolean;
  readonly discardsDraft?: boolean;
  /** Shown as the button's tooltip and read as its description. */
  readonly hint?: string;
}

export function Toolbar({ showLayoutNote, previewOpen, onTogglePreview, canUndo, canRedo, onUndo, onRedo, onCopySource, onCopyMarkdown, onSaveFile, onZoomIn, onZoomOut, onFit }: ToolbarProps) {
  // Below 600 px the document actions and the preview toggle are under "More actions" (spec 007, FR-010); each keeps its name and effect.
  const compact = useLayout() === "compact";
  const noteId = useId();
  // As a tooltip the note cannot push the buttons around (FR-023).
  const hint = showLayoutNote ? en.toolbar.layoutNote : undefined;
  const specs = new Map<ToolbarActionId, Spec>(Object.entries({
    undo: { name: en.toolbar.undo, icon: <UndoIcon />, run: onUndo, disabled: !canUndo, iconOnlyWhenTight: true, discardsDraft: true },
    redo: { name: en.toolbar.redo, icon: <RedoIcon />, run: onRedo, disabled: !canRedo, iconOnlyWhenTight: true, discardsDraft: true },
    copySource: { name: en.toolbar.copySource, icon: <CopySourceIcon />, run: onCopySource, hint },
    copyMarkdown: { name: en.toolbar.copyMarkdown, icon: <CopyMarkdownIcon />, run: onCopyMarkdown, hint },
    saveFile: { name: en.toolbar.saveFile, icon: <SaveIcon />, run: onSaveFile, hint },
    zoomIn: { name: en.toolbar.zoomIn, icon: <ZoomInIcon />, run: onZoomIn, iconOnlyWhenTight: true, view: true },
    zoomOut: { name: en.toolbar.zoomOut, icon: <ZoomOutIcon />, run: onZoomOut, iconOnlyWhenTight: true, view: true },
    fit: { name: en.toolbar.fit, icon: <FitToViewIcon />, run: onFit, iconOnlyWhenTight: true, view: true },
    preview: { name: en.toolbar.preview, icon: <PreviewIcon />, run: onTogglePreview, pressed: previewOpen },
  } as Partial<Record<ToolbarActionId, Spec>>) as [ToolbarActionId, Spec][]);
  const { groups, overflow } = placeActions(compact ? "compact" : "wide");
  const rest: readonly MoreAction[] = overflow.flatMap((id) => {
    const spec = specs.get(id);
    return spec === undefined ? [] : [{ name: spec.name, run: spec.run, icon: spec.icon, ...(spec.pressed === undefined ? {} : { on: spec.pressed }) }];
  });

  const button = (id: ToolbarActionId, spec: Spec): ReactElement => {
    const iconOnly = compact && spec.iconOnlyWhenTight === true;
    return (
      <Tooltip key={id} title={iconOnly ? spec.name : (spec.hint ?? "")} describeChild>
        {/* The wrapper lets a disabled button still show its tooltip. */}
        <span>
          <Button
            variant="outlined"
            size="small"
            disabled={spec.disabled === true}
            onClick={spec.run}
            {...(spec.view ? { onMouseDown: keepFocus } : {})}
            {...(spec.pressed === undefined ? {} : { "aria-pressed": spec.pressed })}
            {...(spec.discardsDraft ? { "data-discards-draft": true } : {})}
            {...(spec.hint === undefined ? {} : { "aria-describedby": noteId })}
            {...(iconOnly ? { "aria-label": spec.name, sx: { minWidth: 36, px: 1 } } : { startIcon: spec.icon })}
          >
            {iconOnly ? spec.icon : spec.name}
          </Button>
        </span>
      </Tooltip>
    );
  };

  // A compact toolbar has these actions under More actions, where no tooltip shows, so there the note stays as text below the toolbar.
  const note = showLayoutNote && (
    <Typography id={noteId} variant="caption" color="text.secondary" hidden={!compact} sx={{ flexBasis: "100%" }}>
      {en.toolbar.layoutNote}
    </Typography>
  );

  return (
    <Box role="toolbar" aria-label={en.toolbar.region} sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 2, px: 2, py: 1, "& .MuiButton-root": { whiteSpace: "nowrap" } }}>
      {groups.map((group) => {
        const present = group.actions.flatMap((id) => {
          const spec = specs.get(id);
          return spec === undefined ? [] : [{ id, spec }];
        });
        if (present.length === 0) return null;
        return (
          <Box key={group.id} role="group" aria-label={group.heading} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" aria-hidden="true">
              {group.heading}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>{present.map(({ id, spec }) => button(id, spec))}</Box>
          </Box>
        );
      })}
      {compact && rest.length > 0 && <MoreActions actions={rest} />}
      {note}
    </Box>
  );
}
