import { describe, expect, it, vi } from "vitest";
import { openFile, MAX_FILE_BYTES } from "./openFile";

// VO-099 (DC-05): a file larger than 5 MB is refused with fileTooLarge before its contents are read.

const valid = JSON.stringify({
  format: "mermaid-editor-wysiwyg",
  formatVersion: 1,
  diagram: { name: "Small", type: "flowchart", nextId: 1, content: { nodes: [], connections: [] } },
});

describe("openFile", () => {
  it("refuses a file over 5 MB without reading it", async () => {
    const text = vi.fn(() => Promise.resolve(valid));

    const result = await openFile({ size: MAX_FILE_BYTES + 1, text });

    expect(result).toMatchObject({ ok: false, reason: "fileTooLarge" });
    expect(text).not.toHaveBeenCalled();
  });

  it("reads and opens a file of exactly 5 MB or less", async () => {
    const text = vi.fn(() => Promise.resolve(valid));

    const result = await openFile({ size: MAX_FILE_BYTES, text });

    expect(text).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ ok: true, model: { name: "Small", type: "flowchart" } });
  });

  it("refuses a file whose contents cannot be read, as not a diagram file", async () => {
    const result = await openFile({ size: 10, text: () => Promise.reject(new Error("unreadable")) });

    expect(result).toMatchObject({ ok: false, reason: "notJson" });
  });
});
