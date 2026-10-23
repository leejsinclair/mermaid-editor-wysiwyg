import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CONNECTION_TYPES, FLOWCHART_SHAPES } from "../model/flowchart/catalogue";
import { offerFile, saveDiagram } from "./library";
import { recallSession, rememberSession } from "./sessions";
import { createSaver, type SaveStatus } from "./saveStatus";
import { useEditorKeyboard } from "./keyboard";
import { unsafeToLeave, useLeaveWarning } from "./leavePage";
import { canRedo, canUndo, createHistory } from "../history/history";
import { rejectionMessage } from "../validation/messages";
import type { Diagram } from "../model/types";
import { Preview } from "../rendering/flowchart/Preview";
import { FlowchartCanvas, type FlowchartHandle } from "../rendering/flowchart/FlowchartCanvas";
import { FLOWCHART_TOOLBOX } from "../rendering/flowchart/toolboxGroups";
import { PropertiesPanel } from "../rendering/shared/PropertiesPanel";
import { TargetDialog } from "../rendering/shared/TargetDialog";
import { SequenceCanvas } from "../rendering/sequence/SequenceCanvas";
import { SEQUENCE_TOOLBOX } from "../rendering/sequence/toolboxGroups";
import { C4Canvas } from "../rendering/c4/C4Canvas";
import { c4Toolbox, c4ToolboxAction } from "../rendering/c4/toolboxGroups";
import { MoveToDialog } from "../rendering/shared/MoveToDialog";
import { MessageDialog } from "../rendering/shared/MessageDialog";
import { MESSAGE_STYLE_NAMES } from "../model/sequence/catalogue";
import type { Operation } from "../model/operations";
import type { Direction, MessageStyle } from "../model/types";
import { defaultEnd, describeSelection, extraFieldsOf, wording, messageInsertIndex, moveToOptions, participantInsertIndex, steppedIndex, steppedRelationshipIndex } from "./selection";
import "../rendering/shared/canvas.css";
import { Feedback, withAppearanceNotice } from "../rendering/shared/Feedback";
import { AppearanceSwitch } from "../rendering/theme/AppearanceSwitch";
import { useAppearance } from "../rendering/theme/appearanceContext";
import type { Appearance } from "../rendering/theme/tokens";
import type { ViewHandle } from "../rendering/shared/viewport";
import { Toolbar } from "../rendering/shared/Toolbar";
import { useLayout } from "../rendering/shared/useLayout";
import { Workspace } from "../rendering/shared/Workspace";
import { Toolbox } from "../rendering/shared/Toolbox";
import { SourcePanel } from "../rendering/shared/SourcePanel";
import { statusText, statusTone } from "../rendering/shared/sourceStatus";
import { StatusBar } from "../rendering/shared/StatusBar";
import { createZoomStore } from "../rendering/shared/zoomStore";
import { en } from "../text/en";
import { typeLabel } from "../text/typeLabel";
import { copyText, markdownFence } from "./clipboard";
import { inlineEditOf } from "./inlineEdit";
import { reducer, type EditorAction, type EditorState } from "./reducer";
import { useSourceCheck } from "./useSourceCheck";

interface EditorProps {
  readonly initial: Diagram;
  /** The diagram was read from storage, so it starts out saved. */
  readonly stored?: boolean;
  /** Called once, when a diagram that was new has been saved for the first time. */
  readonly onFirstSaved?: (id: string) => void;
  /** Another tab has taken over this diagram: this tab drops anything half done and neither edits nor saves. */
  readonly locked?: boolean;
}

const SAVE_TEXT = new Map<SaveStatus, string>([
  ["new", en.saveStatus.new],
  ["saving", en.saveStatus.saving],
  ["saved", en.saveStatus.saved],
  ["not-saved", en.saveStatus.notSaved],
  ["unavailable", en.saveStatus.unavailable],
]);
export function Editor({ initial, stored = false, onFirstSaved, locked = false }: EditorProps) {
  const [state, dispatchAction] = useReducer(
    reducer,
    initial,
    (start): EditorState =>
      recallSession(start.id)?.state ?? { history: createHistory(start), selection: null, draft: null, nameDraft: null, gesture: 0, armed: null, feedback: null },
  );
  const dispatch = useCallback(
    (action: EditorAction) => {
      if (!locked) dispatchAction(action);
    },
    [locked],
  );
  useEffect(() => {
    if (locked) dispatchAction({ type: "release" });
  }, [locked]);
  const diagram = state.history.present;
  const flowchart = diagram.type === "flowchart" ? diagram : undefined;
  const { kind: selectionKind, label: selectedLabel, typeOptions, targets } = describeSelection(diagram, state.selection);
  const navigate = useNavigate();
  const nameField = useRef<HTMLInputElement>(null);
  const renaming = state.nameDraft !== null;
  useEffect(() => {
    if (renaming) nameField.current?.focus();
  }, [renaming]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dialog, setDialog] = useState<"connect" | "changeEnd" | "moveTo" | null>(null);
  const [messageStyle, setMessageStyle] = useState<MessageStyle | null>(null);
  const [relationshipDirection, setRelationshipDirection] = useState<Direction | null>(null);
  const sequence = diagram.type === "sequence" ? diagram : undefined;
  const c4 = diagram.type === "c4" ? diagram : undefined;
  /** What choosing a target in the Connect… or Change end… dialog asks for. */
  const chosenOperation = (selection: number, targetId: number, end: "from" | "to"): Operation => {
    if (dialog !== "connect") return { op: "moveEnd", linkId: selection, end, targetId };
    if (sequence) return { op: "addMessage", from: selection, to: targetId, style: "solid-arrow", text: MESSAGE_STYLE_NAMES.get("solid-arrow") ?? "" };
    if (c4) return { op: "addRelationship", from: selection, to: targetId, direction: "one-way" };
    return { op: "addConnection", from: selection, to: targetId, line: "solid", ending: "arrow" };
  };
  /** Adds a message at `at` (where a drawn one was let go), else after the selected one or at the bottom; its text is the message type's name. */
  const addMessage = (from: number, to: number, style: MessageStyle, at?: number) => {
    const index = at ?? (sequence ? messageInsertIndex(sequence, state.selection) : undefined);
    dispatch({
      type: "commit",
      operation: { op: "addMessage", from, to, style, text: MESSAGE_STYLE_NAMES.get(style) ?? style, ...(index !== undefined && { index }) },
    });
  };
  /** Moves the selected participant, message or Dynamic relationship one step earlier or later in its order. */
  const moveSelected = (direction: "up" | "down") => {
    const itemId = state.selection;
    if (itemId === null) return;
    let toIndex: number | undefined;
    if (sequence) toIndex = steppedIndex(sequence, itemId, direction);
    else if (c4) toIndex = steppedRelationshipIndex(c4, itemId, direction);
    if (toIndex !== undefined) dispatch({ type: "commit", operation: { op: "reorder", itemId, toIndex } });
  };
  const commitOperation = (operation: Parameters<typeof reducer>[1] & { type: "commit" }) => {
    dispatch(operation);
  };
  const canvasHandle = useRef<FlowchartHandle>(null);
  const viewHandle = useRef<ViewHandle>(null);
  /** The canvas of the open diagram, which owns its own zoom. */
  const view = () => (diagram.type === "flowchart" ? canvasHandle : viewHandle).current;
  useEditorKeyboard(dispatch, state.selection);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(() => recallSession(initial.id)?.saveStatus ?? (stored ? "saved" : "new"));
  const saver = useMemo(() => createSaver({ write: saveDiagram, onStatus: setSaveStatus }), []);
  const persisted = useRef<Diagram>(recallSession(initial.id)?.state.history.present ?? initial);
  useEffect(() => {
    rememberSession(initial.id, { state, saveStatus });
  }, [initial.id, state, saveStatus]);
  useLeaveWarning(unsafeToLeave(state, saveStatus));
  const leaving = useRef(false);
  const announced = useRef(saveStatus === "saved");
  useEffect(() => {
    if (saveStatus !== "saved" || announced.current) return;
    announced.current = true;
    // A person who has chosen the Start screen is not moved on to the saved diagram's own address.
    if (!leaving.current) onFirstSaved?.(initial.id);
  }, [saveStatus, initial.id, onFirstSaved]);
  useEffect(() => {
    // The first write is the first committed change; Undo and Redo are writes too (FR-042).
    if (locked || diagram === persisted.current) return;
    persisted.current = diagram;
    saver.enqueue(diagram);
  }, [diagram, saver, locked]);
  const { draft } = state;
  const draftText = draft?.origin === "panel" && draft.itemId === state.selection ? draft.text : undefined;
  const inlineEdit = inlineEditOf(state, dispatch);
  /** Selects the item or line and opens its label for editing where it sits. */
  const startEdit = (itemId: number) => {
    dispatch({ type: "select", itemId });
    dispatch({ type: "startInlineEdit" });
  };
  const { source, notices, status } = useSourceCheck(diagram);
  const { appearance, choose, kept } = useAppearance();
  const zoomStore = useMemo(() => createZoomStore(), []);
  const stacked = useLayout() !== "wide";
  const chooseAppearance = (next: Appearance): void => {
    choose(next);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box component="header" sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, px: 2, py: 1 }}>
          <Typography component="span" sx={{ fontWeight: "bold", color: "primary.main" }}>
            {en.appName}
          </Typography>
          <Typography component="span">{typeLabel(diagram.type, diagram.type === "c4" ? diagram.kind : undefined)}</Typography>
          <Button
            size="small"
            sx={{ ml: 2 }}
            onClick={() => {
              // A write still under way finishes first, so the saved list has the diagram as it is now.
              leaving.current = true;
              void saver.settled().then(() => navigate("/"));
            }}
          >
            {en.toolbar.startScreen}
          </Button>
          {state.nameDraft === null ? (
            <>
              <Typography component="span" sx={{ ml: 2, fontWeight: "bold" }}>
                {diagram.name}
              </Typography>
              <Button
                size="small"
                sx={{ ml: 1 }}
                onClick={() => {
                  dispatch({ type: "nameDraft", text: diagram.name });
                }}
              >
                {en.diagramName.rename}
              </Button>
            </>
          ) : (
            <TextField
              size="small"
              inputRef={nameField}
              sx={{ ml: 2 }}
              label={en.diagramName.label}
              value={state.nameDraft}
              onChange={(event) => {
                dispatch({ type: "nameDraft", text: event.target.value });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") dispatch({ type: "confirmName" });
                else if (event.key === "Escape") dispatch({ type: "nameDraft", text: null });
              }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          <AppearanceSwitch appearance={appearance} onChoose={chooseAppearance} />
        </Box>
        <Toolbar
          previewOpen={previewOpen}
          onTogglePreview={() => {
            setPreviewOpen((open) => !open);
          }}
          canUndo={canUndo(state.history)}
          canRedo={canRedo(state.history)}
          onUndo={() => {
            dispatch({ type: "undo" });
          }}
          onRedo={() => {
            dispatch({ type: "redo" });
          }}
          showLayoutNote={diagram.type === "flowchart"}
          onCopySource={() => {
            void copyText(source, status).then((feedback) => {
              dispatch({ type: "feedback", feedback });
            });
          }}
          onZoomIn={() => {
            view()?.zoomIn();
          }}
          onZoomOut={() => {
            view()?.zoomOut();
          }}
          onFit={() => {
            view()?.fit();
          }}
          onSaveFile={() => {
            offerFile(diagram);
            dispatch({ type: "feedback", feedback: { tone: "success", message: en.file.offered } });
          }}
          onCopyMarkdown={() => {
            void copyText(markdownFence(source), status, { success: en.copy.copiedMarkdown }).then((feedback) => {
              dispatch({ type: "feedback", feedback });
            });
          }}
        />
      </Box>
      <Feedback feedback={withAppearanceNotice(state.feedback, kept)} />
      <Workspace
        toolbox={
          <>
            {diagram.type === "sequence" && (
              <Toolbox
                fullWidth={stacked}
                groups={SEQUENCE_TOOLBOX}
                onActivate={(id) => {
                  if (id === "participant" || id === "actor") {
                    const index = sequence ? participantInsertIndex(sequence, state.selection) : undefined;
                    dispatch({ type: "commit", operation: { op: "addParticipant", role: id, ...(index !== undefined && { index }) } });
                  } else if (MESSAGE_STYLE_NAMES.has(id as MessageStyle)) {
                    setMessageStyle(id as MessageStyle);
                  }
                }}
              />
            )}
            {c4 && <Toolbox fullWidth={stacked} groups={c4Toolbox(c4.kind)} onActivate={(id) => {
              const action = c4ToolboxAction(id);
              if (action.kind === "relationship") setRelationshipDirection(action.direction);
              else dispatch({ type: "commit", operation: action.operation });
            }} />}
            {diagram.type === "flowchart" && <Toolbox
                fullWidth={stacked}
                groups={FLOWCHART_TOOLBOX}
                armedId={state.armed ? `${state.armed.line}-${state.armed.ending}` : null}
                onActivate={(id) => {
                  const shape = FLOWCHART_SHAPES.find((candidate) => candidate.shape === id);
                  if (shape !== undefined) {
                    dispatch({ type: "commit", operation: { op: "addNode", shape: shape.shape, position: canvasHandle.current?.visibleCentre() ?? { x: 0, y: 0 } } });
                    return;
                  }
                  const entry = CONNECTION_TYPES.find((type) => `${type.line}-${type.ending}` === id);
                  if (entry === undefined) return;
                  const alreadyArmed = state.armed?.line === entry.line && state.armed.ending === entry.ending;
                  dispatch({ type: "arm", connection: alreadyArmed ? null : { line: entry.line, ending: entry.ending } });
                }}
              />}
          </>
        }
        properties={
          <PropertiesPanel
            fullWidth={stacked}
            kind={selectionKind}
            label={selectedLabel}
            nothingSelected={wording(diagram).nothingSelected}
            draft={draftText}
            draftField={draft?.field}
            extraFields={extraFieldsOf(diagram, state.selection)}
            typeOptions={typeOptions}
            onNeed={(thing) => {
              dispatch({ type: "feedback", feedback: { tone: "error", message: rejectionMessage({ reason: "needsSelection", details: { thing: wording(diagram).things.get(thing) ?? thing } }) } });
            }}
            onChangeType={(change) => {
              if (state.selection !== null) commitOperation({ type: "commit", operation: { op: "changeType", itemId: state.selection, to: change } });
            }}
            onConnect={() => {
              setDialog("connect");
            }}
            onChangeEnd={() => {
              setDialog("changeEnd");
            }}
            {...((sequence ?? (c4?.kind === "dynamic" ? c4 : undefined)) && { onMove: moveSelected })}
            {...(c4 && {
              title: {
                value: c4.title,
                onCommit: (text: string) => {
                  dispatch({ type: "commit", operation: { op: "setTitle", text } });
                },
              },
              onMoveTo: () => {
                setDialog("moveTo");
              },
            })}
            onReverse={() => {
              if (state.selection !== null) commitOperation({ type: "commit", operation: { op: "reverse", linkId: state.selection } });
            }}
            onDelete={() => {
              if (state.selection !== null) commitOperation({ type: "commit", operation: { op: "deleteItem", itemId: state.selection } });
            }}
            onDraft={(text, field) => {
              if (state.selection !== null) dispatch({ type: "draft", itemId: state.selection, text, origin: "panel", ...(field && { field }) });
            }}
            onConfirm={() => {
              dispatch({ type: "confirmLabel" });
            }}
            onCancel={() => {
              dispatch({ type: "cancelDraft" });
            }}
          />
        }
      >
        <Box component="section" aria-label={en.editor.canvas} sx={{ flex: 1, minWidth: 0, position: "relative", bgcolor: "var(--canvas-surface)", color: "var(--canvas-ink)" }}>
          {diagram.type === "sequence" && (
            <SequenceCanvas
              handleRef={viewHandle}
              onZoomChange={zoomStore.set}
              diagram={diagram}
              inlineEdit={inlineEdit}
              onStartEdit={startEdit}
              selection={state.selection}
              onSelect={(itemId) => {
                dispatch({ type: "select", itemId });
              }}
              onReorder={(itemId, toIndex) => {
                dispatch({ type: "commit", operation: { op: "reorder", itemId, toIndex } });
              }}
              onCreateMessage={(from, to, index) => {
                addMessage(from, to, "solid-arrow", index);
              }}
              onMoveEnd={(messageId, end, targetId) => {
                dispatch({ type: "commit", operation: { op: "moveEnd", linkId: messageId, end, targetId } });
              }}
            />
          )}
          {c4 && (
            <C4Canvas
              handleRef={viewHandle}
              onZoomChange={zoomStore.set}
              diagram={c4}
              inlineEdit={inlineEdit}
              onStartEdit={startEdit}
              selection={state.selection}
              onSelect={(itemId) => {
                dispatch({ type: "select", itemId });
              }}
              onCreateRelationship={(from, to) => {
                dispatch({ type: "commit", operation: { op: "addRelationship", from, to, direction: "one-way" } });
              }}
              onMoveEnd={(linkId, end, targetId) => {
                dispatch({ type: "commit", operation: { op: "moveEnd", linkId, end, targetId } });
              }}
              onMoveToParent={(itemId, parentId) => {
                dispatch({ type: "commit", operation: { op: "moveToParent", itemId, parentId } });
              }}
              onReorder={(itemId, toIndex) => {
                dispatch({ type: "commit", operation: { op: "reorder", itemId, toIndex } });
              }}
            />
          )}
          {diagram.type === "flowchart" && (
            <FlowchartCanvas
              handleRef={canvasHandle}
              onZoomChange={zoomStore.set}
              diagram={diagram}
              inlineEdit={inlineEdit}
              onStartEdit={startEdit}
              onAddNode={(shape, position) => {
                dispatch({ type: "commit", operation: { op: "addNode", shape, position } });
              }}
              onMoveNode={(id, position) => {
                dispatch({ type: "commit", operation: { op: "moveNode", id, position } });
              }}
              onNudgeNode={(id, position) => {
                dispatch({ type: "commit", operation: { op: "moveNode", id, position }, mergeKey: `move:${String(id)}` });
              }}
              onFocusLeave={() => {
                dispatch({ type: "seal" });
              }}
              selection={state.selection}
              cancelDragSignal={state.gesture}
              onMoveEnd={(linkId, end, targetId) => {
                dispatch({ type: "commit", operation: { op: "moveEnd", linkId, end, targetId } });
              }}
              onSelect={(itemId) => {
                dispatch({ type: "select", itemId });
              }}
              armed={state.armed}
              onAddConnection={(from, to, line, ending) => {
                dispatch({ type: "commit", operation: { op: "addConnection", from, to, line, ending } });
              }}
            />
          )}
        </Box>
      </Workspace>
      {dialog === "moveTo" && c4 && state.selection !== null && (
        <MoveToDialog
          options={moveToOptions(c4, state.selection)}
          onClose={() => {
            setDialog(null);
          }}
          onChoose={(parentId) => {
            const itemId = state.selection;
            setDialog(null);
            if (itemId !== null) dispatch({ type: "commit", operation: { op: "moveToParent", itemId, parentId } });
          }}
        />
      )}
      {(dialog === "connect" || dialog === "changeEnd") && state.selection !== null && (
        <TargetDialog
          title={dialog === "connect" ? en.properties.connectTitle : en.properties.changeEndTitle}
          targets={targets}
          chooseEnd={dialog === "changeEnd"}
          onClose={() => {
            setDialog(null);
          }}
          onChoose={(targetId, end) => {
            const selection = state.selection;
            setDialog(null);
            if (selection === null) return;
            commitOperation({
              type: "commit",
              operation: chosenOperation(selection, targetId, end),
            });
          }}
        />
      )}
      {messageStyle !== null && sequence && (
        <MessageDialog
          participants={targets}
          defaultEnd={defaultEnd(sequence, state.selection)}
          onClose={() => {
            setMessageStyle(null);
          }}
          onChoose={(from, to) => {
            const style = messageStyle;
            setMessageStyle(null);
            addMessage(from, to, style);
          }}
        />
      )}
      {relationshipDirection !== null && c4 && (
        <MessageDialog
          participants={targets}
          defaultEnd={state.selection !== null && targets.some((target) => target.id === state.selection) ? state.selection : undefined}
          text={{ title: en.c4.relationshipDialog.title, first: en.c4.relationshipDialog.source, second: en.c4.relationshipDialog.target, add: en.c4.relationshipDialog.add }}
          onClose={() => {
            setRelationshipDirection(null);
          }}
          onChoose={(from, to) => {
            const direction = relationshipDirection;
            setRelationshipDirection(null);
            dispatch({ type: "commit", operation: { op: "addRelationship", from, to, direction } });
          }}
        />
      )}
      {previewOpen && flowchart && <Preview source={source} />}
      <SourcePanel source={source} notices={notices} status={status} />
      <StatusBar zoomStore={zoomStore} saveText={SAVE_TEXT.get(saveStatus) ?? ""} sourceText={statusText(status)} sourceTone={statusTone(status)} />
    </Box>
  );
}
