import React, { memo, useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { RectangleNode as RectangleNodeType } from '../../shared/types';
import { useCanvasStore } from '../../store/canvas.store';
import { canvasService } from '../../services/canvas.service';
import { clampNodePosition } from '../../utils/canvas.utils';

interface Props {
  node: RectangleNodeType;
}

const RectangleNode: React.FC<Props> = memo(({ node }) => {
  const moveNode = useCanvasStore((s) => s.moveNode);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);

  const isSelected = selectedNodeId === node.id;

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const target = e.target;
      const { x, y } = clampNodePosition(node, target.x(), target.y());
      target.x(x);
      target.y(y);
      moveNode({ id: node.id, x, y });
    },
    [node, moveNode],
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const clamped = clampNodePosition(node, e.target.x(), e.target.y());
      canvasService.moveNode({ id: node.id, ...clamped });
    },
    [node],
  );

  const handleClick = useCallback(() => {
    setSelectedNode(node.id);
  }, [node.id, setSelectedNode]);

  const color = node.color ?? '#8b5cf6';

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection border */}
      {isSelected && (
        <>
          <Rect
            width={node.width + 20}
            height={node.height + 20}
            offsetX={10}
            offsetY={10}
            fill="transparent"
            stroke="#ffffff"
            strokeWidth={3}
            cornerRadius={14}
            opacity={0.6}
            dash={[8, 4]}
          />
          <Rect
            width={node.width + 16}
            height={node.height + 16}
            offsetX={8}
            offsetY={8}
            fill="transparent"
            stroke={color}
            strokeWidth={2}
            cornerRadius={12}
            opacity={0.8}
          />
        </>
      )}
      {/* Outer glow */}
      <Rect
        width={node.width + 16}
        height={node.height + 16}
        offsetX={8}
        offsetY={8}
        fill="transparent"
        stroke={color}
        strokeWidth={2}
        cornerRadius={12}
        opacity={isSelected ? 0.3 : 0.2}
      />
      <Rect
        width={node.width + 8}
        height={node.height + 8}
        offsetX={4}
        offsetY={4}
        fill={color}
        cornerRadius={10}
        opacity={isSelected ? 0.3 : 0.2}
        shadowColor={color}
        shadowBlur={30}
        shadowOpacity={0.5}
      />
      {/* Main rectangle */}
      <Rect
        width={node.width}
        height={node.height}
        fill={color}
        cornerRadius={10}
        shadowColor={color}
        shadowBlur={20}
        shadowOpacity={0.4}
      />
      {/* Top highlight bar */}
      <Rect
        width={node.width - 20}
        height={3}
        x={10}
        y={8}
        fill="rgba(255,255,255,0.25)"
        cornerRadius={2}
      />
      {/* Label */}
      <Text
        text={node.label}
        fill="#ffffff"
        fontSize={14}
        fontFamily="'DM Sans', sans-serif"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={node.width}
        height={node.height}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={2}
      />
    </Group>
  );
});

RectangleNode.displayName = 'RectangleNode';
export default RectangleNode;
