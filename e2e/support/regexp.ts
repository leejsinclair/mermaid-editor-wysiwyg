/** Text that matches itself only: a label with `(` or `.` in it is not a pattern. */
const escapeRegExp = (text: string): string => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** A pattern for exactly this text. */
// eslint-disable-next-line security/detect-non-literal-regexp -- the text is escaped
export const exactly = (text: string): RegExp => new RegExp(`^${escapeRegExp(text)}$`);

/** A pattern for text that starts with this text. */
// eslint-disable-next-line security/detect-non-literal-regexp -- the text is escaped
export const startingWith = (text: string): RegExp => new RegExp(`^${escapeRegExp(text)}`);
