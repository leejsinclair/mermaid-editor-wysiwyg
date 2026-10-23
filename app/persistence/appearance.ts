// The appearance the user chose, kept in the browser's local storage (spec 007, FR-026). It is a preference of this browser,
// never part of a diagram, a saved file or copied output. What is read back is untrusted: anything but "light" is Blueprint
// Studio, and a storage that refuses is never an error.

/** The same two names as the rendering layer's appearance: persistence may not import that layer, so the union is written here too. */
export type Appearance = "blueprint" | "light";

export type AppearanceStorage = Pick<Storage, "getItem" | "setItem">;

const KEY = "mermaid-editor.appearance";

export function parseAppearance(stored: unknown): Appearance {
  return stored === "light" ? "light" : "blueprint";
}

/** The browser's local storage, or nothing where there is none (a worker, a blocked page, a test without a browser). */
function browserStorage(): AppearanceStorage | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function readAppearance(storage: AppearanceStorage | undefined = browserStorage()): Appearance {
  try {
    return parseAppearance(storage?.getItem(KEY));
  } catch {
    return "blueprint";
  }
}

/** Keeps the choice for the next visit. Reports whether it was kept: a storage that refuses is not an error, but the user is told. */
export function writeAppearance(appearance: Appearance, storage: AppearanceStorage | undefined = browserStorage()): boolean {
  if (storage === undefined) return false;
  try {
    storage.setItem(KEY, appearance);
    return true;
  } catch {
    return false;
  }
}
