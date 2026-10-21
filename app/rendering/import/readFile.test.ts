import { describe, expect, it } from "vitest";
import { readTextFile } from "./readFile";

// VO-018 (FR-009, US4-AS3): a file whose contents cannot be read gives a reason the dialog shows; nothing is thrown.

/** A file whose read fails, as a removed file or one without permission does. */
class UnreadableFile extends File {
  override arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.reject(new DOMException("The requested file could not be read.", "NotReadableError"));
  }
}

describe("readTextFile", () => {
  it("returns the reason when the file cannot be read, and does not reject", async () => {
    const read = await readTextFile(new UnreadableFile(["flowchart TD"], "gone.mmd"));
    expect(read).toEqual({ ok: false, problem: "The file could not be read." });
  });
});
