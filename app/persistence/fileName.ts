export const FILE_EXTENSION = ".mermaid-editor.json";

const MAX_NAME_CHARACTERS = 100;
const SAFE = /[\p{L}\p{N} _.-]/u;

/**
 * The file name offered for a diagram (contracts/file-format.md, Save): letters, digits, space, `-`, `_` and `.`
 * are kept, every other character becomes `_`, the name is trimmed and cut to 100 characters, and `diagram` stands
 * in when nothing remains.
 */
export function safeFileName(name: string): string {
  const replaced = Array.from(name, (character) => (SAFE.test(character) ? character : "_")).join("").trim();
  const cut = Array.from(replaced).slice(0, MAX_NAME_CHARACTERS).join("").trim();
  return `${cut === "" ? "diagram" : cut}${FILE_EXTENSION}`;
}
