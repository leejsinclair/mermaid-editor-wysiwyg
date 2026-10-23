import { describe, expect, it } from "vitest";
import { parseAppearance, readAppearance, writeAppearance } from "./appearance";

// VO-013 (FR-026): `"light"` gives Light and everything else Blueprint Studio; reading and writing never throw, and a failed
// write is reported as not saved.

const KEY = "mermaid-editor.appearance";

function storageWith(initial: Readonly<Record<string, string>> = {}) {
  const held = new Map(Object.entries(initial));
  return {
    held,
    getItem: (key: string): string | null => held.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      held.set(key, value);
    },
  };
}

const refusing = {
  getItem: (): string | null => {
    throw new Error("storage is blocked");
  },
  setItem: (): void => {
    throw new Error("storage is full");
  },
};

describe("the stored appearance", () => {
  it("is Light for the stored value light and Blueprint Studio for every other value", () => {
    expect(parseAppearance("light")).toBe("light");
    expect(parseAppearance("blueprint")).toBe("blueprint");
    for (const other of [null, undefined, "", "dark", "Light", 42, {}, ["light"]]) expect(parseAppearance(other)).toBe("blueprint");
  });

  it("is read from the stored entry, and is Blueprint Studio when nothing is stored", () => {
    expect(readAppearance(storageWith({ [KEY]: "light" }))).toBe("light");
    expect(readAppearance(storageWith({ [KEY]: "sepia" }))).toBe("blueprint");
    expect(readAppearance(storageWith())).toBe("blueprint");
  });

  it("is Blueprint Studio, without an error, when storage refuses a read", () => {
    expect(readAppearance(refusing)).toBe("blueprint");
  });

  it("is stored under its own key, and the write reports that it was saved", () => {
    const storage = storageWith();
    expect(writeAppearance("light", storage)).toBe(true);
    expect(storage.held.get(KEY)).toBe("light");
    expect(writeAppearance("blueprint", storage)).toBe(true);
    expect(storage.held.get(KEY)).toBe("blueprint");
  });

  it("reports that it was not saved, without an error, when storage refuses a write", () => {
    expect(writeAppearance("light", refusing)).toBe(false);
  });

  it("copes when there is no storage at all", () => {
    expect(readAppearance()).toBe("blueprint");
    expect(writeAppearance("light")).toBe(false);
  });
});
