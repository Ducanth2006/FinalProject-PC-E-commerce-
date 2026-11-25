import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { User } from '@/module/user/entities/user.entity';
import { ProductPromotionsModule } from '../product-promotions/product-promotions.module';
import { PcBundleComponent } from '@/module/pc-bundle-components/entities/pc-bundle-component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Category, Brand, User, PcBundleComponent]), ProductPromotionsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
