import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { API_KEY_NAME, API_KEY_TYPE } from './auth/auth.consts';
import { CommonConfigService } from './common/common.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const commonConfigService = app.get(CommonConfigService);

  const config = new DocumentBuilder()
    .setTitle('ShareX API')
    .setDescription('API for personal sharex server.')
    .setVersion('1.0')
    .addApiKey(
      { type: API_KEY_TYPE, name: API_KEY_NAME, in: 'header' },
      API_KEY_NAME,
    )
    .addServer(commonConfigService.apiUrl)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}

bootstrap();
