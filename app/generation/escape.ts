// One escaping scheme for every label-like field in every diagram type (research R2, contracts/mermaid-output.md).
// Mermaid replaces `#<decimal>;` entities before lexing in every diagram type and decodes them when it draws.

const SPECIAL = new Set(Array.from("#\"<>&;%$\\`{}[]()|,:'*_~=-/"));
const WHITE_SPACE = /\s/u;
// CRLF, CR, LF and the Unicode line and paragraph separators (U+2028, U+2029).
const LINE_BREAK = /\r\n|[\r\n\p{Zl}\p{Zp}]/u;

const entity = (character: string) => `#${String(character.codePointAt(0))};`;

function escapeLine(line: string): string {
  const characters = Array.from(line);
  let start = 0;
  while (start < characters.length && WHITE_SPACE.test(characters.at(start) ?? "")) start += 1;
  let end = characters.length;
  while (end > start && WHITE_SPACE.test(characters.at(end - 1) ?? "")) end -= 1;
  return characters
    .map((character, index) => (index < start || index >= end || SPECIAL.has(character) ? entity(character) : character))
    .join("");
}

/**
 * Escapes text for a Mermaid label: line breaks of every kind become `<br/>`, each character that could break the
 * source becomes a decimal entity, and white space at either end of a line is kept as entities. Escaping then
 * decoding returns the original text (SC-003).
 */
export function escapeLabel(text: string): string {
  return text.split(LINE_BREAK).map(escapeLine).join("<br/>");
}
