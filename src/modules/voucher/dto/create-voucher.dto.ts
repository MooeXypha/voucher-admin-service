import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({ example: 'Kyaw Kyaw', description: 'The name of the voucher' })
  @IsString()
  buyerName: string;

  @ApiProperty({
    example: '0912345678',
    description: 'The phone number of the buyer',
  })
  @IsString()
  buyerPhoneNo: string;

  @ApiPropertyOptional({
    example: 'Special discount',
    description: 'Optional description of the voucher',
  })
  @IsString()
  serviceType?: string;

  @ApiProperty({
    example: 'over 15k',
    description: 'The condition for the account type',
  })
  @IsString()
  accountCategory: string;

  @ApiProperty({
    example: '@username',
    description: 'The username of the buyer',
  })
  @IsString()
  accountUsername: string;

  @ApiProperty({ example: '10000', description: 'The value of the voucher' })
  @IsString()
  amountPaid: string;

  @ApiProperty({ example: 'true', description: 'Prepaid is true or false' })
  @IsBoolean()
  prepaid: boolean;

  @ApiProperty({ example: 'K Pay', description: 'The payment method used' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    example: '2024-06-01T12:00:00Z',
    description: 'The date and time of the purchase',
  })
  @IsDateString()
  paymentDate: Date;

  @ApiPropertyOptional({
    example: 'remark',
    description: 'Optional remark about the voucher',
  })
  @IsString()
  remark?: string;
}
