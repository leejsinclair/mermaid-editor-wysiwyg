import { en } from "../text/en";
import { fill } from "../text/fill";
import type { Rejection } from "./reasons";

const SENTENCES = new Map<string, string>(Object.entries(en.rejections));

/** The fixed explanation for a rejection, with the values it names filled in (FR-009). */
export function rejectionMessage({ reason, details }: Rejection): string {
  return fill(SENTENCES.get(reason) ?? en.rejections.unknownItem, details ?? {});
}
