import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  const configService = app.get(ConfigService);

  const port = Number(configService.get<number>('BACKEND_PORT') || 3000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
