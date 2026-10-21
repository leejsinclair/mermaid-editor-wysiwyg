import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { fill } from "../../text/fill";
import { generate } from "../../generation/generate";
import type { Diagram } from "../../model/types";
import type { ReportCategory } from "../../importing/report";
import type { ReadDeps } from "../../importing/outcome";
import { en } from "../../text/en";
import { typeLabel } from "../../text/typeLabel";
import type { Outcome } from "../../importing/outcome";
import { CompareView } from "./CompareView";
import { preloadMermaid } from "../shared/MermaidPicture";
import { ImportPicture } from "./ImportPicture";
import { ImportReport } from "./ImportReport";
import { PasteArea } from "./PasteArea";
import { readTextFile, type FileRead } from "./readFile";
import { useImport } from "./useImport";

/** "Flowchart", "Sequence diagram", or "C4 Container" for a C4 diagram: the kind is shown (contracts/import-dialog.md). */
function detectedLabel(diagram: Diagram): string {
  if (diagram.type !== "c4") return typeLabel(diagram.type);
  return `C4 ${en.start.kinds[diagram.kind]}`;
}

/** What the status region says: a save failure, else the error, else the report's counts, else that nothing was dropped (contracts/import-dialog.md). */
/** The words for a refusal: its reason, and the limit or the kinds it names (EC-08, EC-06). */
function refusalText(refused: Extract<Outcome, { kind: "refused" }>): string {
  switch (refused.reason) {
    case "tooLarge":
      return fill(en.importMermaid.refusedTooLarge, { megabytes: String((refused.limit ?? 0) / 1048576) });
    case "tooDeep":
      return fill(en.importMermaid.refusedTooDeep, { limit: String(refused.limit ?? 0) });
    case "kindUndetected":
      return en.importMermaid.refusedKindUndetected;
    case "kindsMixed":
      return fill(en.importMermaid.refusedKindsMixed, { kinds: (refused.kinds ?? []).map((kind) => en.start.kinds[kind]).join(", ") });
    case "notValid":
      return en.importMermaid.refusedNotValid;
  }
}

function statusText(ready: Extract<Outcome, { kind: "ready" }> | undefined, invalid: Extract<Outcome, { kind: "invalid" }> | undefined, unsupported: Extract<Outcome, { kind: "unsupported" }> | undefined, refused: Extract<Outcome, { kind: "refused" }> | undefined, saveProblem: string | undefined): string {
  if (saveProblem !== undefined) return fill(en.importMermaid.saveFailed, { reason: saveProblem });
  if (refused !== undefined) return refusalText(refused);
  if (invalid !== undefined) return fill(en.importMermaid.invalidAt, { line: String(invalid.line), column: String(invalid.column), message: invalid.message });
  if (unsupported !== undefined) return unsupported.found === "" ? en.importMermaid.unsupportedNoType : fill(en.importMermaid.unsupported, { found: unsupported.found });
  if (ready === undefined) return "";
  if (ready.report.length === 0) return en.importMermaid.nothingChanged;
  const count = (category: ReportCategory): string => String(ready.report.filter((entry) => entry.category === category).length);
  return fill(en.importMermaid.counts, { dropped: count("dropped"), approximated: count("approximated"), ignored: count("ignored") });
}

/** The counts the Import button describes itself with, from the report's data, whether or not the report is shown (FR-006). */
function describedCounts(ready: Extract<Outcome, { kind: "ready" }> | undefined): string {
  if (ready === undefined) return "";
  const count = (category: ReportCategory): string => String(ready.report.filter((entry) => entry.category === category).length);
  return fill(en.importMermaid.describedCounts, { dropped: count("dropped"), approximated: count("approximated") });
}

/** The status region's words: the hint for an empty text, "Checking…" while a text is read, else the outcome's words. */
function statusFor(
  text: string,
  checking: boolean,
  saveProblem: string | undefined,
  ready: Extract<Outcome, { kind: "ready" }> | undefined,
  invalid: Extract<Outcome, { kind: "invalid" }> | undefined,
  unsupported: Extract<Outcome, { kind: "unsupported" }> | undefined,
  refused: Extract<Outcome, { kind: "refused" }> | undefined,
  fileProblem: string | undefined,
): string {
  if (saveProblem === undefined && text.trim() === "") return en.importMermaid.hint;
  if (saveProblem === undefined && checking) return en.importMermaid.checking;
  if (fileProblem !== undefined && saveProblem === undefined) return fileProblem;
  return statusText(ready, invalid, unsupported, refused, saveProblem);
}

/** The New from Mermaid dialog. Nothing is created here: Import hands the confirmed diagram to the route. */
export function ImportDialog({
  open,
  onClose,
  deps,
  onImport,
  loadText,
}: {
  readonly open: boolean;
  /** Text handed in from outside, such as a dropped file: loaded into the paste area each time it changes (FR-002). */
  readonly loadText?: { readonly at: number; readonly text?: string; readonly problem?: string } | undefined;
  readonly onClose: () => void;
  /** Creates the diagram the developer confirmed; the route saves it and opens it (contracts/import-dialog.md). */
  readonly onImport: (ready: Extract<Outcome, { kind: "ready" }>) => Promise<string | undefined>;
  /** The Mermaid readers, supplied by the route so the rendering layer does not import the editor. */
  readonly deps: ReadDeps;
}) {
  const [text, setText] = useState("");
  // The name the developer typed; until they type one it is the document's name (contracts/import-dialog.md).
  const [typedName, setTypedName] = useState<string | undefined>();
  // The reason the last Import failed, shown until the text or name changes (T048).
  const [saveProblem, setSaveProblem] = useState<string | undefined>();
  // The reason a chosen or dropped file was not loaded, shown until the text changes (EC-08).
  const [fileProblem, setFileProblem] = useState<string | undefined>();
  // The file handed in last time: each new hand-in is applied once, and the text the developer has is kept when it is refused.
  const [appliedAt, setAppliedAt] = useState<number | undefined>();
  // The report line the developer activated, and a counter so activating the same entry again still selects it.
  const [selectLine, setSelectLine] = useState<{ line: number; at: number } | undefined>();
  const [reportShown, setReportShown] = useState(true);
  // The compare view is opened by its toggle; it is off until the developer asks for it (FR-010).
  const [compareShown, setCompareShown] = useState(false);
  const { outcome, checking } = useImport(text, deps);
  const pasteRef = useRef<HTMLTextAreaElement | null>(null);
  // A text handed in from outside replaces the paste area's text, as pasted text would (FR-002).
  // A chosen or dropped file goes through the same reader; its text replaces the paste area's, or its reason is shown (EC-08).
  const applyFile = (read: FileRead): void => {
    if (read.ok) {
      setText(read.text);
      setTypedName(undefined);
      setSaveProblem(undefined);
      setFileProblem(undefined);
    } else {
      setFileProblem(read.problem);
    }
  };
  if (loadText !== undefined && loadText.at !== appliedAt) {
    setAppliedAt(loadText.at);
    if (loadText.text !== undefined) applyFile({ ok: true, text: loadText.text });
    else if (loadText.problem !== undefined) applyFile({ ok: false, problem: loadText.problem });
  }
  // Focus goes to the paste area each time the dialog opens (contracts/import-dialog.md, Focus).
  useEffect(() => {
    if (open) {
      // Mermaid starts loading as the dialog opens, so the first picture is not held up by the load (SC-005).
      preloadMermaid();
      requestAnimationFrame(() => pasteRef.current?.focus());
    }
  }, [open]);
  const ready = outcome?.kind === "ready" ? outcome : undefined;
  const invalid = outcome?.kind === "invalid" ? outcome : undefined;
  const unsupported = outcome?.kind === "unsupported" ? outcome : undefined;
  const refused = outcome?.kind === "refused" ? outcome : undefined;
  // The line the error names, as the developer sees it in the text (FR-005).
  const invalidLine = invalid === undefined ? undefined : (text.split("\n").at(invalid.line - 1) ?? "");
  const name = typedName ?? ready?.name ?? "";
  const nameFilled = name.trim() !== "";
  const source = ready ? generate(ready.diagram).source : undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="import-title">
      <DialogTitle id="import-title">{en.importMermaid.title}</DialogTitle>
      <DialogContent>
        <PasteArea
          value={text}
          onChange={(next) => {
            setText(next);
            setTypedName(undefined);
            setSaveProblem(undefined);
            setFileProblem(undefined);
          }}
          inputRef={pasteRef}
          selectLine={selectLine}
        />
        {/* Focus order (contracts/import-dialog.md): text area, Choose file…, report entries, Compare, name, Cancel, Import. */}
        <Box sx={{ mt: 1 }}>
          <Button component="label">
            {en.importMermaid.chooseFile}
            <input
              type="file"
              hidden
              accept=".mmd,.md,.txt,text/plain,text/markdown"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file !== undefined) void readTextFile(file).then(applyFile);
              }}
            />
          </Button>
        </Box>
        {invalidLine !== undefined && (
          <Box data-testid="error-line" sx={{ mt: 1, p: 1, border: 2, borderColor: "error.main", borderRadius: 1, fontFamily: "monospace", overflowWrap: "anywhere" }}>
            <span>{invalidLine}</span> <strong>{en.importMermaid.errorHere}</strong>
          </Box>
        )}
        {ready && (
          <Typography data-testid="detected-type" sx={{ mt: 2 }}>
            {detectedLabel(ready.diagram)}
          </Typography>
        )}
        {/* One polite live region announces the report's counts and any save failure, without moving focus (FR-013). */}
        <Typography role="status" aria-label={en.importMermaid.statusRegion} aria-live="polite" color={saveProblem === undefined ? "text.primary" : "error"} sx={{ mt: 2 }}>
          {statusFor(text, checking, saveProblem, ready, invalid, unsupported, refused, fileProblem)}
        </Typography>
        {source !== undefined && (
          <Box data-testid="picture-wrap" sx={{ opacity: checking ? 0.5 : 1 }}>
            <ImportPicture source={source} />
          </Box>
        )}
        {ready && (
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              setReportShown(!reportShown);
            }}
          >
            {reportShown ? en.importMermaid.hideReport : en.importMermaid.showReport}
          </Button>
        )}
        {ready && reportShown && (
          <ImportReport
            entries={ready.report}
            onSelect={(line) => {
              setSelectLine({ line, at: Date.now() });
            }}
          />
        )}
        {ready && (
          <Button
            size="small"
            sx={{ mt: 1 }}
            aria-pressed={compareShown}
            onClick={() => {
              setCompareShown(!compareShown);
            }}
          >
            {en.importMermaid.compareToggle}
          </Button>
        )}
        {source !== undefined && compareShown && (
          <CompareView original={text} generated={source} dropped={new Set(ready?.report.filter((entry) => entry.category === "dropped").map((entry) => entry.line))} />
        )}
        {ready && (
          <TextField
            sx={{ mt: 2 }}
            fullWidth
            label={en.importMermaid.name}
            value={name}
            onChange={(event) => {
              setTypedName(event.target.value);
            }}
            error={!nameFilled}
            helperText={nameFilled ? undefined : en.importMermaid.nameRequired}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{en.importMermaid.cancel}</Button>
        <span id="import-description" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {describedCounts(ready)}
        </span>
        <Button
          variant="contained"
          aria-describedby="import-description"
          disabled={ready === undefined || !nameFilled}
          onClick={() => {
            if (ready && nameFilled) {
              void onImport({ ...ready, name: name.trim() }).then((problem) => {
                setSaveProblem(problem);
              });
            }
          }}
        >
          {en.importMermaid.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
