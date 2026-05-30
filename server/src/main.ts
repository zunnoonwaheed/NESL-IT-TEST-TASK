import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  });

  await app.listen(config.port);
  console.log(`🚀 Canvas server running on http://localhost:${config.port}`);
}

bootstrap();
