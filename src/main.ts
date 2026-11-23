import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //setup access for public folder
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public',
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  //setup swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Course API')
    .setDescription('PR5: CRD Comments on Articles')
    .setVersion('1.5')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
