import { MAX_FILE_BYTES } from "../../model/limits";
import { en } from "../../text/en";

// Reads a chosen or dropped file as text (FR-002, EC-08). A file that is not text, or is over the size limit, is not
// loaded: the reason is returned, and the text the developer has is left as it is.

export type FileRead = { readonly ok: true; readonly text: string } | { readonly ok: false; readonly problem: string };

/** The text of a file, decoded as UTF-8, or the reason it was not loaded. */
export async function readTextFile(file: File): Promise<FileRead> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, problem: en.importMermaid.fileTooLarge };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.includes(0)) return { ok: false, problem: en.importMermaid.fileNotText };
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, problem: en.importMermaid.fileNotText };
  }
}
