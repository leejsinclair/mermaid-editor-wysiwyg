// Every editing operation (contracts/operations.md). The interface builds one from a gesture and commits it.
import type {
  BoundaryType,
  Direction,
  ElementType,
  Ending,
  FlowchartShape,
  LineStyle,
  MessageStyle,
  ParticipantRole,
} from "./types";

export interface Position {
  readonly x: number;
  readonly y: number;
}

/** Fields `setLabel` can replace: `label` and `text` are required, `description` and `technology` optional. */
export type LabelField = "label" | "text" | "description" | "technology";

/** What `changeType` changes; one family per type of item (FR-040). */
export type TypeChange =
  | { readonly kind: "shape"; readonly shape: FlowchartShape }
  | { readonly kind: "connection"; readonly line: LineStyle; readonly ending: Ending }
  | { readonly kind: "role"; readonly role: ParticipantRole }
  | { readonly kind: "style"; readonly style: MessageStyle }
  | { readonly kind: "elementType"; readonly elementType: ElementType }
  | { readonly kind: "direction"; readonly direction: Direction };

export type Operation =
  // Shared by every type
  | { readonly op: "renameDiagram"; readonly name: string }
  | { readonly op: "setLabel"; readonly itemId: number; readonly field: LabelField; readonly text: string }
  | { readonly op: "deleteItem"; readonly itemId: number }
  | { readonly op: "changeType"; readonly itemId: number; readonly to: TypeChange }
  | { readonly op: "moveEnd"; readonly linkId: number; readonly end: "from" | "to"; readonly targetId: number }
  | { readonly op: "reverse"; readonly linkId: number }
  // Flowchart
  | { readonly op: "addNode"; readonly shape: FlowchartShape; readonly position: Position }
  | { readonly op: "moveNode"; readonly id: number; readonly position: Position }
  | {
      readonly op: "addConnection";
      readonly from: number;
      readonly to: number;
      readonly line: LineStyle;
      readonly ending: Ending;
      readonly label?: string;
    }
  // Sequence
  | { readonly op: "addParticipant"; readonly role: ParticipantRole; readonly index?: number }
  | {
      readonly op: "addMessage";
      readonly from: number;
      readonly to: number;
      readonly style: MessageStyle;
      readonly text: string;
      readonly index?: number;
    }
  // Sequence participants and messages, and Dynamic C4 relationships
  | { readonly op: "reorder"; readonly itemId: number; readonly toIndex: number }
  // C4
  | {
      readonly op: "addElement";
      readonly elementType: ElementType;
      readonly parentId?: number;
      readonly index?: number;
    }
  | {
      readonly op: "addContainer";
      readonly container: BoundaryType | "deployment-node";
      readonly parentId?: number;
    }
  | { readonly op: "addRelationship"; readonly from: number; readonly to: number; readonly direction: Direction }
  /** `parentId` null moves the item to the top level. */
  | { readonly op: "moveToParent"; readonly itemId: number; readonly parentId: number | null; readonly index?: number }
  | { readonly op: "setTitle"; readonly text: string };
