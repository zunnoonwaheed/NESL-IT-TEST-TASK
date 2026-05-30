import { useEffect } from 'react';
import { socket } from '../socket';
import { useCanvasStore } from '../store/canvas.store';
import { SOCKET_EVENTS } from '../shared/constants';
import type { GenerateCanvasResponse, NodeMovePayload } from '../shared/types';

export function useSocket(): void {
  const { setNodes, moveNode, setGenerating, setConnectionStatus, setError } =
    useCanvasStore();

  useEffect(() => {
    const onConnect = (): void => setConnectionStatus('connected');
    const onDisconnect = (): void => setConnectionStatus('disconnected');
    const onReconnecting = (): void => setConnectionStatus('reconnecting');

    const onCanvasGenerated = (data: GenerateCanvasResponse): void => {
      setNodes(data.nodes);
      setGenerating(false);
    };

    const onNodeMoved = (payload: NodeMovePayload): void => {
      moveNode(payload);
    };

    const onError = (data: { message: string }): void => {
      setError(data.message);
      setGenerating(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnecting', onReconnecting);
    socket.on(SOCKET_EVENTS.CANVAS_GENERATED, onCanvasGenerated);
    socket.on(SOCKET_EVENTS.NODE_MOVED, onNodeMoved);
    socket.on(SOCKET_EVENTS.ERROR, onError);

    if (socket.connected) setConnectionStatus('connected');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnecting', onReconnecting);
      socket.off(SOCKET_EVENTS.CANVAS_GENERATED, onCanvasGenerated);
      socket.off(SOCKET_EVENTS.NODE_MOVED, onNodeMoved);
      socket.off(SOCKET_EVENTS.ERROR, onError);
    };
  }, [setNodes, moveNode, setGenerating, setConnectionStatus, setError]);
}
