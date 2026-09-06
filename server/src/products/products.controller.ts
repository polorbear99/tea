import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('category_id') category_id?: string,
    @Query('tea_type') tea_type?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('page_size') page_size?: string,
  ) {
    return this.productsService.findAll({
      category_id,
      tea_type,
      keyword,
      page: page ? parseInt(page, 10) : 1,
      page_size: page_size ? parseInt(page_size, 10) : 20,
    });
  }

  @Get('recommendations')
  async getRecommendations(@Query('limit') limit?: string) {
    return this.productsService.getRecommendations(limit ? parseInt(limit, 10) : 6);
  }

  @Get('qr/:code')
  async findByQrCode(@Param('code') code: string) {
    const product = await this.productsService.findByQrCode(code);
    if (!product) {
      return { code: 404, msg: '商品不存在或二维码无效', data: null };
    }
    return { code: 200, msg: 'success', data: product };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    if (!product) {
      return { code: 404, msg: '商品不存在', data: null };
    }
    return { code: 200, msg: 'success', data: product };
  }
}
