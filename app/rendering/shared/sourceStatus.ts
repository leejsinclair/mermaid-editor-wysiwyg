import type { Notice } from "../../generation/generate";
import { en } from "../../text/en";
import { fill } from "../../text/fill";

/** Where the source stands: being checked, accepted by Mermaid, rejected, or accepted but for a notice. */
export type SourcePanelStatus =
  | { readonly kind: "checking" }
  | { readonly kind: "valid" }
  | { readonly kind: "invalid"; readonly reason: string }
  | { readonly kind: "notice"; readonly notices: readonly Notice[] };

export function statusText(status: SourcePanelStatus): string {
  switch (status.kind) {
    case "checking":
      return en.sourceCheck.checking;
    case "valid":
      return en.sourceCheck.valid;
    case "invalid":
      return fill(en.sourceCheck.invalid, { reason: status.reason });
    case "notice":
      return en.sourceCheck.notice;
  }
}

/** How a status is coloured: the state colours, with muted for a check still under way. */
export type StatusTone = "muted" | "success" | "warning" | "error";

const TONES: ReadonlyMap<SourcePanelStatus["kind"], StatusTone> = new Map<SourcePanelStatus["kind"], StatusTone>([
  ["checking", "muted"],
  ["valid", "success"],
  ["notice", "warning"],
  ["invalid", "error"],
]);

export const statusTone = (status: SourcePanelStatus): StatusTone => TONES.get(status.kind) ?? "muted";

/** The colour token of a tone: the state colours, or the muted text colour. */
export const toneColour = (tone: StatusTone): string => (tone === "muted" ? "var(--text-muted)" : `var(--${tone})`);
