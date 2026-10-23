import { BOUNDARY_MACROS, ELEMENT_MACROS, NODE_MACROS, nearestOffered } from "./c4";
import { linesInDirectives } from "./document";
import { BOUNDARY_TYPES_BY_KIND, ELEMENT_TYPES_BY_KIND } from "../model/c4/catalogue";
import type { C4Kind } from "../model/types";
import { en } from "../text/en";
import { fill } from "../text/fill";
import type { ReportEntry } from "./report";

// Reads the flowchart's lines for what the editor cannot hold (contracts/import-reading.md, "Report category rules").
// The model's nodes and connections come from the snapshot; this only reports what was dropped, with its line.

/** The first word of a line that starts a construct the editor does not hold, with its report reason. */
const REASONS = en.importMermaid.reasons;
const DROPPED_KEYWORDS: ReadonlyMap<string, string> = new Map([
  ["subgraph", REASONS.subgraph],
  ["classDef", REASONS.classDef],
  ["class", REASONS.class],
  ["style", REASONS.style],
  ["linkStyle", REASONS.linkStyle],
  ["click", REASONS.click],
]);

const KNOWN_SHAPES = new Set(["rect", "rectangle", "rounded", "stadium", "cyl", "circle", "diamond", "hex", "lean-r", "subroutine"]);

/** The approximations a flowchart node or link line carries (research R7), each with what it became. */
function flowchartApproximations(raw: string, number: number): ReportEntry[] {
  const line = blankQuoted(raw);
  const entries: ReportEntry[] = [];
  const approximated = (construct: string, becomes: string, reason: string): void => {
    entries.push({ line: number, category: "approximated", construct, reason, becomes });
  };
  if (line.includes("(((")) approximated("double circle", "a circle", REASONS.shape);
  if (/\w>[^\]]*\]/.test(line)) approximated("asymmetric shape", "a rectangle", REASONS.shape);
  if (/\[\/[^\]]*\\\]/.test(line)) approximated("trapezoid", "a rectangle", REASONS.shape);
  if (/\[\\[^\]]*\/\]/.test(line)) approximated("inverted trapezoid", "a rectangle", REASONS.shape);
  if (/\[\\[^\]]*\\\]/.test(line)) approximated("lean-left shape", "a parallelogram", REASONS.shape);
  const named = /@\{\s*shape:\s*([\w-]+)/.exec(line)?.[1];
  if (named !== undefined && !KNOWN_SHAPES.has(named)) approximated(`shape ${named}`, "a rectangle", REASONS.shape);
  if (/(?:^|\s)o--o(?=\s|$)|(?:^|\s)x--x(?=\s|$)/.test(line)) {
    approximated("two-way circle or cross", "a two-way link", REASONS.endingBoth);
  } else if (/--[ox](?=\s|$)/.test(line)) {
    approximated("circle or cross ending", "a plain line", REASONS.endingCircle);
  }
  return entries;
}

/** One entry per label that carries HTML tags (a `<br>` is a line break, kept); each names its column (EC-12). */
const TAG_IN_LABEL = (text: string): boolean => text.includes("</") || /<[a-z]/i.test(text);
const LINE_BREAK_TAG = /<br\s*\/?>/gi;

/** The bracketed labels of a line, each with the column of its opening bracket. */
function bracketLabels(line: string): { readonly text: string; readonly column: number }[] {
  const labels: { text: string; column: number }[] = [];
  let open = line.indexOf("[");
  while (open !== -1) {
    const close = line.indexOf("]", open + 1);
    if (close === -1) break;
    labels.push({ text: line.slice(open + 1, close), column: open + 1 });
    open = line.indexOf("[", close + 1);
  }
  return labels;
}

function htmlLabelEntries(line: string, number: number): ReportEntry[] {
  return bracketLabels(line)
    .filter((label) => TAG_IN_LABEL(label.text.replace(LINE_BREAK_TAG, "")))
    .map((label) => ({ line: number, column: label.column, category: "dropped" as const, construct: "HTML in a label", reason: REASONS.htmlLabel }));
}

/** The line with quoted labels blanked, so a shape pattern is not read inside a label's own text. */
const blankQuoted = (line: string): string => line.split('"').filter((_, index) => index % 2 === 0).join('""');

const IGNORED_WORDS: ReadonlyMap<string, string> = new Map([
  ["accTitle:", "accTitle"],
  ["accDescr:", "accDescr"],
]);

/** The identifier that ends a text, such as the id in front of a bracketed label. */
function trailingWord(text: string): string {
  let start = text.length;
  while (start > 0 && /\w/.test(text.charAt(start - 1))) start -= 1;
  return text.slice(start);
}

/** The label of each id the first time it is given one, so a later, different label is reported (EC-04). */
function conflictingLabels(text: string): ReportEntry[] {
  const first = new Map<string, string>();
  const entries: ReportEntry[] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    for (const label of bracketLabels(line)) {
      const id = trailingWord(line.slice(0, label.column - 1));
      if (id === "") continue;
      const seen = first.get(id);
      if (seen === undefined) first.set(id, label.text);
      else if (seen !== label.text) {
        entries.push({ line: index + 1, column: label.column, category: "dropped", construct: "node label", reason: REASONS.nodeLabel });
      }
    }
  });
  return entries;
}

export function scanFlowchart(text: string): ReportEntry[] {
  const entries: ReportEntry[] = [...conflictingLabels(text)];
  let inFrontMatter = false;
  const lines = text.split(/\r?\n/);
  const inDirective = linesInDirectives(lines);
  lines.forEach((raw, index) => {
    const line = raw.trim();
    const word = line.split(/\s/)[0] ?? "";
    const line1 = index + 1;
    // Front matter, a directive and the accessibility lines are not diagram elements; they are reported as ignored (EC-01).
    if (index === 0 && line === "---") {
      inFrontMatter = true;
      entries.push({ line: line1, category: "ignored", construct: "front matter", reason: REASONS.frontMatter });
      return;
    }
    if (inFrontMatter) {
      if (line === "---") inFrontMatter = false;
      return;
    }
    // A directive is one construct, however many lines it spans (feature 006, FR-006): one entry, on its first line.
    if (inDirective.has(index)) {
      if (line.startsWith("%%{")) entries.push({ line: line1, category: "ignored", construct: "directive", reason: REASONS.directive });
      return;
    }
    const ignoredWord = IGNORED_WORDS.get(word);
    if (ignoredWord !== undefined) {
      entries.push({ line: line1, category: "ignored", construct: ignoredWord, reason: REASONS.accessibility });
      return;
    }
    const reason = DROPPED_KEYWORDS.get(word);
    if (reason !== undefined) {
      entries.push({ line: line1, category: "dropped", construct: word, reason });
      return;
    }
    if (line.includes(":::")) entries.push({ line: line1, category: "dropped", construct: "class", reason: REASONS.classOnNode });
    entries.push(...htmlLabelEntries(line, line1));
    if (line.includes("~~~")) entries.push({ line: line1, category: "dropped", construct: "invisible link", reason: REASONS.invisible });
    if (word !== "flowchart" && word !== "graph") entries.push(...flowchartApproximations(line, line1));
  });
  return entries;
}

/** The block and box keywords that open a region which the editor does not keep (its messages are kept). */
const OPENERS = new Set(["loop", "alt", "opt", "par", "critical", "break", "rect", "box"]);
const PARTS = new Set(["else", "and", "option"]);
const MESSAGE = /(?:--?>>|--?>|--?x|--?\)|-\))([+-]?)/;
const KIND_REASON: ReadonlyMap<string, string> = new Map([
  ["autonumber", REASONS.autonumber],
  ["create", REASONS.create],
  ["destroy", REASONS.destroy],
  ["link", REASONS.link],
]);

/** A block or box whose end line has not been read yet, as the report names it. */
interface Opened {
  readonly label: string;
}

function sequenceEntry(line: number, construct: string, reason: string): ReportEntry {
  return { line, category: "dropped", construct, reason };
}

/** The entries one sequence line gives, given the blocks and boxes still open above it. */
function linesEntries(line: string, number: number, open: Opened[]): ReportEntry[] {
  const word = line.split(/\s/)[0] ?? "";
  const rest = line.slice(word.length).trim();
  const inside = open.at(-1);
  if (word === "end") {
    open.pop();
    return [sequenceEntry(number, "end", REASONS.blockEnd)];
  }
  if (OPENERS.has(word)) {
    open.push({ label: rest === "" ? word : word + " " + rest });
    return [sequenceEntry(number, word, word === "box" ? REASONS.box : REASONS.block)];
  }
  if (PARTS.has(word)) return [sequenceEntry(number, word, REASONS.blockPart)];
  if (word.toLowerCase() === "note") return [sequenceEntry(number, "note", REASONS.note)];
  if (word === "activate" || word === "deactivate") return [sequenceEntry(number, "activation", REASONS.activation)];
  if (KIND_REASON.has(word)) return [sequenceEntry(number, word, KIND_REASON.get(word) ?? REASONS.link)];
  if (!line.includes(":") || !MESSAGE.test(line)) return [];
  const entries: ReportEntry[] = [];
  if ((line.slice(line.indexOf(":") + 1).trim()) === "") {
    entries.push({ line: number, category: "approximated", construct: "message", reason: REASONS.blankMessage, becomes: "a message with the default text" });
  }
  if ((MESSAGE.exec(line)?.[1] ?? "") !== "") entries.push(sequenceEntry(number, "activation", REASONS.activation));
  if (inside !== undefined) {
    entries.push({ line: number, category: "approximated", construct: "message", reason: fill(REASONS.message, { label: inside.label }), becomes: "a message" });
  }
  return entries;
}

/** The sequence's lines the editor does not keep, with the block each kept message sits in (EC-05). */
/** The report entry for a directive, on its first line; none for its other lines (feature 006, FR-006). */
function directiveEntry(line: string, number: number): ReportEntry[] {
  return line.startsWith("%%{") ? [{ line: number, category: "ignored", construct: "directive", reason: REASONS.directive }] : [];
}

export function scanSequence(text: string): ReportEntry[] {
  const open: Opened[] = [];
  const lines = text.split(/\r?\n/);
  const inDirective = linesInDirectives(lines);
  return lines.flatMap((raw, index) => {
    const line = raw.trim();
    if (inDirective.has(index)) return directiveEntry(line, index + 1);
    const word = line.split(/\s/)[0] ?? "";
    if (word === "actor" && line.includes("@{")) {
      return [{ line: index + 1, category: "approximated", construct: "actor", reason: REASONS.actorKind, becomes: "a participant" }];
    }
    if (line === "" || word === "sequenceDiagram" || word === "participant" || word === "actor" || word === "title") return [];
    return linesEntries(line, index + 1, open);
  });
}

/** Styling and layout macros, and the direction-hint relationship forms (Mermaid's Rel_U, Rel_Down and the rest). */
const STYLE_MACROS = /^(UpdateElementStyle|UpdateRelStyle|UpdateLayoutConfig|AddElementTag|AddRelTag|LAYOUT_\w+)\b/;
const HINT_RELATIONSHIP = /^(Rel_(?:U|Up|D|Down|L|Left|R|Right|B|Back))\s*\(([^,]+),\s*([^,]+)/;
const RELATIONSHIP = /^(Rel|BiRel|RelIndex)\s*\((.*)\)/;

const KIND_OF_HEADER: ReadonlyMap<string, C4Kind> = new Map<string, C4Kind>([
  ["C4Context", "context"],
  ["C4Container", "container"],
  ["C4Component", "component"],
  ["C4Dynamic", "dynamic"],
  ["C4Deployment", "deployment"],
]);

/** What an element of a type the kind does not offer became, completing "Kept as …" (feature 006, research R6). */
const FAMILY_NAMES: ReadonlyMap<string, string> = new Map([
  ["person", "a Person"],
  ["system", "a System"],
  ["container", "a Container"],
  ["component", "a Component"],
]);

/** The C4 lines of a document that are relationships, with their macro's first word and the two ends they name. */
function c4Ends(macro: string, args: readonly string[]): readonly string[] {
  return macro === "RelIndex" ? args.slice(1, 3) : args.slice(0, 2);
}

/** The entries one C4 line gives, given what the document declares and the kind it is. */
function c4LineEntries(line: string, number: number, kind: C4Kind, declared: ReadonlySet<string>, index: { dynamic: number }): ReportEntry[] {
  const macro = /^(\w+)\s*\(/.exec(line)?.[1] ?? "";
  const elementType = ELEMENT_MACROS.get(macro);
  const style = STYLE_MACROS.exec(line);
  const hint = HINT_RELATIONSHIP.exec(line);
  const relationship = RELATIONSHIP.exec(line);
  if (style) return [{ line: number, category: "dropped", construct: style[1] ?? "", reason: REASONS.c4Style }];
  // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
  if (elementType !== undefined && !ELEMENT_TYPES_BY_KIND[kind].includes(elementType)) {
    const family = nearestOffered(elementType, kind).split("-")[0] ?? "";
    return [{ line: number, category: "approximated", construct: macro, reason: REASONS.c4NotOffered, becomes: FAMILY_NAMES.get(family) ?? `a ${family}` }];
  }
  // eslint-disable-next-line security/detect-object-injection -- numeric index or typed key, never user text
  if (BOUNDARY_MACROS.has(macro) && BOUNDARY_TYPES_BY_KIND[kind].length === 0) {
    return [{ line: number, category: "dropped", construct: macro, reason: REASONS.c4Boundary }];
  }
  if (macro === "RelIndex") {
    index.dynamic += 1;
    const given = Number(/^RelIndex\s*\(\s*(\d+)/.exec(line)?.[1] ?? "");
    return given === index.dynamic ? [] : [{ line: number, category: "approximated", construct: macro, reason: REASONS.c4Order, becomes: "a relationship in the order it was written" }];
  }
  if (hint) return [{ line: number, category: "approximated", construct: hint[1] ?? "", reason: REASONS.c4Hint, becomes: "a relationship without a direction hint" }];
  if (relationship && c4Ends(relationship[1] ?? "", (relationship[2] ?? "").split(",").map((value) => value.trim())).some((end) => !declared.has(end))) {
    return [{ line: number, category: "dropped", construct: "relationship", reason: REASONS.c4UnknownEnd }];
  }
  return [];
}

export function scanC4(text: string): ReportEntry[] {
  const rawLines = text.split(/\r?\n/);
  const inDirective = linesInDirectives(rawLines);
  const all = rawLines.map((raw, index) => ({ line: raw.trim(), number: index + 1 }));
  const lines = all.filter(({ number }) => !inDirective.has(number - 1));
  const kind = KIND_OF_HEADER.get(lines.find(({ line }) => line !== "" && !line.startsWith("%%"))?.line ?? "") ?? "context";
  const declared = new Set<string>();
  for (const { line } of lines) {
    const alias = /^(\w+)\s*\(\s*(\w+)/.exec(line);
    const macro = alias?.[1] ?? "";
    if (alias && (ELEMENT_MACROS.has(macro) || BOUNDARY_MACROS.has(macro) || NODE_MACROS.has(macro))) declared.add(alias[2] ?? "");
  }
  const index = { dynamic: 0 };
  const directives = all.flatMap(({ line, number }) => (inDirective.has(number - 1) ? directiveEntry(line, number) : []));
  return [...directives, ...lines.flatMap(({ line, number }) => c4LineEntries(line, number, kind, declared, index))];
}
