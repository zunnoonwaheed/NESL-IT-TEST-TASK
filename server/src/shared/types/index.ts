export enum ShapeType {
  Circle = 'circle',
  Rectangle = 'rectangle',
}

export interface BaseNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  label: string;
  color?: string;
}

export interface CircleNode extends BaseNode {
  type: ShapeType.Circle;
  radius: number;
}

export interface RectangleNode extends BaseNode {
  type: ShapeType.Rectangle;
  width: number;
  height: number;
}

export type ShapeNode = CircleNode | RectangleNode;

export interface CanvasState {
  nodes: ShapeNode[];
  generatedAt?: string;
  prompt?: string;
}

export interface GenerateCanvasRequest {
  prompt: string;
}

export interface GenerateCanvasResponse {
  nodes: ShapeNode[];
  prompt: string;
  error?: string;
}

export interface NodeMovePayload {
  id: string;
  x: number;
  y: number;
}

export interface SocketEvents {
  CANVAS_GENERATE: 'canvas:generate';
  CANVAS_GENERATED: 'canvas:generated';
  NODE_MOVE: 'node:move';
  NODE_MOVED: 'node:moved';
  ERROR: 'canvas:error';
}
