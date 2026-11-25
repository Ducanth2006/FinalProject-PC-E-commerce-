import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/module/user/entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { ProductPromotion } from '../product-promotions/entities/product-promotion.entity';
import { ProductPromotionsService } from '../product-promotions/product-promotions.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        ...[Product, ProductImage, Category, Brand, User, ProductPromotion].map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: {},
        })),
        { provide: ProductPromotionsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
