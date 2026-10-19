// Test support: reads a generated source back through Mermaid's own parser (research R8). Needs a jsdom environment.
import mermaid from "mermaid";

export async function readBack(source: string) {
  // Registers Mermaid's diagram types, which `getDiagramFromText` alone does not.
  mermaid.initialize({ startOnLoad: false });
  // mermaidAPI is deprecated, but `parse` does not expose the parsed database these fidelity tests assert on (research R8).
  // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  return diagram.db;
}

const NUMERIC = /ﬂ°°(\d+)¶ß/g;
const NAMED = /ﬂ°([A-Za-z]+)¶ß/g;
const NAMED_CHARS = new Map([
  ["quot", '"'],
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
]);

/** Turns Mermaid's entity placeholders and `<br>` back into the text the user typed. */
export function decode(text: string): string {
  // Line breaks first: a typed `<br/>` arrives as placeholders and must stay literal.
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(NUMERIC, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(NAMED, (match, name: string) => NAMED_CHARS.get(name) ?? match);
}

/** What a flowchart vertex looks like once the parser has read it. */
export interface ReadVertex {
  readonly id: string;
  readonly text: string;
  readonly type: string;
}

/** What a flowchart edge looks like once the parser has read it. */
export interface ReadEdge {
  readonly from: string;
  readonly to: string;
  readonly text: string;
  readonly type: string;
  readonly stroke: string;
}

interface FlowDb {
  getVertices(): Map<string, { text?: string; type?: string }>;
  getEdges(): { start: string; end: string; text?: string; type?: string; stroke?: string }[];
}

/** The flowchart parser's reading of a source: its vertices and edges with decoded text. */
export async function readFlowchart(source: string): Promise<{ vertices: ReadVertex[]; edges: ReadEdge[] }> {
  const db = (await readBack(source)) as unknown as FlowDb;
  const vertices = [...db.getVertices()].map(([id, vertex]) => ({
    id,
    text: decode(vertex.text ?? ""),
    type: vertex.type ?? "",
  }));
  const edges = db.getEdges().map((edge) => ({
    from: edge.start,
    to: edge.end,
    text: decode(edge.text ?? ""),
    type: edge.type ?? "",
    stroke: edge.stroke ?? "",
  }));
  return { vertices, edges };
}

/** What a sequence participant or actor looks like once the parser has read it. */
export interface ReadActor {
  readonly id: string;
  readonly label: string;
  readonly type: string;
}

/** What a sequence message looks like once the parser has read it. */
export interface ReadMessage {
  readonly from: string;
  readonly to: string;
  readonly text: string;
  /** Mermaid's numeric line type (0 solid arrow, 1 dashed arrow, 3 and 4 crosses, 5 and 6 open, 24 and 25 async). */
  readonly type: number;
}

interface SequenceDb {
  getActors(): Map<string, { description?: string; type?: string }>;
  getMessages(): { from?: string; to?: string; message?: unknown; type: number }[];
}

/** The sequence parser's reading of a source: its participants in declaration order and its messages in order. */
export async function readSequence(source: string): Promise<{ actors: ReadActor[]; messages: ReadMessage[] }> {
  const db = (await readBack(source)) as unknown as SequenceDb;
  const actors = [...db.getActors()].map(([id, actor]) => ({ id, label: decode(actor.description ?? ""), type: actor.type ?? "" }));
  const messages = db.getMessages().map((message) => ({
    from: message.from ?? "",
    to: message.to ?? "",
    text: decode(typeof message.message === "string" ? message.message : ""),
    type: message.type,
  }));
  return { actors, messages };
}

/** What a C4 element looks like once the parser has read it. */
export interface ReadShape {
  readonly alias: string;
  /** Mermaid's name for the element type, such as `external_system_db`. */
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly technology: string;
  /** The alias of the enclosing boundary, or `global` at the top level. */
  readonly parent: string;
}

/** What a C4 boundary or Deployment node looks like once the parser has read it. */
export interface ReadBoundary {
  readonly alias: string;
  readonly label: string;
  /** For a boundary, Mermaid's type word; for a Deployment node, its technology. */
  readonly type: string;
  readonly description: string;
  readonly parent: string;
}

/** What a C4 relationship looks like once the parser has read it. */
export interface ReadRelationship {
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly label: string;
  readonly technology: string;
}

interface Text {
  readonly text?: string;
}

interface C4Db {
  getC4Type(): string;
  getTitle(): string;
  getC4ShapeArray(): { alias: string; label?: Text; descr?: Text; techn?: Text; typeC4Shape?: Text; parentBoundary?: string }[];
  getBoundaries(): { alias: string; label?: Text; type?: Text; descr?: Text; parentBoundary?: string }[];
  getRels(): { type: string; from: string; to: string; label?: Text; techn?: Text }[];
}

/** The C4 parser's reading of a source: header, title, elements, boundaries and relationships, all in statement order. */
export async function readC4(source: string) {
  const db = (await readBack(source)) as unknown as C4Db;
  const shapes: ReadShape[] = db.getC4ShapeArray().map((shape) => ({
    alias: shape.alias,
    type: shape.typeC4Shape?.text ?? "",
    label: decode(shape.label?.text ?? ""),
    description: decode(shape.descr?.text ?? ""),
    technology: decode(shape.techn?.text ?? ""),
    parent: shape.parentBoundary ?? "",
  }));
  const boundaries: ReadBoundary[] = db
    .getBoundaries()
    .filter((boundary) => boundary.alias !== "global")
    .map((boundary) => ({
      alias: boundary.alias,
      label: decode(boundary.label?.text ?? ""),
      type: decode(boundary.type?.text ?? ""),
      description: decode(boundary.descr?.text ?? ""),
      parent: boundary.parentBoundary ?? "",
    }));
  const relationships: ReadRelationship[] = db.getRels().map((rel) => ({
    type: rel.type,
    from: rel.from,
    to: rel.to,
    label: decode(rel.label?.text ?? ""),
    technology: decode(rel.techn?.text ?? ""),
  }));
  return { header: db.getC4Type(), title: decode(db.getTitle()), shapes, boundaries, relationships };
}
