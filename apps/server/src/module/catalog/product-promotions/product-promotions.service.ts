import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { IsNull, MoreThan, Not, Repository } from "typeorm";
import { User } from "@/module/user/entities/user.entity";
import { requireActiveUser } from "@/common/utils/require-active-user";
import { validateBigintId } from "@/common/utils/validate-bigint-id";
import { parsePagination } from "@/common/utils/parse-pagination";
import { PaginatedResponse } from "@/common/types/paginationResponse.type";
import { Product } from "@/module/catalog/products/entities/product.entity";
import { ProductPromotion } from "./entities/product-promotion.entity";
import { CreateProductPromotionDto } from "./dto/create-product-promotion.dto";
import { UpdateProductPromotionDto } from "./dto/update-product-promotion.dto";
import { QueryProductPromotionDto } from "./dto/query-product-promotion.dto";
import { ProductPromotionResponseDto } from "./dto/response-product-promotion.dto";

@Injectable()
export class ProductPromotionsService {
  constructor(
    @InjectRepository(ProductPromotion) private readonly promotions: Repository<ProductPromotion>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateProductPromotionDto): Promise<ProductPromotionResponseDto> {
    await requireActiveUser(this.users, userId);
    validateBigintId(dto.productId, "ID sản phẩm");
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    this.validatePeriod(startAt, endAt);

    const saved = await this.promotions.manager.transaction(async (manager) => {
      const products = manager.getRepository(Product);
      const promotions = manager.getRepository(ProductPromotion);
      const product = await products.findOne({
        where: { id: dto.productId, isActive: true },
        lock: { mode: "pessimistic_write" },// tác dụng là khó product này lại đợi transaction commit or rôl back tránh 2 request tạo 2 promotion cùng 1 lúc  
      });
      if (!product) throw new NotFoundException("Không tìm thấy sản phẩm đang hoạt động");
      this.validateSalePrice(dto.salePrice, product.price);

      const existing = await promotions.findOne({
        where: { productId: product.id, isActive: true, endAt: MoreThan(new Date()) },
      });
      if (existing) {
        throw new ConflictException("Sản phẩm đã có promotion đang bật và chưa hết hạn");
      }

      return promotions.save(promotions.create({
        productId: product.id,
        salePrice: dto.salePrice,
        startAt,
        endAt,
        createdBy: userId,
      }));
    });
    return plainToInstance(ProductPromotionResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(filters: QueryProductPromotionDto = {}): Promise<PaginatedResponse<ProductPromotionResponseDto>> {
    const { page, pageSize, skip } = parsePagination(filters.page, filters.pageSize);
    const query = this.promotions.createQueryBuilder("promotion")
      .where("promotion.isActive = :active", { active: true });
    if (filters.productId !== undefined) {
      validateBigintId(filters.productId, "ID sản phẩm");
      query.andWhere("promotion.productId = :productId", { productId: filters.productId });
    }
    const productSlug = filters.productSlug?.trim();
    if (productSlug) {
      const escaped = productSlug.replace(/[\\%_]/g, "\\$&");
      query.innerJoin("promotion.product", "product")
        .andWhere("product.slug ILIKE :productSlug ESCAPE '\\'", { productSlug: `%${escaped}%` });
    }
    const [promotions, total] = await query
      .orderBy("promotion.startAt", "DESC")
      .addOrderBy("promotion.id", "DESC")
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();
    return {
      data: plainToInstance(ProductPromotionResponseDto, promotions, { excludeExtraneousValues: true }),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string): Promise<ProductPromotionResponseDto> {
    validateBigintId(id, "ID promotion");
    const promotion = await this.promotions.findOne({ where: { id, isActive: true } });
    if (!promotion) throw new NotFoundException("Không tìm thấy promotion đang hoạt động");
    return plainToInstance(ProductPromotionResponseDto, promotion, { excludeExtraneousValues: true });
  }

  async update(id: string, userId: string, dto: UpdateProductPromotionDto): Promise<ProductPromotionResponseDto> {
    validateBigintId(id, "ID promotion");
    await requireActiveUser(this.users, userId);

    const saved = await this.promotions.manager.transaction(async (manager) => {
      const promotions = manager.getRepository(ProductPromotion);
      const current = await promotions.findOne({ where: { id }, lock: { mode: "pessimistic_write" } });
      if (!current) throw new NotFoundException("Không tìm thấy promotion");
      if (!current.isActive) throw new ConflictException("Promotion không hoạt động");

      const products = manager.getRepository(Product);
      const product = await products.findOne({
        where: { id: current.productId, isActive: true },
        lock: { mode: "pessimistic_write" },
      });
      if (!product) throw new ConflictException("Sản phẩm của promotion không còn hoạt động");

      const salePrice = dto.salePrice ?? current.salePrice;
      const startAt = dto.startAt === undefined ? current.startAt : new Date(dto.startAt);
      const endAt = dto.endAt === undefined ? current.endAt : new Date(dto.endAt);
      const isActive = dto.isActive ?? current.isActive;
      this.validateSalePrice(salePrice, product.price);
      this.validatePeriod(startAt, endAt);

      if (isActive && endAt > new Date()) {
        const other = await promotions.findOne({
          where: { productId: product.id, isActive: true, endAt: MoreThan(new Date()), id: Not(id) },
        });
        if (other) {
          throw new ConflictException("Sản phẩm đã có promotion đang bật và chưa hết hạn");
        }
      }

      const result = await promotions.createQueryBuilder().update(ProductPromotion).set({
        salePrice,
        startAt,
        endAt,
        isActive,
        updatedBy: userId,
        version: () => '"version" + 1',
      }).where("id = :id AND version = :version AND is_active = true AND deleted_at IS NULL", {
        id,
        version: dto.version,
      }).execute();
      if (!result.affected) throw new ConflictException("Phiên bản promotion đã thay đổi, vui lòng tải lại");
      return promotions.findOneByOrFail({ id });
    });
    return plainToInstance(ProductPromotionResponseDto, saved, { excludeExtraneousValues: true });
  }

  async remove(id: string, userId: string): Promise<void> {
    validateBigintId(id, "ID promotion");
    await requireActiveUser(this.users, userId);
    await this.promotions.manager.transaction(async (manager) => {
      const promotions = manager.getRepository(ProductPromotion);
      const promotion = await promotions.findOne({ where: { id }, lock: { mode: "pessimistic_write" } });
      if (!promotion) throw new NotFoundException("Không tìm thấy promotion");
      const product = await manager.getRepository(Product).findOne({
        where: { id: promotion.productId },
        lock: { mode: "pessimistic_write" },
      });
      if (!product) throw new NotFoundException("Không tìm thấy sản phẩm của promotion");
      await promotions.update(
        { id, deletedAt: IsNull() },
        { deletedAt: () => "CURRENT_TIMESTAMP", deletedBy: userId, isActive: false },
      );
    });
  }

  private validateSalePrice(salePrice: string, productPrice: string): void {
    if (BigInt(salePrice) >= BigInt(productPrice)) {
      throw new BadRequestException("Giá khuyến mãi phải thấp hơn giá sản phẩm");
    }
  }

  private validatePeriod(startAt: Date, endAt: Date): void {
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
      throw new BadRequestException("Thời gian promotion không hợp lệ: startAt phải trước endAt");
    }
  }
}
