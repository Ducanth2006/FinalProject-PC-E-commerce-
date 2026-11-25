import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from '@/module/catalog/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Product])],
})
export class InventoryModule {}
