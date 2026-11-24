import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';
import { createSlug } from '../utils/create-slug';
import { handleUniqueViolation } from '../utils/handle-unique-violation';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/response-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Brand) private readonly brands: Repository<Brand>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    await requireActiveUser(this.users, userId);

    const name = dto.name.trim();
    const sku = dto.sku.trim();
    const slug = createSlug(name);
    const primaryCount = dto.images.filter((image) => image.isPrimary === true).length;
    if (primaryCount > 1) throw new BadRequestException('Chỉ được chọn tối đa một ảnh đại diện');

    try {
      const result = await this.products.manager.transaction(async (manager) => {
        const products = manager.getRepository(Product);
        const images = manager.getRepository(ProductImage);
        const categories = manager.getRepository(Category);
        const brands = manager.getRepository(Brand);

        const [category, brand] = await Promise.all([
          categories.findOne({ where: { id: dto.categoryId, isActive: true } }),
          brands.findOne({ where: { id: dto.brandId, isActive: true } }),
        ]);
        if (!category) throw new NotFoundException('Không tìm thấy danh mục đang hoạt động');
        if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu đang hoạt động');

        const product = await products.save(products.create({
          name,
          slug,
          sku,
          type: dto.type,
          categoryId: category.id,
          brandId: brand.id,
          specs: dto.specs ?? {},
          description: dto.description?.trim() || null,
          price: dto.price,
          createdBy: userId,
        }));

        const savedImages = await images.save(images.create(dto.images.map((image, index) => ({
          productId: product.id,
          imgUrl: image.imgUrl.trim(),
          altText: image.altText?.trim() || null,
          isPrimary: primaryCount === 0 ? index === 0 : image.isPrimary === true,
          displayOrder: image.displayOrder ?? index,
          createdBy: userId,
        }))));

        return { ...product, images: savedImages };
      });
      return plainToInstance(ProductResponseDto, result, { excludeExtraneousValues: true });
    } catch (error) {
      handleUniqueViolation(error, ['products_slug_active_unique', 'products_sku_active_unique'], 'Slug hoặc SKU sản phẩm đã được sử dụng');
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
