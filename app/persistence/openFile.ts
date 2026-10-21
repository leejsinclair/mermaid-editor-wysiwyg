import { parseFile, type ParsedFile } from "./codec";
import { en } from "../text/en";

export { MAX_FILE_BYTES } from "../model/limits";
import { MAX_FILE_BYTES } from "../model/limits";

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
