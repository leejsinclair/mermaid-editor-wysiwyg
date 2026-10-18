/**
 * "Visible" means the text holds at least one character that is not white space, a line break or an invisible
 * format character such as U+200B (FR-006, EC-04).
 */
export function isVisible(text: string): boolean {
  return /[^\s\p{Cf}]/u.test(text);
}
