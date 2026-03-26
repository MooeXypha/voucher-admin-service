import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginateDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  orderBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  search?: string;

  @IsOptional()
  @IsNumber()
  @Transform((params) => Number(params?.value))
  @ApiProperty({ type: Number, required: false })
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform((params) => Number(params.value))
  @ApiProperty({ type: Number, required: false })
  offset?: number = 0;
}
