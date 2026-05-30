export const ShapeType = {
  Circle: 'circle',
  Rectangle: 'rectangle',
} as const;

export type ShapeType = (typeof ShapeType)[keyof typeof ShapeType];

export interface BaseNode {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  label: string;
  color?: string;
}

export interface CircleNode extends BaseNode {
  type: 'circle';
  radius: number;
}

export interface RectangleNode extends BaseNode {
  type: 'rectangle';
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
