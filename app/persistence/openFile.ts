import { parseFile, type ParsedFile } from "./codec";
import { en } from "../text/en";

/** Larger than this is not a diagram file from this editor (DC-05). */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Opens a chosen file: the size is checked before the contents are read (contracts/file-format.md, Open 1). */
export async function openFile(file: { readonly size: number; text(): Promise<string> }): Promise<ParsedFile> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: "fileTooLarge", message: en.fileRefusals.fileTooLarge };
  let text: string;
  try {
    text = await file.text();
  } catch {
    // A file the browser cannot read is not a diagram file.
    return parseFile("");
  }
  return parseFile(text);
}
