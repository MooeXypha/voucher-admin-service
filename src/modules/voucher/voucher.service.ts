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
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);
    const orderBy = query.orderby ?? { createdAt: 'desc' as const };

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

    const [total, data] = await this.prisma.$transaction([
      this.prisma.voucher.count({ where }),
      this.prisma.voucher.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
      }),
    ]);

    return {
      data,
      total,
      offset,
      limit,
    };
  }

  async findOne(id: number) {
    const voucher = await this.prisma.voucher.findFirstOrThrow({
      where: { id, deletedAt: null },
    });
    return voucher;
  }

  async findTotalIncomePerMonth() {
    const year = new Date().getFullYear();
    const now = new Date();
    const currentMonth = now.getMonth();

    const totals = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const vouchers = await this.prisma.voucher.findMany({
          where: {
            paymentDate: {
              gte: new Date(year, i, 1),
              lte: new Date(year, i + 1, 0, 23, 59, 59, 999),
            },
          },
          select: { amountPaid: true },
        });
        return vouchers.reduce(
          (sum, v) => sum + (parseFloat(v.amountPaid) || 0),
          0,
        );
      }),
    );

    const currentTotal = totals[currentMonth];
    const lastTotal = totals[currentMonth - 1] || 0;
    const percent =
      lastTotal === 0
        ? 0
        : Math.round(((currentTotal - lastTotal) / lastTotal) * 100);

    return {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      series: totals.map((t) => Math.round(t / 10000)),
      total: totals.reduce((sum, t) => sum + t, 0),
      percent,
    };
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
