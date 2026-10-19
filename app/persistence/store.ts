import type { DiagramRecord } from "./codec";

// Browser storage over IndexedDB: database `mermaid-editor`, store `diagrams`, key `id` (contracts/file-format.md).

const DATABASE = "mermaid-editor";
const STORE = "diagrams";

/** The database cannot be opened at all: storage is disabled, blocked or unavailable in this browser. */
export class StorageUnavailableError extends Error {}

let opening: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = indexedDB.open(DATABASE, 1);
      request.addEventListener("upgradeneeded", () => {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      });
      request.addEventListener("success", () => {
        resolve(request.result);
      });
      request.addEventListener("error", () => {
        reject(new StorageUnavailableError(request.error?.message ?? "Storage could not be opened"));
      });
      request.addEventListener("blocked", () => {
        reject(new StorageUnavailableError("Storage is blocked by another tab"));
      });
    } catch (error) {
      reject(new StorageUnavailableError(error instanceof Error ? error.message : "Storage is unavailable"));
    }
  }).catch((error: unknown) => {
    // A later attempt may succeed (for example once storage is enabled), so a failure is not remembered.
    opening = undefined;
    throw error;
  });
  return opening;
}

/** Runs one transaction and settles when it has completed, failed or been aborted. */
async function transact<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    try {
      const transaction = database.transaction(STORE, mode);
      const request = work(transaction.objectStore(STORE));
      transaction.addEventListener("complete", () => {
        resolve(request.result);
      });
      const fail = () => {
        reject(transaction.error ?? request.error ?? new Error("The transaction failed"));
      };
      transaction.addEventListener("error", fail);
      transaction.addEventListener("abort", fail);
    } catch (error) {
      reject(error instanceof Error ? error : new Error("The transaction failed"));
    }
  });
}

/** Another tab has taken over the diagram, so this write is refused (contracts/file-format.md, Browser storage). */
export class OwnerChangedError extends Error {}

/**
 * Reads one record and, in the same transaction, writes what `decide` returns for it (nothing when it returns
 * undefined). A throw from `decide` or from the write aborts the transaction, so nothing is half done.
 */
function readThenWrite(id: string, decide: (existing: unknown) => DiagramRecord | undefined): Promise<void> {
  return openDatabase().then(
    (database) =>
      new Promise<void>((resolve, reject) => {
        try {
          const transaction = database.transaction(STORE, "readwrite");
          const store = transaction.objectStore(STORE);
          const read = store.get(id);
          read.addEventListener("success", () => {
            try {
              const next = decide(read.result);
              if (next !== undefined) store.put(next);
            } catch (error) {
              transaction.abort();
              reject(error instanceof Error ? error : new Error("The write failed"));
            }
          });
          transaction.addEventListener("complete", () => {
            resolve();
          });
          const fail = () => {
            reject(transaction.error ?? new Error("The transaction failed"));
          };
          transaction.addEventListener("error", fail);
          transaction.addEventListener("abort", fail);
        } catch (error) {
          reject(error instanceof Error ? error : new Error("The transaction failed"));
        }
      }),
  );
}

const ownerOfRecord = (record: unknown): unknown => (typeof record === "object" && record !== null ? (record as { owner?: unknown }).owner : undefined);

/**
 * Writes one record in one transaction; resolves only once the transaction has completed. When the stored record
 * names a different owner, the write is refused: another tab has taken the diagram over.
 */
export function putRecord(record: DiagramRecord, owner: string): Promise<void> {
  return readThenWrite(record.id, (existing) => {
    const current = ownerOfRecord(existing);
    if (typeof current === "string" && current !== owner) throw new OwnerChangedError("Another tab is editing this diagram");
    return { ...record, owner };
  });
}

/** Marks `owner` as the editor of a stored diagram, in one transaction. A diagram not stored yet has nothing to mark. */
export function claimRecord(id: string, owner: string): Promise<void> {
  return readThenWrite(id, (existing) => (existing === undefined ? undefined : { ...(existing as DiagramRecord), owner }));
}

export function getRecord(id: string): Promise<unknown> {
  return transact<unknown>("readonly", (store) => store.get(id));
}

/** Every stored record as read; records are not trusted until they have been migrated and checked. */
export function listRecords(): Promise<unknown[]> {
  return transact<unknown[]>("readonly", (store) => store.getAll());
}

export async function removeRecord(id: string): Promise<void> {
  await transact("readwrite", (store) => store.delete(id));
}
