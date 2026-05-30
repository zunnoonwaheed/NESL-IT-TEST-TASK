import { socket } from '../socket';
import { SOCKET_EVENTS } from '../shared/constants';
import type { NodeMovePayload } from '../shared/types';

export const canvasService = {
  generate(prompt: string): void {
    socket.emit(SOCKET_EVENTS.CANVAS_GENERATE, { prompt });
  },

  moveNode(payload: NodeMovePayload): void {
    socket.emit(SOCKET_EVENTS.NODE_MOVE, payload);
  },
};
