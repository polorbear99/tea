import { Controller, Get } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('config')
  async getConfig() {
    const config = await this.shopService.getConfig();
    return { code: 200, msg: 'success', data: config };
  }
}
