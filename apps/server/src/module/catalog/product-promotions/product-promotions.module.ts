import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/module/user/entities/user.entity";
import { Product } from "@/module/catalog/products/entities/product.entity";
import { ProductPromotion } from "./entities/product-promotion.entity";
import { ProductPromotionsController } from "./product-promotions.controller";
import { ProductPromotionsService } from "./product-promotions.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProductPromotion, Product, User])],
  controllers: [ProductPromotionsController],
  providers: [ProductPromotionsService],
  exports: [ProductPromotionsService],
})
export class ProductPromotionsModule {}
