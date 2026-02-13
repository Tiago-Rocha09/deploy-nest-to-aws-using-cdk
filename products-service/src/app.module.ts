import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [HealthModule, ProductsModule],
})
export class AppModule {}
