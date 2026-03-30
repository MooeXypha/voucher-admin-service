import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherService } from './voucher.service';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  findAll(@Query() query: QueryVoucherDto) {
    return this.voucherService.findAll(query);
  }

  @Get('total-income')
  findTotalIncomePerMonth() {
    return this.voucherService.findTotalIncomePerMonth();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voucherService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.voucherService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voucherService.remove(id);
  }
}
