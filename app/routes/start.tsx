import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { importFile, listDiagrams, onLibraryChanged, lockedDiagramIds, removeDiagram, type LibraryEntry } from "../editor/library";
import type { C4Kind, DiagramType } from "../model/types";
import { Feedback, type FeedbackMessage } from "../rendering/shared/Feedback";
import { C4KindDialog } from "../rendering/shared/C4KindDialog";
import { en } from "../text/en";
import { fill } from "../text/fill";
import { typeLabel } from "../text/typeLabel";

const CHOICES: readonly { type: DiagramType; name: string }[] = [
  { type: "flowchart", name: en.start.types.flowchart },
  { type: "sequence", name: en.start.types.sequence },
  { type: "c4", name: en.start.types.c4 },
];

type Readable = Extract<LibraryEntry, { readable: true }>;

interface RowActions {
  readonly locked: boolean;
  readonly onDelete: () => void;
}

/** Delete… is offered unless another tab is editing the diagram, which is then said instead (EC-13). */
function DeleteControl({ locked, onDelete }: RowActions) {
  if (locked) return <Typography component="span">{en.library.openElsewhere}</Typography>;
  return (
    <Button size="small" onClick={onDelete}>
      {en.library.delete}
    </Button>
  );
}

function ReadableRow({ entry, ...actions }: { readonly entry: Readable } & RowActions) {
  return (
    <>
      <Link to={`/d/${entry.id}`}>{entry.name}</Link>
      <Typography component="span" color="text.secondary">
        {typeLabel(entry.type, entry.kind)}
      </Typography>
      <Typography component="span" color="text.secondary">
        {en.library.lastChanged} <time dateTime={entry.changedAt}>{new Date(entry.changedAt).toLocaleString()}</time>
      </Typography>
      <DeleteControl {...actions} />
    </>
  );
}

function UnreadableRow({ entry, ...actions }: { readonly entry: Extract<LibraryEntry, { readable: false }> } & RowActions) {
  return (
    <>
      <Typography component="span">{entry.name}</Typography>
      <Typography component="span" color="error">
        {fill(en.library.cannotRead, { reason: entry.problem })}
      </Typography>
      <DeleteControl {...actions} />
    </>
  );
}

async function loadSaved(): Promise<SavedList> {
  try {
    const [entries, locked] = await Promise.all([listDiagrams(), lockedDiagramIds()]);
    return { kind: "ready", entries, locked };
  } catch {
    return { kind: "unavailable" };
  }
}

type SavedList =
  | { readonly kind: "loading" }
  | { readonly kind: "unavailable" }
  | { readonly kind: "ready"; readonly entries: readonly LibraryEntry[]; readonly locked: ReadonlySet<string> };

export default function Start() {
  const navigate = useNavigate();
  const [choosingKind, setChoosingKind] = useState(false);
  const [saved, setSaved] = useState<SavedList>({ kind: "loading" });
  const [deleting, setDeleting] = useState<LibraryEntry | undefined>();
  const [refusal, setRefusal] = useState<FeedbackMessage | null>(null);
  const openChosen = async (file: File) => {
    const imported = await importFile(file);
    if (imported.ok) void navigate(`/d/${imported.id}`);
    else setRefusal({ tone: "error", message: imported.message });
  };
  const refresh = useCallback(() => loadSaved().then(setSaved), []);
  useEffect(() => {
    void refresh();
    return onLibraryChanged(() => void refresh());
  }, [refresh]);

  const choose = (type: DiagramType) => {
    if (type === "c4") setChoosingKind(true);
    else void navigate(`/new/${type}`);
  };
  const chooseKind = (kind: C4Kind) => {
    setChoosingKind(false);
    void navigate(`/new/c4/${kind}`);
  };

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {en.start.heading}
      </Typography>
      <Box component="section" aria-labelledby="new-diagram-heading">
        <Typography variant="h6" component="h2" id="new-diagram-heading" gutterBottom>
          {en.start.newDiagram}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {CHOICES.map(({ type, name }) => (
            <Button
              key={type}
              variant="contained"
              onClick={() => {
                choose(type);
              }}
            >
              {name}
            </Button>
          ))}
        </Box>
      </Box>
      <Feedback feedback={refusal} />
      <Box component="section" aria-label={en.file.openRegion} sx={{ mt: 2 }}>
        <Button variant="outlined" component="label">
          {en.file.open}
          <input
            type="file"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void openChosen(file);
            }}
          />
        </Button>
      </Box>
      <Box component="section" aria-labelledby="saved-heading" sx={{ mt: 4 }}>
        <Typography variant="h6" component="h2" id="saved-heading" gutterBottom>
          {en.library.heading}
        </Typography>
        {saved.kind === "unavailable" && <Typography>{en.library.unavailable}</Typography>}
        {saved.kind === "ready" && saved.entries.length === 0 && <Typography>{en.library.empty}</Typography>}
        {saved.kind === "ready" && saved.entries.length > 0 && (
          <List>
            {saved.entries.map((entry) => (
              <ListItem key={entry.id} sx={{ display: "flex", gap: 2 }}>
                {entry.readable ? (
                  <ReadableRow entry={entry} locked={saved.locked.has(entry.id)} onDelete={() => { setDeleting(entry); }} />
                ) : (
                  <UnreadableRow entry={entry} locked={saved.locked.has(entry.id)} onDelete={() => { setDeleting(entry); }} />
                )}
              </ListItem>
            ))}
          </List>
        )}
        <Typography variant="body2" color="text.secondary">
          {en.library.note}
        </Typography>
      </Box>
      <Dialog open={deleting !== undefined} onClose={() => { setDeleting(undefined); }} aria-labelledby="delete-title">
        <DialogTitle id="delete-title">{en.library.deleteTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{fill(en.library.deleteBody, { name: deleting?.name ?? "" })}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleting(undefined); }}>{en.library.cancel}</Button>
          <Button
            color="error"
            onClick={() => {
              const target = deleting;
              setDeleting(undefined);
              if (target) void removeDiagram(target.id).then(refresh, refresh);
            }}
          >
            {en.library.confirmDelete}
          </Button>
        </DialogActions>
      </Dialog>
      <C4KindDialog
        open={choosingKind}
        onChoose={chooseKind}
        onClose={() => {
          setChoosingKind(false);
        }}
      />
    </Container>
  );
}
