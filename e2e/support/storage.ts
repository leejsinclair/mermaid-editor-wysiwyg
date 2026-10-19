import type { Page } from "@playwright/test";

/** Makes `indexedDB.open` fail, as when browser storage is disabled or unavailable (VO-085). */
export async function breakStorageOpen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    indexedDB.open = () => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    };
  });
}

/** Makes every `put` into an object store raise `QuotaExceededError`, as when storage is full (VO-085). */
export async function fillStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = () => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    };
  });
}

/**
 * Delays the `complete` event of every IndexedDB transaction by `window.__idbDelay` milliseconds (0 until set), so
 * a test can see what the editor shows while a write is still in flight (VO-073).
 */
export async function delayStorageCompletion(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- always called with the transaction as `this`
    const original = IDBTransaction.prototype.addEventListener;
    IDBTransaction.prototype.addEventListener = function (this: IDBTransaction, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      if (type !== "complete") {
        original.call(this, type, listener, options);
        return;
      }
      const delayed = (event: Event) => {
        const wait = (window as unknown as { __idbDelay?: number }).__idbDelay ?? 0;
        setTimeout(() => {
          if (typeof listener === "function") listener.call(this, event);
          else listener.handleEvent(event);
        }, wait);
      };
      original.call(this, type, delayed, options);
    } as typeof IDBTransaction.prototype.addEventListener;
  });
}

/** Sets how long the next transactions' `complete` events are delayed; needs {@link delayStorageCompletion}. */
export async function setStorageDelay(page: Page, milliseconds: number): Promise<void> {
  await page.evaluate((wait) => {
    (window as unknown as { __idbDelay?: number }).__idbDelay = wait;
  }, milliseconds);
}

/** A stored record as the editor writes it, with an empty diagram of the given type. */
export function savedRecord(
  id: string,
  name: string,
  type: "flowchart" | "sequence" | "c4",
  changedAt: string,
  kind?: "context" | "container" | "component" | "dynamic" | "deployment",
): Record<string, unknown> {
  const contents = {
    flowchart: { nodes: [], connections: [] },
    sequence: { participants: [], messages: [] },
    c4: { tree: [], relationships: [] },
  };
  const content = contents[type];
  const model = { name, type, nextId: 1, ...(type === "c4" ? { kind: kind ?? "context", title: "" } : {}), content };
  return { id, name, type, ...(type === "c4" ? { kind: kind ?? "context" } : {}), changedAt, formatVersion: 1, model };
}

/** Writes records straight into the editor's IndexedDB store, as if the editor had saved them earlier. */
export async function seedRecords(page: Page, records: readonly unknown[]): Promise<void> {
  await page.evaluate(async (items) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open("mermaid-editor", 1);
      open.onupgradeneeded = () => {
        open.result.createObjectStore("diagrams", { keyPath: "id" });
      };
      open.onerror = () => {
        reject(new Error("The database could not be opened"));
      };
      open.onsuccess = () => {
        resolve(open.result);
      };
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("diagrams", "readwrite");
      for (const item of items) transaction.objectStore("diagrams").put(item);
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(new Error("The records could not be written"));
      };
    });
    database.close();
  }, records);
}

/** Records every text the save status shows from now on, so a test can prove "Saved" never appeared. */
export async function recordSaveStatuses(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __statuses: string[] }).__statuses = seen;
    const note = () => {
      const text = document.querySelector('[aria-label="Save status"]')?.textContent;
      if (text && seen.at(-1) !== text) seen.push(text);
    };
    new MutationObserver(note).observe(document, { subtree: true, childList: true, characterData: true });
  });
}

/** Every distinct text the save status has shown since {@link recordSaveStatuses} was set up. */
export async function savedStatuses(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __statuses: string[] }).__statuses);
}
