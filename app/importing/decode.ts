/** The decoded text of one label, and whether HTML tags were stripped from it (the caller reports that as dropped). */
export interface DecodedLabel {
  readonly text: string;
  readonly stripped: boolean;
}

const PLACEHOLDER_NUMERIC = /ﬂ°°(\d+)¶ß/g;
const PLACEHOLDER_NAMED = /ﬂ°([A-Za-z]+)¶ß/g;
const LINE_BREAK = /<br\s*\/?>/gi;
const TAG = /<[^<>]+>/g;
const ENTITY = /&(\w+|#\w+);/g;

const NAMED: ReadonlyMap<string, string> = new Map([
  ["quot", '"'],
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["apos", "'"],
  ["nbsp", " "],
]);

function decodeEntity(name: string): string {
  if (name.startsWith("#x")) return String.fromCodePoint(parseInt(name.slice(2), 16));
  if (name.startsWith("#")) return String.fromCodePoint(Number(name.slice(1)));
  return NAMED.get(name) ?? `&${name};`;
}

/**
 * Turns one label as Mermaid read it into the text the editor would have typed (EC-03, EC-12).
 * Line breaks become newlines; other HTML tags are removed with their text kept and reported through `stripped`.
 * Entities are decoded last, so an escaped `&lt;b&gt;` stays as text.
 */
export function decodeLabel(text: string): DecodedLabel {
  const withoutBreaks = text.replace(LINE_BREAK, "\n");
  const stripped = TAG.test(withoutBreaks);
  TAG.lastIndex = 0;
  const withoutTags = withoutBreaks.replace(TAG, "");
  const decoded = withoutTags
    .replace(PLACEHOLDER_NUMERIC, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(PLACEHOLDER_NAMED, (match, name: string) => NAMED.get(name) ?? match)
    .replace(ENTITY, (_match, name: string) => decodeEntity(name));
  // A label that is only tags would be empty, which is not a label: its typed text is kept, so it shows as text (EC-12).
  if (stripped && decoded.trim() === "" && withoutBreaks.trim() !== "") return { text: withoutBreaks, stripped };
  return { text: decoded, stripped };
}

/**
 * Only Mermaid's placeholders and `<br>` are decoded: the reading the generation fidelity tests rely on (research R8).
 * Raw `&...;` text stays as it is, because a label the developer typed may contain it literally.
 */
export function decodePlaceholders(text: string): string {
  return text
    .replace(LINE_BREAK, "\n")
    .replace(PLACEHOLDER_NUMERIC, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(PLACEHOLDER_NAMED, (match, name: string) => NAMED.get(name) ?? match);
}

const SOURCE_ESCAPE = /#(?:(\d+)|([A-Za-z]+));/g;

/**
 * Turns text read straight from Mermaid source, as the C4 reader reads it, into the text the editor would have typed
 * (FR-001, research R1). Mermaid's own `#<n>;` and `#<name>;` escapes are replaced in one pass, so the replaced text is not
 * read again: `#35;38#59;` is `#38;`, as typed. Then `<br>` becomes a line break and entities are decoded. Other tags
 * are kept as text, since the C4 import has no report entry for removing them (DC-01).
 */
export function decodeSourceText(text: string): string {
  return text
    .replace(SOURCE_ESCAPE, (match, code: string | undefined, name: string | undefined) => {
      if (code !== undefined) return String.fromCodePoint(Number(code));
      return NAMED.get(name ?? "") ?? match;
    })
    .replace(LINE_BREAK, "\n")
    .replace(ENTITY, (_match, name: string) => decodeEntity(name));
}
