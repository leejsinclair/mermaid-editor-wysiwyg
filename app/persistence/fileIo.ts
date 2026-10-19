import type { Diagram } from "../model/types";
import { toFile } from "./codec";
import { safeFileName } from "./fileName";

/**
 * Offers the diagram as a download in the editor's file format (contracts/file-format.md, Save). The browser decides
 * where the file goes; nothing is stored by this call.
 */
export function downloadFile(diagram: Diagram): void {
  const blob = new Blob([JSON.stringify(toFile(diagram), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeFileName(diagram.name);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
