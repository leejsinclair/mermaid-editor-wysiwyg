// One editing tab per diagram, enforced with Web Locks named `diagram:<id>` (contracts/file-format.md, Browser storage).
// The browser releases a lock when its page closes or crashes, so nothing here has to release it (EC-14).

const PREFIX = "diagram:";

/** Identifies this page; with the epoch it forms the owner token written into the diagram's record. */
const TAB = crypto.randomUUID();

/** Diagrams this page holds the lock for. */
const held = new Set<string>();
/** Counts each time this page has taken a diagram's lock, so a token from an earlier turn can never match again. */
const epochs = new Map<string, number>();
/** Requests for the lock still waiting for an answer, so asking twice at once (a remount) is one question. */
const asking = new Map<string, Promise<boolean>>();
const lostListeners = new Map<string, Set<() => void>>();

/** The token that marks this page's current turn as the editor of a diagram. */
export function ownerOf(id: string): string {
  return `${TAB}:${String(epochs.get(id) ?? 0)}`;
}

/** Tells `listener` when another tab takes the diagram's lock from this page; returns how to stop listening. */
export function onLockLost(id: string, listener: () => void): () => void {
  const listeners = lostListeners.get(id) ?? new Set<() => void>();
  listeners.add(listener);
  lostListeners.set(id, listeners);
  return () => {
    listeners.delete(listener);
  };
}

function lose(id: string): void {
  held.delete(id);
  for (const listener of lostListeners.get(id) ?? []) listener();
}

/** Asks for the lock and resolves whether this page now holds it; the lock is kept for the life of the page. */
function request(id: string, how: { readonly ifAvailable: true } | { readonly steal: true }): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    navigator.locks
      .request(`${PREFIX}${id}`, how, (lock) => {
        if (lock === null) {
          resolve(false);
          return undefined;
        }
        held.add(id);
        epochs.set(id, (epochs.get(id) ?? 0) + 1);
        resolve(true);
        // Never settles: the lock stays until the page goes away or another tab steals it.
        return new Promise<void>(() => undefined);
      })
      .catch(() => {
        // A steal aborts the holder's request; that is how this page learns it has lost the diagram.
        lose(id);
      });
  });
}

/** Takes the diagram's lock if nobody holds it; resolves true when this page holds it, false when another tab does. */
export function holdDiagramLock(id: string): Promise<boolean> {
  if (held.has(id)) return Promise.resolve(true);
  const pending = asking.get(id) ?? request(id, { ifAvailable: true });
  asking.set(id, pending);
  return pending.finally(() => {
    asking.delete(id);
  });
}

/** Takes the lock from whichever tab holds it. */
export async function takeDiagramLock(id: string): Promise<void> {
  await request(id, { steal: true });
}

/** The ids of diagrams whose lock any tab of this browser holds right now. */
export async function heldDiagramIds(): Promise<ReadonlySet<string>> {
  const snapshot = await navigator.locks.query();
  const ids = (snapshot.held ?? []).flatMap((lock) => (lock.name?.startsWith(PREFIX) ? [lock.name.slice(PREFIX.length)] : []));
  return new Set(ids);
}
