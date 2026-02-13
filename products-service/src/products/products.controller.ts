import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  getAllProducts(): string {
    console.info('Get all products');
    return 'Get all products';
  }
}
