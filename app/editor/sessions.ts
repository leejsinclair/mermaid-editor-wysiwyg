import type { EditorState } from "./reducer";
import type { SaveStatus } from "./saveStatus";

/**
 * Editing sessions kept outside route components, keyed by diagram id: history, selection, draft and save status
 * survive the route change from /new/... to /d/:id (data-model.md, Session state). A session lives until the page
 * is closed; reloading starts from what was saved, with empty history.
 */
export interface Session {
  readonly state: EditorState;
  readonly saveStatus: SaveStatus;
}

const sessions = new Map<string, Session>();

export function recallSession(id: string): Session | undefined {
  return sessions.get(id);
}

/** Drops a diagram's session, so it is read afresh from storage (after another tab has edited it). */
export function forgetSession(id: string): void {
  sessions.delete(id);
}

export function rememberSession(id: string, session: Session): void {
  sessions.set(id, session);
}
