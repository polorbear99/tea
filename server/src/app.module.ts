import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ProductsModule } from '@/products/products.module';
import { OrdersModule } from '@/orders/orders.module';
import { AiModule } from '@/ai/ai.module';
import { CategoriesModule } from '@/categories/categories.module';
import { ShopModule } from '@/shop/shop.module';
import { CustomersModule } from '@/customers/customers.module';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    AiModule,
    CategoriesModule,
    ShopModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
