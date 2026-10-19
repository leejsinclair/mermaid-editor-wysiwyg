import { en } from "../text/en";
import { fill } from "../text/fill";
import { DEPLOYMENT_NODE_NAME, ELEMENT_TYPE_NAMES } from "./c4/catalogue";
import { walkItems } from "./c4/tree";
import { shapeName } from "./flowchart/catalogue";
import { ROLE_NAMES } from "./sequence/catalogue";
import type { Diagram } from "./types";

/** One item a connection, message or relationship may start or end at. */
export interface Target {
  readonly id: number;
  /** Formed as "<label> (<type> <n>)", so equal labels are told apart (EC-20). */
  readonly name: string;
}

/** Names each item by its label, its type and its position among the items of that type, counted from 1. */
function numbered(entries: readonly { readonly id: number; readonly label: string; readonly type: string }[]): Target[] {
  const seen = new Map<string, number>();
  return entries.map(({ id, label, type }) => {
    const n = (seen.get(type) ?? 0) + 1;
    seen.set(type, n);
    return { id, name: fill(en.properties.target, { label, type, n: String(n) }) };
  });
}

/** The items that can be the end of a connection, message or relationship in the diagram, in diagram order. */
export function targetList(diagram: Diagram): Target[] {
  if (diagram.type === "flowchart") {
    return numbered(diagram.content.nodes.map((entry) => ({ id: entry.id, label: entry.label, type: shapeName(entry.shape) ?? entry.shape })));
  }
  if (diagram.type === "sequence") {
    return numbered(diagram.content.participants.map((entry) => ({ id: entry.id, label: entry.label, type: ROLE_NAMES.get(entry.role) ?? entry.role })));
  }
  return numbered(
    walkItems(diagram.content.tree).flatMap((entry) => {
      if (entry.item === "boundary") return [];
      const type = entry.item === "element" ? (ELEMENT_TYPE_NAMES.get(entry.elementType) ?? entry.elementType) : DEPLOYMENT_NODE_NAME;
      return [{ id: entry.id, label: entry.label, type }];
    }),
  );
}
