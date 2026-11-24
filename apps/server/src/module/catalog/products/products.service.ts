import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, IsNull, Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';
import { createSlug } from '../utils/create-slug';
import { handleUniqueViolation } from '../utils/handle-unique-violation';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductPromotion } from '../product-promotions/entities/product-promotion.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { ProductListItemDto } from './dto/product-list-item.dto';
import { ProductSort, QueryProductDto } from './dto/query-product.dto';
import { parsePagination } from '@/common/utils/parse-pagination';
import { PaginatedResponse } from '@/common/types/paginationResponse.type';
import { ProductPromotionsService } from '../product-promotions/product-promotions.service';
import { validateBigintId } from '@/common/utils/validate-bigint-id';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImages: Repository<ProductImage>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Brand) private readonly brands: Repository<Brand>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly productPromotions: ProductPromotionsService,
  ) {}

  async create(userId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    await requireActiveUser(this.users, userId);

    const name = dto.name.trim();
    const sku = dto.sku.trim();
    const slug = createSlug(name);
    const primaryCount = dto.images.filter((image) => image.isPrimary === true).length;
    if (primaryCount > 1) throw new BadRequestException('At most one primary image is allowed');

    try {
      const result = await this.products.manager.transaction(async (manager) => {
        const products = manager.getRepository(Product);
        const images = manager.getRepository(ProductImage);
        const categories = manager.getRepository(Category);
        const brands = manager.getRepository(Brand);

        const [category, brand] = await Promise.all([
          categories.findOne({ where: { id: dto.categoryId, isActive: true, deletedAt: IsNull() } }),
          brands.findOne({ where: { id: dto.brandId, isActive: true, deletedAt: IsNull() } }),
        ]);
        if (!category) throw new NotFoundException('Active category not found');
        if (!brand) throw new NotFoundException('Active brand not found');

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
      handleUniqueViolation(error, ['products_slug_active_unique', 'products_sku_active_unique'], 'Product slug or SKU is already in use');
    }
  }

  async findAll(filters: QueryProductDto = {}): Promise<PaginatedResponse<ProductListItemDto>> {
    const { page, pageSize, skip } = parsePagination(filters.page, filters.pageSize);
    if (pageSize > 50) throw new BadRequestException('Page size cannot exceed 50 products');
    const query = this.products.createQueryBuilder('product')
      .innerJoin('product.category', 'category', 'category.isActive = true AND category.deletedAt IS NULL')
      .innerJoin('product.brand', 'brand', 'brand.isActive = true AND brand.deletedAt IS NULL')
      .where('product.isActive = :active', { active: true });
    const now = new Date();

    if (filters.createdAfter && filters.createdBefore &&
        new Date(filters.createdAfter) >= new Date(filters.createdBefore)) {
      throw new BadRequestException('createdAfter must be earlier than createdBefore');
    }
    if (filters.createdAfter) {
      query.andWhere('product.createdAt >= :createdAfter', { createdAfter: new Date(filters.createdAfter) });
    }
    if (filters.createdBefore) {
      query.andWhere('product.createdAt < :createdBefore', { createdBefore: new Date(filters.createdBefore) });
    }

    const name = filters.name?.trim();
    if (name) {
      const escaped = name.replace(/[\\%_]/g, '\\$&');
      query.andWhere("product.name ILIKE :name ESCAPE '\\'", { name: `%${escaped}%` });
    }
    if (filters.type) query.andWhere('product.type = :type', { type: filters.type });
    if (filters.categorySlug?.trim()) {
      query.andWhere('category.slug = :categorySlug', { categorySlug: filters.categorySlug.trim() });
    }
    if (filters.brandSlug?.trim()) {
      query.andWhere('brand.slug = :brandSlug', { brandSlug: filters.brandSlug.trim() });
    }

    const currentPromotionExists = `EXISTS (
      SELECT 1 FROM product_promotions promotion
      WHERE promotion.product_id = product.id
        AND promotion.is_active = true
        AND promotion.deleted_at IS NULL
        AND promotion.start_at <= :promotionNow
        AND promotion.end_at > :promotionNow
    )`;
    if (filters.hasPromotion === 'true') {
      query.andWhere(currentPromotionExists, { promotionNow: now });
    } else if (filters.hasPromotion === 'false') {
      query.andWhere(`NOT ${currentPromotionExists}`, { promotionNow: now });
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined && BigInt(filters.minPrice) > BigInt(filters.maxPrice)) {
      throw new BadRequestException('minPrice cannot exceed maxPrice');
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const effectivePrice = `COALESCE((
        SELECT promotion.sale_price FROM product_promotions promotion
        WHERE promotion.product_id = product.id
          AND promotion.is_active = true
          AND promotion.deleted_at IS NULL
          AND promotion.start_at <= :promotionNow
          AND promotion.end_at > :promotionNow
        ORDER BY promotion.start_at DESC, promotion.id DESC
        LIMIT 1
      ), product.price)`;
      if (filters.minPrice !== undefined) {
        query.andWhere(`${effectivePrice} >= :minPrice`, { promotionNow: now, minPrice: filters.minPrice });
      }
      if (filters.maxPrice !== undefined) {
        query.andWhere(`${effectivePrice} <= :maxPrice`, { promotionNow: now, maxPrice: filters.maxPrice });
      }
    }

    switch (filters.sort ?? ProductSort.NAME_ASC) {
      case ProductSort.NEWEST:
        query.orderBy('product.createdAt', 'DESC');
        break;
      case ProductSort.PRICE_ASC:
      case ProductSort.PRICE_DESC: {
        const direction = filters.sort === ProductSort.PRICE_ASC ? 'ASC' : 'DESC';
        const effectivePrice = `COALESCE((
          SELECT promotion.sale_price FROM product_promotions promotion
          WHERE promotion.product_id = product.id
            AND promotion.is_active = true
            AND promotion.deleted_at IS NULL
            AND promotion.start_at <= :promotionNow
            AND promotion.end_at > :promotionNow
          ORDER BY promotion.start_at DESC, promotion.id DESC
          LIMIT 1
        ), product.price)`;
        query.setParameter('promotionNow', now).orderBy(effectivePrice, direction);
        break;
      }
      default:
        query.orderBy('product.name', 'ASC');
    }
    const [products, total] = await query
      .addOrderBy('product.id', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const primaryImages = products.length
      ? await this.productImages.createQueryBuilder('image')
        .select('image.productId', 'productId')
        .addSelect('image.imgUrl', 'imgUrl')
        .distinctOn(['image.productId'])
        .where('image.productId IN (:...productIds)', { productIds: products.map(({ id }) => id) })
        .andWhere('image.isActive = :imageActive', { imageActive: true })
        .orderBy('image.productId', 'ASC')
        .addOrderBy('image.isPrimary', 'DESC')
        .addOrderBy('image.displayOrder', 'ASC')
        .addOrderBy('image.id', 'ASC')
        .getRawMany<{ productId: string; imgUrl: string }>()
      : [];
    const imageByProductId = new Map(primaryImages.map(({ productId, imgUrl }) => [productId, imgUrl]));
    const promotionPriceByProductId = await this.productPromotions.getCurrentPrices(products.map(({ id }) => id), now);
    const data = products.map((product) => ({
      ...product,
      primaryImage: imageByProductId.get(product.id) ?? null,
      originalPrice: product.price,
      finalPrice: promotionPriceByProductId.get(product.id) ?? product.price,
    }));

    return {
      data: plainToInstance(ProductListItemDto, data, { excludeExtraneousValues: true }),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('Product ID must be a valid positive integer');
    }

    const product = await this.products.createQueryBuilder('product')
      .innerJoin('product.category', 'category', 'category.isActive = true AND category.deletedAt IS NULL')
      .innerJoin('product.brand', 'brand', 'brand.isActive = true AND brand.deletedAt IS NULL')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :active', { active: true })
      .andWhere('product.deletedAt IS NULL')
      .getOne();

    if (!product) throw new NotFoundException('Active product not found');

    const images = await this.productImages.find({
      where: { productId: product.id, isActive: true, deletedAt: IsNull() },
      order: { isPrimary: 'DESC', displayOrder: 'ASC', id: 'ASC' },
    });

    return plainToInstance(ProductResponseDto, { ...product, images }, { excludeExtraneousValues: true });
  }

  async update(id: string, userId: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    validateBigintId(id, 'Product ID');
    await requireActiveUser(this.users, userId);

    // check nullable = array 
    const nullableInput = dto as UpdateProductDto & { [key: string]: unknown };
    for (const field of ['name', 'sku', 'type', 'categoryId', 'brandId', 'specs', 'price']) {
      if (nullableInput[field] === null) throw new BadRequestException(`${field} cannot be null`);
    }
    if (nullableInput.images === null) throw new BadRequestException('images cannot be null');
    for (const image of dto.images ?? []) {
      for (const field of ['id', 'isDeleted', 'imgUrl', 'isPrimary', 'displayOrder']) {
        if ((image as unknown as Record<string, unknown>)[field] === null) {
          throw new BadRequestException(`Image ${field} cannot be null`);
        }
      }
    }
    // check product field update and images update if don't have throw error 
    const hasProductChanges = Object.entries(dto).some(([key, value]) => key !== 'images' && value !== undefined);
    const hasImageChanges = dto.images !== undefined && dto.images.length > 0;
    if (!hasProductChanges && !hasImageChanges) {
      throw new BadRequestException('Provide at least one product field or image change');
    }

    const imageIds = (dto.images ?? []).flatMap((image) => image.id ? [image.id] : []);
    imageIds.forEach((imageId) => validateBigintId(imageId, 'Product image ID'));
    if (new Set(imageIds).size !== imageIds.length) {
      throw new BadRequestException('Each product image ID can appear only once in an update');
    }
    if ((dto.images ?? []).some((image) => image.isDeleted === true && !image.id)) {
      throw new BadRequestException('An image ID is required to delete a product image');
    }
    if ((dto.images ?? []).filter((image) => image.isDeleted !== true && image.isPrimary === true).length > 1) {
      throw new BadRequestException('Only one product image can be marked as primary');
    }

    try {
      const updated = await this.products.manager.transaction(async (manager) => {
        const products = manager.getRepository(Product);
        const images = manager.getRepository(ProductImage);
        const categories = manager.getRepository(Category);
        const brands = manager.getRepository(Brand);
        const promotions = manager.getRepository(ProductPromotion);

        const product = await products.findOne({
          where: { id, isActive: true, deletedAt: IsNull() },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) throw new NotFoundException('Active product was not found');

        const [category, brand] = await Promise.all([
          dto.categoryId === undefined ? Promise.resolve(null) : categories.findOne({
            where: { id: dto.categoryId, isActive: true, deletedAt: IsNull() },
            lock: { mode: 'pessimistic_read' },
          }),
          dto.brandId === undefined ? Promise.resolve(null) : brands.findOne({
            where: { id: dto.brandId, isActive: true, deletedAt: IsNull() },
            lock: { mode: 'pessimistic_read' },
          }),
        ]);
        if (dto.categoryId !== undefined && !category) throw new NotFoundException('Active category was not found');
        if (dto.brandId !== undefined && !brand) throw new NotFoundException('Active brand was not found');

        const nextPrice = dto.price ?? product.price;
        const promotion = await promotions.createQueryBuilder('promotion')
          .where('promotion.productId = :productId', { productId: product.id })
          .andWhere('promotion.isActive = true')
          .andWhere('promotion.deletedAt IS NULL')
          .andWhere('promotion.endAt > :now', { now: new Date() })
          .orderBy('promotion.salePrice', 'DESC')
          .getOne();
        if (promotion && BigInt(nextPrice) <= BigInt(promotion.salePrice)) {
          const minimumPrice = BigInt(promotion.salePrice) + 1n;
          const increaseBy = minimumPrice - BigInt(nextPrice);
          throw new BadRequestException(
            `Product price must be greater than the enabled promotion price (${promotion.salePrice}). Enter at least ${minimumPrice.toString()} (increase the current value by at least ${increaseBy.toString()}).`,
          );
        }

        if (dto.images !== undefined && dto.images.length > 0) {
          const currentImages = await images.find({
            where: { productId: id, isActive: true, deletedAt: IsNull() },
            order: { displayOrder: 'ASC', id: 'ASC' },
            lock: { mode: 'pessimistic_write' },
          });
          const currentById = new Map(currentImages.map((image) => [image.id, image]));
          const deleteIds = (dto.images ?? [])
            .filter((image) => image.id && image.isDeleted === true)
            .map((image) => image.id as string);
          const referencedIds = imageIds.filter((imageId) => !deleteIds.includes(imageId));
          if (referencedIds.some((imageId) => !currentById.has(imageId)) ||
              deleteIds.some((imageId) => !currentById.has(imageId))) {
            throw new BadRequestException('One or more image IDs are inactive or do not belong to this product');
          }

          const oldPrimary = currentImages.find((image) => image.isPrimary);
          const oldPrimaryOrder = oldPrimary ? { displayOrder: oldPrimary.displayOrder, id: oldPrimary.id } : null;
          const deleteSet = new Set(deleteIds);
          if (currentImages.length - deleteIds.length + (dto.images ?? []).filter((image) => !image.id && image.isDeleted !== true).length > 10) {
            throw new BadRequestException('A product cannot have more than 10 active images');
          }
          if (currentImages.length) {
            await images.update(
              { productId: id, isActive: true, deletedAt: IsNull() },
              { isPrimary: false, updatedBy: userId },
            );
          }
          if (deleteIds.length) {
            await images.update(
              { id: In(deleteIds), productId: id, isActive: true, deletedAt: IsNull() },
              { isActive: false, deletedAt: () => 'CURRENT_TIMESTAMP', deletedBy: userId, updatedBy: userId },
            );
          }

          const payloadById = new Map((dto.images ?? []).filter((image) => image.id).map((image) => [image.id as string, image]));
          const keptImages = currentImages.filter((image) => !deleteSet.has(image.id));
          for (const image of keptImages) {
            const change = payloadById.get(image.id);
            image.isPrimary = false;
            image.updatedBy = userId;
            if (change?.imgUrl !== undefined) image.imgUrl = change.imgUrl.trim();
            if (change && change.altText !== undefined) image.altText = change.altText === null ? null : change.altText.trim() || null;
            if (change?.displayOrder !== undefined) image.displayOrder = change.displayOrder;
          }

          let nextOrder = currentImages.reduce((max, image) => Math.max(max, image.displayOrder), -1) + 1;
          const newImageInputs = (dto.images ?? []).filter((image) => !image.id && image.isDeleted !== true);
          const newImages = newImageInputs.map((image) => images.create({
            productId: id,
            imgUrl: image.imgUrl!.trim(),
            altText: image.altText === undefined || image.altText === null ? null : image.altText.trim() || null,
            isPrimary: false,
            displayOrder: image.displayOrder ?? nextOrder++,
            createdBy: userId,
            updatedBy: userId,
          }));
          const savedImages = await images.save([...keptImages, ...newImages]);
          const savedById = new Map(savedImages.map((image) => [image.id, image]));

          const requestedPrimary = (dto.images ?? []).find((image) => image.isDeleted !== true && image.isPrimary === true);
          let primary = requestedPrimary?.id
            ? savedById.get(requestedPrimary.id)
            : requestedPrimary
              ? savedImages[keptImages.length + newImageInputs.indexOf(requestedPrimary)]
              : undefined;
          const oldPrimaryChange = oldPrimary ? payloadById.get(oldPrimary.id) : undefined;
          const oldPrimaryRemains = oldPrimary && !deleteSet.has(oldPrimary.id) && oldPrimaryChange?.isPrimary !== false;
          if (!primary && oldPrimaryRemains) primary = savedById.get(oldPrimary.id);
          if (!primary && savedImages.length) {
            const ordered = [...savedImages].sort((left, right) => {
              const orderDiff = left.displayOrder - right.displayOrder;
              if (orderDiff !== 0) return orderDiff;
              return BigInt(left.id) < BigInt(right.id) ? -1 : BigInt(left.id) > BigInt(right.id) ? 1 : 0;
            });
            if (oldPrimaryOrder) {
              primary = ordered.find((image) => image.displayOrder > oldPrimaryOrder.displayOrder ||
                (image.displayOrder === oldPrimaryOrder.displayOrder && BigInt(image.id) > BigInt(oldPrimaryOrder.id))) ?? ordered[0];
            } else {
              primary = ordered[0];
            }
          }
          if (primary) await images.update({ id: primary.id, productId: id }, { isPrimary: true, updatedBy: userId });
        }

        const changes: Partial<Product> = { updatedBy: userId };
        if (dto.name !== undefined) {
          changes.name = dto.name.trim();
          changes.slug = createSlug(changes.name);
        }
        if (dto.sku !== undefined) changes.sku = dto.sku.trim();
        if (dto.type !== undefined) changes.type = dto.type;
        if (category) changes.categoryId = category.id;
        if (brand) changes.brandId = brand.id;
        if (dto.specs !== undefined) changes.specs = dto.specs;
        if (dto.description !== undefined) changes.description = dto.description === null ? null : dto.description.trim() || null;
        if (dto.price !== undefined) changes.price = dto.price;

        const savedProduct = await products.save(products.merge(product, changes));
        const activeImages = await images.find({
          where: { productId: id, isActive: true, deletedAt: IsNull() },
          order: { isPrimary: 'DESC', displayOrder: 'ASC', id: 'ASC' },
        });
        return { ...savedProduct, images: activeImages };
      });
      return plainToInstance(ProductResponseDto, updated, { excludeExtraneousValues: true });
    } catch (error) {
      handleUniqueViolation(error, ['products_slug_active_unique', 'products_sku_active_unique'], 'Product slug or SKU is already in use');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
