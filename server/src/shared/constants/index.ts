export const SOCKET_EVENTS = {
  CANVAS_GENERATE: 'canvas:generate',
  CANVAS_GENERATED: 'canvas:generated',
  NODE_MOVE: 'node:move',
  NODE_MOVED: 'node:moved',
  ERROR: 'canvas:error',
} as const;

export const CANVAS_CONFIG = {
  WIDTH: 1000,
  HEIGHT: 700,
  MAX_SHAPES: 12,
  MAX_LABEL_LENGTH: 2,
  DEFAULT_CIRCLE_RADIUS: 30,
  DEFAULT_RECT_WIDTH: 80,
  DEFAULT_RECT_HEIGHT: 60,
} as const;

export const NODE_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
] as const;
