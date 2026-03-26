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

  /**
   * Cross-origin resource sharing (CORS) is a mechanism that allows resources
   * to be requested from another domain.
   */
  app.enableCors();

  /**
   * To protect from some well-known web vulnerabilities by setting
   * HTTP headers appropriately.
   */
  app.use(helmet());

  /**
   * An HTTP cookie is a small piece of data stored by the user's browser.
   * Cookies were designed to be a reliable mechanism for websites to remember
   * stateful information. When the user visits the website again, the cookie
   * is automatically sent with the request.
   *
   * Required dependency for CSRF protection, `csrf-csrf`, should be registered
   * before Double CSRF.
   */
  app.use(cookieParser());

  /**
   * Versioning allows you to have different versions of your controllers or
   * individual routes running within the same application. Applications change
   * very often and it is not unusual that there are breaking changes that you
   * need to make while still needing to support the previous version of the
   * application.
   */
  app.enableVersioning({
    /**
     * Enable URI versioning (default), passed within the URI of the request,
     * such as `https://example.com/v1/route`.
     *
     * Read: https://docs.nestjs.com/techniques/versioning#uri-versioning-type
     */
    type: VersioningType.URI,
    /**
     * Version "Neutral"
     * -----------------
     *
     * Some controllers or routes may not care about the version and would have
     * the same functionality regardless of the version. To accommodate this,
     * the version can be set to `VERSION_NEUTRAL` symbol.
     *
     * An incoming request will be mapped to a `VERSION_NEUTRAL` controller or
     * route regardless of the version sent in the request in addition to if the
     * request does not contain a version at all.
     *
     * Read: https://docs.nestjs.com/techniques/versioning#version-neutral
     *
     * Global default version
     * ----------------------
     *
     * If you do not want to provide a version for each controller/or individual
     * routes, or if you want to have a specific version set as the default
     * version for every controller/route that don't have the version specified,
     * you could set the `defaultVersion` as follows:
     *
     * Read: https://docs.nestjs.com/techniques/versioning#global-default-version
     */
    defaultVersion: VERSION_NEUTRAL,
  });

  /**
   * Global scoped pipes
   * -------------------
   *
   * Since the ValidationPipe was created to be as generic as possible, we can
   * realize it's full utility by setting it up as a global-scoped pipe so that
   * it is applied to every route handler across the entire application.
   *
   * Read: https://docs.nestjs.com/pipes#global-scoped-pipes
   */
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * If set to true, validator will strip validated (returned) object of any
       * properties that do not use any validation decorators.
       *
       * Read: https://docs.nestjs.com/techniques/validation#stripping-properties
       */
      whitelist: true,
      /**
       * If set to true, instead of stripping non-whitelisted properties
       * validator will throw an exception.
       */
      forbidNonWhitelisted: true,
      /**
       * Transform payload objects, payloads coming in over the network are
       * plain JavaScript objects. The ValidationPipe can automatically
       * transform payloads to be objects typed according to their DTO classes.
       * To enable auto-transformation, set transform to true. This can be done
       * at a method level or enable globally like below.
       *
       * Read: https://docs.nestjs.com/techniques/validation#transform-payload-objects
       */
      transform: true,
    }),
  );

  // Initialize Swagger using `SwaggerModule` class
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest API')
    .setDescription('Core API engine for Nest apps')
    .setVersion('0.0.1')
    // .addApiKey(
    //   {
    //     type: 'apiKey',
    //     name: 'x-api-key',
    //     in: 'header',
    //   },
    //   'x-api-key',
    // )
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //   },
    //   'jwt',
    // )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  // Get environment variables from custom configuration file
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  console.log('port :>> ', port);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
