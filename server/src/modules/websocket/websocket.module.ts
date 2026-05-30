import { Module } from '@nestjs/common';
import { CanvasGateway } from './canvas.gateway';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [CanvasGateway],
})
export class WebSocketModule {}
