import React, { memo, useEffect, useCallback, useState, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasStore } from '../../store/canvas.store';
import { ShapeType } from '../../shared/types';
import CircleNode from '../ShapeNode/CircleNode';
import RectangleNode from '../ShapeNode/RectangleNode';
import CanvasEmpty from './CanvasEmpty';
import CanvasLoading from './CanvasLoading';

const Canvas: React.FC = memo(() => {
  const nodes          = useCanvasStore((s) => s.nodes);
  const isGenerating   = useCanvasStore((s) => s.isGenerating);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const deleteNode     = useCanvasStore((s) => s.deleteNode);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });

  // Calculate scale to fit content in smaller viewports
  const scale = Math.min(dimensions.width / 1000, dimensions.height / 700, 1);

  /* ── Measure container size ── */
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(containerRef.current);

    // Initial size
    updateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
      if (e.key === 'Escape' && selectedNodeId) {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [selectedNodeId, deleteNode, setSelectedNode]);

  /* ── Deselect on background click ── */
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) setSelectedNode(null);
    },
    [setSelectedNode],
  );

  return (
    <div
      ref={containerRef}
      className="canvas-container canvas-grid"
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        minHeight: '400px'
      }}
    >
      {/* Konva Stage */}
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer
          x={dimensions.width / 2}
          y={dimensions.height / 2}
          scaleX={scale}
          scaleY={scale}
          offsetX={500}
          offsetY={350}
        >
          {nodes.map((node) => {
            if (node.type === ShapeType.Circle) {
              return <CircleNode key={node.id} node={node} />;
            }
            if (node.type === ShapeType.Rectangle) {
              return <RectangleNode key={node.id} node={node} />;
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Overlays */}
      {isGenerating && <CanvasLoading />}
      {!isGenerating && nodes.length === 0 && <CanvasEmpty />}
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;