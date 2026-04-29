import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const configuredPort = configService.get<string>('PORT');
  const port = configuredPort === undefined ? 3000 : Number(configuredPort);

  await app.listen(port);
}
bootstrap();
