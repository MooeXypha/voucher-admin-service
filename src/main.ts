import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  /**
   * CORS configuration
   */
  const allowedOrigins = configService.get<string[]>('cors.origins') ?? ['*'];

  app.enableCors({
    origin: (origin, callback) => {
      // allow server-to-server calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  /**
   * Security middlewares
   */
  app.use(helmet());
  app.use(cookieParser());

  /**
   * API Versioning
   * example: /v1/voucher
   */
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  /**
   * Validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Swagger setup
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Voucher API')
    .setDescription('Voucher Admin Service API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  /**
   * IMPORTANT for Render
   */
  const port = process.env.PORT || 4000;

  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(`📄 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
