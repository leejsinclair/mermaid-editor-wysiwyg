import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as icons from "./icons";

// One component per action in the spec's action identification table (spec 008, FR-039 to FR-047).
const actionIcons = {
  Undo: "UndoIcon",
  Redo: "RedoIcon",
  AddShape: "AddShapeIcon",
  Connect: "ConnectIcon",
  ZoomIn: "ZoomInIcon",
  ZoomOut: "ZoomOutIcon",
  FitToView: "FitToViewIcon",
  Preview: "PreviewIcon",
  CopySource: "CopySourceIcon",
  CopyMarkdown: "CopyMarkdownIcon",
  Save: "SaveIcon",
  Rename: "RenameIcon",
  ChangeType: "ChangeTypeIcon",
  MoveTo: "MoveToIcon",
  Reverse: "ReverseIcon",
  ChangeEndpoints: "ChangeEndpointsIcon",
  Delete: "DeleteIcon",
  MermaidSource: "MermaidSourceIcon",
} as const;

type IconComponent = (props: { standalone?: boolean | undefined }) => ReactElement;

function componentFor(exportName: string): IconComponent {
  const Icon = (icons as unknown as Record<string, IconComponent | undefined>)[exportName];
  if (!Icon) throw new Error(`missing icon export: ${exportName}`);
  return Icon;
}

function render(exportName: string, standalone?: boolean): string {
  const Icon = componentFor(exportName);
  return renderToStaticMarkup(<Icon standalone={standalone} />);
}

describe("shared icon set", () => {
  it("exports one shared icon size", () => {
    expect(typeof icons.ICON_SIZE).toBe("number");
    expect(icons.ICON_SIZE).toBeGreaterThan(0);
  });

  it("exports one component per contract action", () => {
    for (const exportName of Object.values(actionIcons)) {
      expect(typeof componentFor(exportName), exportName).toBe("function");
    }
  });

  it.each(Object.values(actionIcons))("%s renders an inline SVG at the shared size", (exportName) => {
    const markup = render(exportName);
    expect(markup).toMatch(/^<svg[\s>]/);
    expect(markup).toContain(`width="${String(icons.ICON_SIZE)}"`);
    expect(markup).toContain(`height="${String(icons.ICON_SIZE)}"`);
  });

  it.each(Object.values(actionIcons))("%s is hidden from assistive technology when decorative", (exportName) => {
    expect(render(exportName)).toContain('aria-hidden="true"');
  });

  it.each(Object.values(actionIcons))("%s is exposed when it stands alone", (exportName) => {
    expect(render(exportName, true)).not.toContain("aria-hidden");
  });
});
