/** Replaces each `{name}` in a catalogue sentence with its value; an unknown name is left as written. */
export function fill(template: string, values: Readonly<Record<string, string>>): string {
  const byName = new Map(Object.entries(values));
  return template.replace(/\{(\w+)\}/g, (match, name: string) => byName.get(name) ?? match);
}
