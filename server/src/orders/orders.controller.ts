import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() body: {
    customer_id: string;
    items: Array<{ product_id: string; sku_id: string; quantity: number }>;
    address_name?: string;
    address_phone?: string;
    address_detail?: string;
    remark?: string;
  }) {
    const order = await this.ordersService.create(body);
    return { code: 200, msg: 'success', data: order };
  }

  @Get()
  async findByCustomer(
    @Query('customer_id') customer_id: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('page_size') page_size?: string,
  ) {
    if (!customer_id) {
      return { code: 400, msg: '缺少customer_id参数', data: null };
    }
    return this.ordersService.findByCustomer(
      customer_id,
      status,
      page ? parseInt(page, 10) : 1,
      page_size ? parseInt(page_size, 10) : 20,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      return { code: 404, msg: '订单不存在', data: null };
    }
    return { code: 200, msg: 'success', data: order };
  }
}
