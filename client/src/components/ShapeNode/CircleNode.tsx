import React, { memo, useCallback } from 'react';
import { Group, Circle, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CircleNode as CircleNodeType } from '../../shared/types';
import { useCanvasStore } from '../../store/canvas.store';
import { canvasService } from '../../services/canvas.service';
import { clampNodePosition } from '../../utils/canvas.utils';

interface Props {
  node: CircleNodeType;
}

const CircleNode: React.FC<Props> = memo(({ node }) => {
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

  const color = node.color ?? '#6366f1';

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
      {/* Selection ring */}
      {isSelected && (
        <>
          <Circle
            radius={node.radius + 18}
            fill="transparent"
            stroke="#ffffff"
            strokeWidth={3}
            opacity={0.6}
            dash={[8, 4]}
          />
          <Circle
            radius={node.radius + 15}
            fill="transparent"
            stroke={color}
            strokeWidth={2}
            opacity={0.8}
          />
        </>
      )}
      {/* Outer glow ring */}
      <Circle
        radius={node.radius + 12}
        fill="transparent"
        stroke={color}
        strokeWidth={2}
        opacity={isSelected ? 0.3 : 0.15}
      />
      <Circle
        radius={node.radius + 6}
        fill="transparent"
        stroke={color}
        strokeWidth={1}
        opacity={isSelected ? 0.4 : 0.25}
      />
      {/* Main circle with gradient effect */}
      <Circle
        radius={node.radius}
        fill={color}
        shadowColor={color}
        shadowBlur={25}
        shadowOpacity={0.6}
      />
      {/* Inner highlight */}
      <Circle
        radius={node.radius * 0.7}
        fill="rgba(255,255,255,0.15)"
        offsetY={-node.radius * 0.15}
      />
      {/* Label */}
      <Text
        text={node.label}
        fill="#ffffff"
        fontSize={node.radius < 25 ? 12 : 15}
        fontFamily="'DM Sans', sans-serif"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={node.radius * 2}
        height={node.radius * 2}
        offsetX={node.radius}
        offsetY={node.radius}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={2}
      />
    </Group>
  );
});

CircleNode.displayName = 'CircleNode';
export default CircleNode;
