import { Module } from '@nestjs/common';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [AiModule, WebSocketModule],
})
export class AppModule {}
