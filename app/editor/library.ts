import type { C4Kind, Diagram, DiagramType } from "../model/types";
import { fromRecord, toRecord } from "../persistence/codec";
import { downloadFile } from "../persistence/fileIo";
import { openFile } from "../persistence/openFile";
import { heldDiagramIds, holdDiagramLock, onLockLost, ownerOf, takeDiagramLock } from "../persistence/lock";
import { claimRecord, getRecord, listRecords, putRecord, removeRecord } from "../persistence/store";

/** Other tabs hear that the saved diagrams or who is editing them changed, so an open start screen can refresh. */
const changes = typeof BroadcastChannel === "undefined" ? undefined : new BroadcastChannel("mermaid-editor-library");

function announceChange(): void {
  changes?.postMessage("changed");
}

/** Calls `listener` when another tab changes the library; returns how to stop. */
export function onLibraryChanged(listener: () => void): () => void {
  const channel = typeof BroadcastChannel === "undefined" ? undefined : new BroadcastChannel("mermaid-editor-library");
  channel?.addEventListener("message", listener);
  return () => {
    channel?.close();
  };
}

/** Writes a diagram as the saved version, stamping the time it was changed. */
export async function saveDiagram(diagram: Diagram): Promise<void> {
  await putRecord(toRecord({ ...diagram, changedAt: new Date().toISOString() }), ownerOf(diagram.id));
  announceChange();
}

/** What the start screen shows for one saved diagram: readable ones open, unreadable ones can only be deleted. */
export type LibraryEntry =
  | {
      readonly readable: true;
      readonly id: string;
      readonly name: string;
      readonly type: DiagramType;
      readonly kind?: C4Kind;
      readonly changedAt: string;
    }
  | { readonly readable: false; readonly id: string; readonly name: string; readonly changedAt: string; readonly problem: string };

const text = (value: unknown): string | undefined => (typeof value === "string" && value !== "" ? value : undefined);

function entryOf(record: unknown): LibraryEntry | undefined {
  const read = fromRecord(record);
  if (read.ok) {
    const { diagram } = read;
    return {
      readable: true,
      id: diagram.id,
      name: diagram.name,
      type: diagram.type,
      ...(diagram.type === "c4" && { kind: diagram.kind }),
      changedAt: diagram.changedAt,
    };
  }
  const fields = typeof record === "object" && record !== null ? (record as Record<string, unknown>) : {};
  const id = text(fields.id);
  // A record without an id cannot be told apart or deleted, so there is nothing to show for it.
  return id === undefined ? undefined : { readable: false, id, name: text(fields.name) ?? id, changedAt: text(fields.changedAt) ?? "", problem: read.problem };
}

/** Saved diagrams, most recently changed first; records that cannot be read are listed too. */
export async function listDiagrams(): Promise<LibraryEntry[]> {
  const entries = (await listRecords()).map(entryOf).filter((entry): entry is LibraryEntry => entry !== undefined);
  return entries.sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}

/** The outcome of opening a saved diagram by its id. */
export type Loaded =
  | { readonly kind: "ok"; readonly diagram: Diagram }
  | { readonly kind: "missing" }
  | { readonly kind: "unreadable"; readonly problem: string };

/** Reads one saved diagram; the editor opens it with an empty history. */
export async function loadDiagram(id: string): Promise<Loaded> {
  const record = await getRecord(id);
  if (record === undefined) return { kind: "missing" };
  const read = fromRecord(record);
  return read.ok ? { kind: "ok", diagram: read.diagram } : { kind: "unreadable", problem: read.problem };
}

/** Ids of diagrams that are open for editing in some tab of this browser. */
export const lockedDiagramIds = heldDiagramIds;

/** Marks this tab as the diagram's editor in storage; storage that cannot be reached leaves the claim as it is. */
async function markOwner(id: string): Promise<void> {
  try {
    await claimRecord(id, ownerOf(id));
  } catch {
    // Without storage there is nothing to protect; the status line already says so.
  }
}

/** Claims the right to edit a diagram in this tab; false when another tab holds it. */
export async function claimDiagram(id: string): Promise<boolean> {
  const claimed = await holdDiagramLock(id);
  if (claimed) await markOwner(id);
  announceChange();
  return claimed;
}

/** Tells the caller when another tab takes this tab's diagram away. */
export const whenTaken = onLockLost;

/** Takes a diagram from the tab that has it and reads its latest saved version. */
export async function takeDiagram(id: string): Promise<Loaded> {
  await takeDiagramLock(id);
  await markOwner(id);
  announceChange();
  return loadDiagram(id);
}

/** Deletes one saved diagram for good; refused while a tab has it open. */
export async function removeDiagram(id: string): Promise<boolean> {
  if ((await heldDiagramIds()).has(id)) return false;
  await removeRecord(id);
  announceChange();
  return true;
}

/** Offers a diagram as a downloaded file. */
export const offerFile = downloadFile;

/** The outcome of opening a chosen file: a new saved diagram, or the reason nothing was opened. */
export type Imported = { readonly ok: true; readonly id: string } | { readonly ok: false; readonly message: string };

/** Adds the diagram in a file as a new saved diagram with its own id; no existing record is touched (FR-048). */
export async function importFile(file: { readonly size: number; text(): Promise<string> }): Promise<Imported> {
  const parsed = await openFile(file);
  if (!parsed.ok) return { ok: false, message: parsed.message };
  const diagram = { ...parsed.model, id: crypto.randomUUID(), changedAt: new Date().toISOString() } as Diagram;
  await putRecord(toRecord(diagram), ownerOf(diagram.id));
  return { ok: true, id: diagram.id };
}

/**
 * Saves an imported diagram as a new saved diagram with its own id and the name the developer chose (FR-011). Nothing
 * else is touched. A storage failure rejects with its reason, and nothing is created (VO-036).
 */
export async function createImported(diagram: Diagram, name: string): Promise<string> {
  const id = crypto.randomUUID();
  const saved = { ...diagram, id, name, changedAt: new Date().toISOString() } as Diagram;
  await putRecord(toRecord(saved), ownerOf(id));
  announceChange();
  return id;
}
