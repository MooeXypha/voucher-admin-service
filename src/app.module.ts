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
      cache: true,
      load: [configuration],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const axiomToken = configService.get<string>('axiom.token');
        const axiomDataset = configService.get<string>('axiom.dataset');

        const useAxiom =
          process.env.NODE_ENV === 'production' && axiomToken && axiomDataset;

        return {
          pinoHttp: {
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

            transport: useAxiom
              ? {
                  target: '@axiomhq/pino',
                  options: {
                    dataset: axiomDataset,
                    token: axiomToken,
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
        };
      },
    }),

    HealthModule,
    PrismaModule,
    VoucherModule,
  ],

  providers: [PrismaService],
})
export class AppModule {}
