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

// User and Authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}
