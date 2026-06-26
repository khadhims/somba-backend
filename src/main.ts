import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { GlobalResponseInterceptor } from './common/interceptors/global-response.interceptor';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { registerMediaProxy } from './common/modules/media-proxy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Ensure uploads directory exists
  const uploadsDir = join(__dirname, '..', 'uploads/alerts');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Security & Middleware
  app.use(cookieParser());
  const corsOrigins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Media proxy — streams private S3 objects to the browser. Registered on the
  // raw Express instance (see registerMediaProxy for the rationale).
  registerMediaProxy(app);

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const swaggerEnabled =
    configService.get<boolean>('SWAGGER_ENABLED') ?? nodeEnv !== 'production';

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Somba API')
      .setDescription('The Somba Backend API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
}
bootstrap();
