import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';

@Module({
  imports: [PrismaModule],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
