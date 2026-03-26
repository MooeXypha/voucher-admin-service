import { Injectable } from '@nestjs/common';
import { GenerateVoucher } from 'src/common/utils/generate-voucher';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma, Voucher } from '../../../generated/prisma/client';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVoucherDto): Promise<Voucher> {
    const todayCode = GenerateVoucher.encryptDate();
    const latest = await this.prisma.voucher.findFirst({
      where: {
        voucherNo: {
          startsWith: `PBV-${todayCode}`,
        },
      },
      orderBy: {
        voucherNo: 'desc',
      },
    });
    const lastNo = latest?.voucherNo
      ? GenerateVoucher.getRunningNo(latest.voucherNo)
      : 0;
    const voucherNo = GenerateVoucher.generateVoucherNo('PBV', lastNo);

    return this.prisma.voucher.create({
      data: {
        ...data,
        voucherNo,
        paymentDate: new Date(data.paymentDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll(query: QueryVoucherDto) {
    let where: Prisma.VoucherWhereInput = { deletedAt: null };
    if (query?.search) {
      where = {
        ...where,
        OR: [
          { voucherNo: { contains: query.search, mode: 'insensitive' } },
          { buyerName: { contains: query.search, mode: 'insensitive' } },
          { buyerPhoneNo: { contains: query.search, mode: 'insensitive' } },
          { accountUsername: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }
    const total = await this.prisma.voucher.count({ where });
    const data = await this.prisma.voucher.findMany({
      where,
      take: query.limit,
      skip: query.offset,
      orderBy: query.orderby,
    });
    return {
      data,
      total,
      offset: query.offset,
      limit: query.limit,
    };
  }

  async findOne(id: number) {
    const voucher = await this.prisma.voucher.findFirstOrThrow({
      where: { id, deletedAt: null },
    });
    return voucher;
  }

  async update(id: number, data: UpdateVoucherDto): Promise<Voucher> {
    const existing = await this.prisma.voucher.findFirstOrThrow({
      where: { id, deletedAt: null },
    });
    return this.prisma.voucher.update({
      where: { id: existing.id },
      data: {
        buyerName: data.buyerName,
        buyerPhoneNo: data.buyerPhoneNo,
        serviceType: data.serviceType,
        accountCategory: data.accountCategory,
        accountUsername: data.accountUsername,
        amountPaid: data.amountPaid,
        prepaid: data.prepaid,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        remark: data.remark,
        updatedAt: new Date(),
      },
    });
  }

  remove(id: number) {
    return this.prisma.voucher.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
