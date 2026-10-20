/** Objects made for items and kept while the facts they were made from stay the same. */
export type Stable<T> = Map<string, { readonly key: readonly unknown[]; readonly value: T }>;

/**
 * The object made for `id` from `key`, made again only when a fact in `key` has changed. React Flow treats a new object as a
 * new node or edge and measures it again; handing it the same one keeps what it knows and keeps the drawing steady.
 */
export function stableFor<T>(cache: Stable<T>, id: string, key: readonly unknown[], make: () => T): T {
  const cached = cache.get(id);
  if (cached?.key.length === key.length && cached.key.every((fact, index) => Object.is(fact, key[index]))) return cached.value;
  const value = make();
  cache.set(id, { key, value });
  return value;
}

/** Forgets the objects of items that are gone. */
export function keepOnly<T>(cache: Stable<T>, ids: ReadonlySet<string>): void {
  for (const id of cache.keys()) if (!ids.has(id)) cache.delete(id);
}
