// The visual model (data-model.md): plain immutable data, no DOM and no Mermaid text.

// Item ids are positive safe integers; Mermaid aliases are computed from them in generation only.

export type DiagramType = "flowchart" | "sequence" | "c4";
export type C4Kind = "context" | "container" | "component" | "dynamic" | "deployment";

// Flowchart
export type FlowchartShape =
  | "rectangle"
  | "rounded"
  | "stadium"
  | "diamond"
  | "circle"
  | "parallelogram"
  | "cylinder"
  | "subroutine"
  | "hexagon";
export type LineStyle = "solid" | "dotted" | "thick";
export type Ending = "arrow" | "plain" | "both";

export interface Node {
  readonly id: number;
  readonly shape: FlowchartShape;
  /** Required: at least one visible character. */
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

export interface Connection {
  readonly id: number;
  /** Node ids; may be equal (self-loop). */
  readonly from: number;
  readonly to: number;
  readonly line: LineStyle;
  readonly ending: Ending;
  /** Optional: may be empty. */
  readonly label: string;
}

export interface FlowchartContent {
  /** Creation order. */
  readonly nodes: readonly Node[];
  /** Creation order. */
  readonly connections: readonly Connection[];
}

// Sequence
export type ParticipantRole = "participant" | "actor";
export type MessageStyle =
  | "solid-arrow"
  | "dashed-arrow"
  | "solid-open"
  | "dashed-open"
  | "solid-cross"
  | "dashed-cross"
  | "solid-async"
  | "dashed-async";

export interface Participant {
  readonly id: number;
  readonly role: ParticipantRole;
  /** Required: at least one visible character. Equal labels stay distinct participants. */
  readonly label: string;
}

export interface Message {
  readonly id: number;
  /** Participant ids; may be equal (self-message). */
  readonly from: number;
  readonly to: number;
  readonly style: MessageStyle;
  /** Required: at least one visible character. */
  readonly text: string;
}

export interface SequenceContent {
  /** Left-to-right order. */
  readonly participants: readonly Participant[];
  /** Top-to-bottom order. */
  readonly messages: readonly Message[];
}

// C4
type C4Base =
  | "person"
  | "system"
  | "system-db"
  | "system-queue"
  | "container"
  | "container-db"
  | "container-queue"
  | "component"
  | "component-db"
  | "component-queue";
export type ElementType = C4Base | `${C4Base}-ext`;
export type BoundaryType = "enterprise" | "system" | "container" | "generic";
export type Direction = "one-way" | "two-way";

export interface Element {
  readonly item: "element";
  readonly id: number;
  readonly elementType: ElementType;
  /** Required: at least one visible character. */
  readonly label: string;
  /** Optional: may be empty. */
  readonly description: string;
  /** Optional: may be empty; only for types that have one. */
  readonly technology: string;
}

export interface Boundary {
  readonly item: "boundary";
  readonly id: number;
  readonly boundaryType: BoundaryType;
  readonly label: string;
  readonly children: readonly C4Item[];
}

export interface DeploymentNode {
  readonly item: "deployment-node";
  readonly id: number;
  readonly label: string;
  readonly description: string;
  readonly technology: string;
  readonly children: readonly C4Item[];
}

export type C4Item = Element | Boundary | DeploymentNode;

export interface Relationship {
  readonly id: number;
  /** Element ids or, in Deployment, node ids; never boundaries. */
  readonly from: number;
  readonly to: number;
  readonly direction: Direction;
  /** Required: at least one visible character; default `Uses`. */
  readonly label: string;
  /** Optional: may be empty. */
  readonly technology: string;
}

export interface C4Content {
  /** Top level, in statement order. */
  readonly tree: readonly C4Item[];
  /** In order; a Dynamic number is 1 + the index here and is never stored. */
  readonly relationships: readonly Relationship[];
}

// Diagram
interface DiagramBase {
  /** Editor id; a newly opened file always gets a new one. */
  readonly id: string;
  /** At least one visible character; never in the source. */
  readonly name: string;
  /** Counter for item ids; only increases, so ids are never reused. */
  readonly nextId: number;
  /** ISO timestamp set by persistence on each save, never by operations; empty until the first save. */
  readonly changedAt: string;
}

export interface FlowchartDiagram extends DiagramBase {
  readonly type: "flowchart";
  readonly content: FlowchartContent;
}

export interface SequenceDiagram extends DiagramBase {
  readonly type: "sequence";
  readonly content: SequenceContent;
}

export interface C4Diagram extends DiagramBase {
  readonly type: "c4";
  /** Fixed at creation. */
  readonly kind: C4Kind;
  /** May be empty. */
  readonly title: string;
  readonly content: C4Content;
}

export type Diagram = FlowchartDiagram | SequenceDiagram | C4Diagram;

/** A diagram as stored in a file: everything but the editor id and the time it was last changed. */
export type DiagramModel = Diagram extends infer D ? (D extends unknown ? Omit<D, "id" | "changedAt"> : never) : never;
