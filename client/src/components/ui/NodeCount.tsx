import React from 'react';
import { useCanvasStore } from '../../store/canvas.store';
import { CANVAS_CONFIG } from '../../shared/constants';

const NodeCount: React.FC = () => {
  const count = useCanvasStore((s) => s.nodes.length);

  return <>{count} / {CANVAS_CONFIG.MAX_SHAPES}</>;
};

export default NodeCount;
