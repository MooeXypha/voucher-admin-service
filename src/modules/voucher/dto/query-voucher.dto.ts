import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Prisma } from 'generated/prisma/browser';
import { PaginateDto } from 'src/common/paginate.dto';
import { getOrderBy } from 'src/common/sort-order';

export class QueryVoucherDto extends PartialType(PaginateDto) {
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @Transform(({ value }) => getOrderBy(value))
  orderby?: Prisma.VoucherOrderByWithRelationInput;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  prepaid?: boolean;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  accountCategory?: string;
}
