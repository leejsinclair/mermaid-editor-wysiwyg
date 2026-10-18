import type { FeedbackMessage } from "../rendering/shared/Feedback";
import { en } from "../text/en";
import { fill } from "../text/fill";
import type { SourceStatus } from "./sourceCheck";

function writeToClipboard(text: string): Promise<void> {
  // Absent in insecure contexts and in some browsers.
  const clipboard = navigator.clipboard as Clipboard | undefined;
  return clipboard ? clipboard.writeText(text) : Promise.reject(new Error(en.copy.noClipboard));
}

interface CopyOptions {
  readonly success?: string;
  readonly write?: (text: string) => Promise<void>;
}

/** The source inside a mermaid code fence, ready to paste into Markdown (FR-014). */
export function markdownFence(source: string): string {
  return "```mermaid\n" + source + "\n```";
}

/**
 * Copies text only when the source check allows it, and reports success only after the write has completed.
 * A source still being checked, or one Mermaid rejects, is refused with an explanation and no clipboard write; one that
 * Mermaid rejects only for a notice is copied, and the notice is added to the success message.
 */
export async function copyText(
  text: string,
  status: SourceStatus,
  { success = en.copy.copied, write = writeToClipboard }: CopyOptions = {},
): Promise<FeedbackMessage> {
  if (status.kind === "checking") return { tone: "error", message: en.copy.checking };
  if (status.kind === "invalid") return { tone: "error", message: fill(en.copy.invalid, { reason: status.reason }) };
  try {
    await write(text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : en.copy.noClipboard;
    return { tone: "error", message: fill(en.copy.failed, { reason }) };
  }
  // Mermaid rejects a source that has only a notice; it was copied all the same, and the notice is repeated.
  const noticeText = status.kind === "notice" ? status.notices.map((notice) => notice.text) : [];
  return { tone: "success", message: [success, ...noticeText].join(" ") };
}
