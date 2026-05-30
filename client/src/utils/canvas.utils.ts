import { CANVAS_CONFIG } from '../shared/constants';
import type { ShapeNode } from '../shared/types';

export function clampNodePosition(
  node: ShapeNode,
  x: number,
  y: number,
): { x: number; y: number } {
  if (node.type === 'circle') {
    const { radius } = node;
    return {
      x: Math.max(radius, Math.min(CANVAS_CONFIG.WIDTH - radius, x)),
      y: Math.max(radius, Math.min(CANVAS_CONFIG.HEIGHT - radius, y)),
    };
  } else {
    const { width, height } = node;
    return {
      x: Math.max(0, Math.min(CANVAS_CONFIG.WIDTH - width, x)),
      y: Math.max(0, Math.min(CANVAS_CONFIG.HEIGHT - height, y)),
    };
  }
}
