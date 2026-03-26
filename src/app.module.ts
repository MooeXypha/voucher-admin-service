import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { VoucherModule } from './modules/voucher/voucher.module';
import { HealthModule } from './shared/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { PrismaService } from './shared/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      // isGlobal: true,
      // Cache environment variables
      cache: true,
      // Load custom configuration file
      load: [configuration],
      // Disable env variables loading in production from `.env` file
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? true : false,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
          // Use `pino-pretty` for pretty-printing logs in development
          // Use axiomhq/pino for structured logging in production
          transport:
            process.env.NODE_ENV === 'production'
              ? {
                  target: '@axiomhq/pino',
                  options: {
                    dataset: configService.get<string>('axiom.dataset'),
                    token: configService.get<string>('axiom.token'),
                  },
                }
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
        },
      }),
    }),

    HealthModule,

    // Resources

    PrismaModule,
    VoucherModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
