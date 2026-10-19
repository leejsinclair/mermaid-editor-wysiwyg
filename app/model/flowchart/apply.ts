import type { LabelField, Position } from "../operations";
import type { Connection, Ending, FlowchartDiagram, FlowchartShape, LineStyle } from "../types";
import { shapeName } from "./catalogue";
import { nearestFreePosition } from "./freePosition";

/** Adds a node labelled with its shape name at the free position nearest `position` (FR-007, EC-01). */
export function addNode(diagram: FlowchartDiagram, shape: FlowchartShape, position: Position): FlowchartDiagram {
  const { x, y } = nearestFreePosition(diagram.content.nodes, position);
  const node = { id: diagram.nextId, shape, label: shapeName(shape) ?? shape, x, y };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, nodes: [...diagram.content.nodes, node] },
  };
}

/** Appends a connection; self-loops, duplicates and opposite directions are all allowed and distinct (FR-025). */
export function addConnection(
  diagram: FlowchartDiagram,
  from: number,
  to: number,
  line: LineStyle,
  ending: Ending,
  label = "",
): FlowchartDiagram {
  const connection = { id: diagram.nextId, from, to, line, ending, label };
  return {
    ...diagram,
    nextId: diagram.nextId + 1,
    content: { ...diagram.content, connections: [...diagram.content.connections, connection] },
  };
}

/**
 * Moves a node to the free position nearest the request, excluding that node from collision checks (EC-01).
 * Returns the same diagram when the node would not move.
 */
export function moveNode(diagram: FlowchartDiagram, id: number, position: Position): FlowchartDiagram {
  const moving = diagram.content.nodes.find((node) => node.id === id);
  if (!moving) return diagram;
  const others = diagram.content.nodes.filter((node) => node.id !== id);
  const { x, y } = nearestFreePosition(others, position);
  if (x === moving.x && y === moving.y) return diagram;
  const nodes = diagram.content.nodes.map((node) => (node.id === id ? { ...node, x, y } : node));
  return { ...diagram, content: { ...diagram.content, nodes } };
}

/** Replaces a node's or a connection's label; returns the same diagram when the text is already the label. */
export function setLabel(diagram: FlowchartDiagram, itemId: number, field: LabelField, text: string): FlowchartDiagram {
  if (field !== "label") return diagram;
  const { nodes, connections } = diagram.content;
  const node = nodes.find((candidate) => candidate.id === itemId);
  if (node) {
    if (node.label === text) return diagram;
    return {
      ...diagram,
      content: { ...diagram.content, nodes: nodes.map((candidate) => (candidate === node ? { ...node, label: text } : candidate)) },
    };
  }
  const connection = connections.find((candidate) => candidate.id === itemId);
  if (!connection || connection.label === text) return diagram;
  return {
    ...diagram,
    content: {
      ...diagram.content,
      connections: connections.map((candidate) => (candidate === connection ? { ...connection, label: text } : candidate)),
    },
  };
}

/** Deletes a node with every connection that touches it, or a single connection. Freed ids are never reused. */
export function deleteItem(diagram: FlowchartDiagram, itemId: number): FlowchartDiagram {
  const { nodes, connections } = diagram.content;
  if (nodes.some((node) => node.id === itemId)) {
    return {
      ...diagram,
      content: {
        nodes: nodes.filter((node) => node.id !== itemId),
        connections: connections.filter((connection) => connection.from !== itemId && connection.to !== itemId),
      },
    };
  }
  if (!connections.some((connection) => connection.id === itemId)) return diagram;
  return { ...diagram, content: { nodes, connections: connections.filter((connection) => connection.id !== itemId) } };
}

/** Gives a node another shape; its label, position and connections are untouched. */
export function changeShape(diagram: FlowchartDiagram, itemId: number, shape: FlowchartShape): FlowchartDiagram {
  const target = diagram.content.nodes.find((node) => node.id === itemId);
  if (!target || target.shape === shape) return diagram;
  const nodes = diagram.content.nodes.map((node) => (node === target ? { ...node, shape } : node));
  return { ...diagram, content: { ...diagram.content, nodes } };
}

function updateConnection(diagram: FlowchartDiagram, linkId: number, change: Partial<Connection>): FlowchartDiagram {
  const target = diagram.content.connections.find((connection) => connection.id === linkId);
  if (!target) return diagram;
  const changed = { ...target, ...change };
  if (changed.from === target.from && changed.to === target.to && changed.line === target.line && changed.ending === target.ending) {
    return diagram;
  }
  const connections = diagram.content.connections.map((connection) => (connection === target ? changed : connection));
  return { ...diagram, content: { ...diagram.content, connections } };
}

/** Gives a connection another line style and ending; its label and ends are untouched. */
export function changeConnection(diagram: FlowchartDiagram, linkId: number, line: LineStyle, ending: Ending): FlowchartDiagram {
  return updateConnection(diagram, linkId, { line, ending });
}

/** Moves one end of a connection to another node, which may be the other end's node or one already connected. */
export function moveEnd(diagram: FlowchartDiagram, linkId: number, end: "from" | "to", targetId: number): FlowchartDiagram {
  return updateConnection(diagram, linkId, end === "from" ? { from: targetId } : { to: targetId });
}

/** Makes a one-way connection run the other way; validation has refused self-loops and undirected lines. */
export function reverse(diagram: FlowchartDiagram, linkId: number): FlowchartDiagram {
  const target = diagram.content.connections.find((connection) => connection.id === linkId);
  return target ? updateConnection(diagram, linkId, { from: target.to, to: target.from }) : diagram;
}
