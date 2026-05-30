import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AiService } from '../ai/ai.service';
import { SOCKET_EVENTS } from '../../shared/constants';
import type { GenerateCanvasRequest, NodeMovePayload, ShapeNode } from '../../shared/types';

@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'] },
})
export class CanvasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CanvasGateway.name);
  // In-memory canvas state — shared across all connected clients
  private currentNodes: ShapeNode[] = [];

  constructor(private readonly aiService: AiService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    // Sync new client to current canvas state immediately
    if (this.currentNodes.length > 0) {
      client.emit(SOCKET_EVENTS.CANVAS_GENERATED, {
        nodes: this.currentNodes,
        prompt: 'restored',
      });
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.CANVAS_GENERATE)
  async handleGenerate(
    @MessageBody() data: GenerateCanvasRequest,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!data?.prompt?.trim()) {
      client.emit(SOCKET_EVENTS.ERROR, { message: 'Prompt cannot be empty' });
      return;
    }

    try {
      this.logger.log(`Generating canvas for: "${data.prompt}"`);
      const nodes = await this.aiService.generateNodes(data.prompt);
      this.currentNodes = nodes;

      // Broadcast to ALL clients including sender
      this.server.emit(SOCKET_EVENTS.CANVAS_GENERATED, { nodes, prompt: data.prompt });
    } catch (err) {
      this.logger.error('Generation failed', err);
      client.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to generate canvas. Try again.' });
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.NODE_MOVE)
  handleNodeMove(
    @MessageBody() payload: NodeMovePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!payload?.id || payload.x === undefined || payload.y === undefined) return;

    // Update server-side state
    this.currentNodes = this.currentNodes.map((n) =>
      n.id === payload.id ? { ...n, x: payload.x, y: payload.y } : n,
    );

    // Broadcast to all OTHER clients (sender has optimistic update already)
    client.broadcast.emit(SOCKET_EVENTS.NODE_MOVED, payload);
  }
}
