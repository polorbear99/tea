import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('login')
  async login(@Body() body: { open_id: string; union_id?: string; nickname?: string; avatar_url?: string }) {
    const customer = await this.customersService.findOrCreate(body.open_id, body.union_id, body.nickname, body.avatar_url);
    return { code: 200, msg: 'success', data: customer };
  }

  @Get()
  async findById(@Query('id') id: string) {
    if (!id) return { code: 400, msg: '缺少id参数', data: null };
    const customer = await this.customersService.findById(id);
    if (!customer) return { code: 404, msg: '用户不存在', data: null };
    return { code: 200, msg: 'success', data: customer };
  }
}
