import { ELEMENT_TYPES_BY_KIND, hasTechnology } from "../model/c4/catalogue";
import { decodeSourceText } from "./decode";
import type { BoundaryType, C4Content, C4Item, C4Kind, DeploymentNode, Element, ElementType, Relationship } from "../model/types";

// Reads C4 statements one by one, depth first (research R1): not Mermaid's database, which merges relationships and keeps
// no line numbers. Ids are given in statement order, a boundary before the items inside it.

export interface ReadC4 extends C4Content {
  readonly kind: C4Kind;
  readonly title: string;
  readonly nextId: number;
}

export const ELEMENT_MACROS: ReadonlyMap<string, ElementType> = new Map<string, ElementType>([
  ["Person", "person"],
  ["Person_Ext", "person-ext"],
  ["System", "system"],
  ["System_Ext", "system-ext"],
  ["SystemDb", "system-db"],
  ["SystemDb_Ext", "system-db-ext"],
  ["SystemQueue", "system-queue"],
  ["SystemQueue_Ext", "system-queue-ext"],
  ["Container", "container"],
  ["Container_Ext", "container-ext"],
  ["ContainerDb", "container-db"],
  ["ContainerDb_Ext", "container-db-ext"],
  ["ContainerQueue", "container-queue"],
  ["ContainerQueue_Ext", "container-queue-ext"],
  ["Component", "component"],
  ["Component_Ext", "component-ext"],
  ["ComponentDb", "component-db"],
  ["ComponentDb_Ext", "component-db-ext"],
  ["ComponentQueue", "component-queue"],
  ["ComponentQueue_Ext", "component-queue-ext"],
]);

export const BOUNDARY_MACROS: ReadonlyMap<string, BoundaryType> = new Map<string, BoundaryType>([
  ["Enterprise_Boundary", "enterprise"],
  ["System_Boundary", "system"],
  ["Container_Boundary", "container"],
  ["Boundary", "generic"],
]);

export const NODE_MACROS: ReadonlySet<string> = new Set(["Deployment_Node", "Node", "Node_L", "Node_R"]);

const RELATIONSHIP_MACROS: ReadonlyMap<string, Relationship["direction"]> = new Map<string, Relationship["direction"]>([
  ["Rel", "one-way"],
  ["RelIndex", "one-way"],
  ["BiRel", "two-way"],
]);

/** Splits a macro's arguments at commas outside quotes; the quotes are removed. */
function splitArgs(text: string): string[] {
  const args: string[] = [];
  let current = "";
  let quoted = false;
  for (const character of text) {
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      args.push(current.trim());
      current = "";
    } else current += character;
  }
  args.push(current.trim());
  return args;
}

/** The nearest element type the kind offers: Component, then Container, then System, then Person, keeping the suffix. */
export function nearestOffered(type: ElementType, kind: C4Kind): ElementType {
  const offered = new Set<string>(ELEMENT_TYPES_BY_KIND[kind]);
  const [family = "", ...rest] = type.split("-");
  const up: ReadonlyMap<string, string> = new Map([
    ["component", "container"],
    ["container", "system"],
    ["system", "person"],
  ]);
  let current = family;
  while (current !== "") {
    const candidate = [current, ...rest].join("-");
    if (offered.has(candidate)) return candidate as ElementType;
    current = up.get(current) ?? "";
  }
  return "person";
}

const arg = (args: readonly string[], index: number): string => args.at(index) ?? "";

/** An argument that holds text the developer typed, decoded (FR-001). */
const typed = (args: readonly string[], index: number): string => decodeSourceText(arg(args, index));

/** A boundary or Deployment node whose `}` has not been read yet. A transparent one (a boundary Deployment has none) keeps its children. */
interface Open {
  readonly children: C4Item[];
  readonly build: (children: readonly C4Item[]) => C4Item;
  readonly transparent?: boolean;
}

class StatementReader {
  constructor(private readonly kind: C4Kind) {}

  readonly tree: C4Item[] = [];
  readonly relationships: Relationship[] = [];
  /** The Dynamic number each relationship was written with, in the same order (sorted by it at the end). */
  readonly numbers: number[] = [];
  title = "";
  nextId = 1;
  private readonly aliases = new Map<string, number>();
  private readonly open: Open[] = [];

  private take(alias: string): number {
    const id = this.nextId;
    this.nextId += 1;
    this.aliases.set(alias, id);
    return id;
  }

  private add(item: C4Item): void {
    (this.open.at(-1)?.children ?? this.tree).push(item);
  }

  private closeOne(): void {
    const frame = this.open.pop();
    if (frame === undefined) return;
    if (frame.transparent === true) {
      for (const item of frame.children) this.add(item);
    }
    else this.add(frame.build(frame.children));
  }

  line(text: string): void {
    if (text === "" || text.startsWith("%%") || /^C4\w+$/.test(text)) return;
    if (text.startsWith("title ")) {
      this.title = decodeSourceText(text.slice("title ".length).trim());
    } else if (text === "}") {
      this.closeOne();
    } else {
      this.macro(text);
    }
  }

  private macro(text: string): void {
    const match = /^(\w+)\s*\((.*)\)\s*(\{)?$/.exec(text);
    if (match === null) return;
    const name = match[1] ?? "";
    const args = splitArgs(match[2] ?? "");
    const opens = match[3] === "{";
    if (ELEMENT_MACROS.has(name)) this.element(ELEMENT_MACROS.get(name) ?? "person", args);
    else if (BOUNDARY_MACROS.has(name)) this.boundary(BOUNDARY_MACROS.get(name) ?? "generic", args);
    else if (NODE_MACROS.has(name)) this.node(args, opens);
    else if (RELATIONSHIP_MACROS.has(name)) this.relationship(name, args);
  }

  private element(requested: ElementType, args: readonly string[]): void {
    // A type the kind does not offer is kept as the nearest one it does (research R7).
    const elementType = nearestOffered(requested, this.kind);
    const id = this.take(arg(args, 0));
    const withTechnology = hasTechnology(elementType);
    const element: Element = {
      item: "element",
      id,
      elementType,
      label: typed(args, 1),
      description: withTechnology ? typed(args, 3) : typed(args, 2),
      technology: withTechnology ? typed(args, 2) : "",
    };
    this.add(element);
  }

  private boundary(boundaryType: BoundaryType, args: readonly string[]): void {
    const id = this.take(arg(args, 0));
    const label = typed(args, 1);
    // A Deployment diagram has no boundaries: the boundary is dropped and what it holds moves up (research R7).
    const transparent = this.kind === "deployment";
    this.open.push({ children: [], transparent, build: (children) => ({ item: "boundary", id, boundaryType, label, children }) });
  }

  private node(args: readonly string[], opens: boolean): void {
    const id = this.take(arg(args, 0));
    const node: Omit<DeploymentNode, "children"> = {
      item: "deployment-node",
      id,
      label: typed(args, 1),
      technology: typed(args, 2),
      description: typed(args, 3),
    };
    if (opens) this.open.push({ children: [], build: (children) => ({ ...node, children }) });
    else this.add({ ...node, children: [] });
  }

  private relationship(name: string, args: readonly string[]): void {
    // RelIndex(n, from, to, label, technology): the number is not stored, the relationship keeps its place in order.
    const shift = name === "RelIndex" ? 1 : 0;
    const id = this.nextId;
    this.nextId += 1;
    // A relationship without a number keeps its place: its key is its position.
    this.numbers.push(name === "RelIndex" ? Number(arg(args, 0)) : this.relationships.length + 1);
    this.relationships.push({
      id,
      from: this.aliases.get(arg(args, shift)) ?? 0,
      to: this.aliases.get(arg(args, shift + 1)) ?? 0,
      direction: RELATIONSHIP_MACROS.get(name) ?? "one-way",
      label: arg(args, shift + 2) === "" ? "Uses" : typed(args, shift + 2),
      technology: typed(args, shift + 3),
    });
  }
}

export function readC4(text: string, kind: C4Kind): ReadC4 {
  const reader = new StatementReader(kind);
  for (const raw of text.split(/\r?\n/)) reader.line(raw.trim());
  // A Dynamic diagram's relationships are in the order of their numbers; the numbers themselves are not stored.
  const order = reader.relationships.map((_, index) => index);
  if (kind === "dynamic") order.sort((a, b) => (reader.numbers[a] ?? a + 1) - (reader.numbers[b] ?? b + 1) || a - b);
  return {
    kind,
    title: reader.title,
    tree: reader.tree,
    relationships: order.map((index) => reader.relationships[index]).filter((item): item is Relationship => item !== undefined),
    nextId: reader.nextId,
  };
}
