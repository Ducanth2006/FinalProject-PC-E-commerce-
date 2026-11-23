import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IsNull, Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';
import { validateBigintId } from '@/common/utils/validate-bigint-id';
import { createSlug } from '../utils/create-slug';
import { handleUniqueViolation } from '../utils/handle-unique-violation';
import { Brand } from './entities/brand.entity';
import { BrandResponseDto } from './dto/response-brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateBrandsBulkDto } from './dto/create-brands-bulk.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { parsePagination } from '@/common/utils/parse-pagination';
import { PaginatedResponse } from '@/common/types/paginationResponse.type';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly brands: Repository<Brand>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateBrandDto): Promise<BrandResponseDto> {
    await requireActiveUser(this.users, userId);

    const name = dto.name.trim();
    const slug = createSlug(name);

    try {
      const saved = await this.brands.save(this.brands.create({ name, slug, createdBy: userId }));
      return plainToInstance(BrandResponseDto, saved, { excludeExtraneousValues: true });
    } catch (error) {
      handleUniqueViolation(error, ['brands_name_not_deleted_unique', 'brands_slug_not_deleted_unique'], 'Tên hoặc slug thương hiệu đã được sử dụng');
    }
  }

  async createBulk(userId: string, dto: CreateBrandsBulkDto): Promise<BrandResponseDto[]> {
    await requireActiveUser(this.users, userId);
    const entries = dto.brands.map(({ name: inputName }) => {
      const name = inputName.trim();
      return { name, slug: createSlug(name), createdBy: userId };
    });
    if (new Set(entries.map((entry) => entry.slug)).size !== entries.length) {
      throw new ConflictException('Các thương hiệu trong danh sách có tên hoặc slug trùng nhau');
    }
    try {
      const saved = await this.brands.manager.transaction(async (manager) => {
        const repository = manager.getRepository(Brand);
        return repository.save(repository.create(entries));
      });
      return plainToInstance(BrandResponseDto, saved, { excludeExtraneousValues: true });
    } catch (error) {
      handleUniqueViolation(error, ['brands_name_not_deleted_unique', 'brands_slug_not_deleted_unique'], 'Tên hoặc slug thương hiệu đã được sử dụng');
    }
  }

  async findAll(filters: QueryBrandDto = {}): Promise<PaginatedResponse<BrandResponseDto>> {
    const { page, pageSize, skip } = parsePagination(filters.page, filters.pageSize);
    const query = this.brands.createQueryBuilder('brand').where('brand.isActive = :active', { active: true });
    const name = filters.name?.trim();
    if (name) {
      const escaped = name.replace(/[\\%_]/g, '\\$&');
      query.andWhere("brand.name ILIKE :name ESCAPE '\\'", { name: `%${escaped}%` });
    }
    const [brands, total] = await query.orderBy('brand.name', 'ASC').addOrderBy('brand.id', 'ASC')
      .skip(skip).take(pageSize).getManyAndCount();
    return { data: plainToInstance(BrandResponseDto, brands, { excludeExtraneousValues: true }), total, page, totalPages: Math.ceil(total / pageSize) };
  }

  async findOneById(id: string): Promise<BrandResponseDto> {
    validateBigintId(id, 'ID thương hiệu');
    const brand = await this.brands.findOne({ where: { id, isActive: true } });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');
    return plainToInstance(BrandResponseDto, brand, { excludeExtraneousValues: true });
  }

  async update(id: string, userId: string, dto: UpdateBrandDto): Promise<BrandResponseDto> {
    validateBigintId(id, 'ID thương hiệu');
    await requireActiveUser(this.users, userId);
    const name = dto.name.trim();
    const slug = createSlug(name);
    try {
      return await this.brands.manager.transaction(async (manager) => {
        const brands = manager.getRepository(Brand);
        const result = await brands.createQueryBuilder().update(Brand)
          .set({ name, slug, updatedBy: userId, version: () => '"version" + 1' })
          .where('id = :id AND version = :version AND is_active = true AND deleted_at IS NULL',
            { id, version: dto.version }).execute();
        if (!result.affected) {
          const existing = await brands.findOne({ where: { id } });
          if (!existing) throw new NotFoundException('Không tìm thấy thương hiệu');
          if (!existing.isActive) throw new ConflictException('Thương hiệu không hoạt động');
          throw new ConflictException('Phiên bản đã thay đổi, vui lòng tải lại');
        }
        const saved = await brands.findOneByOrFail({ id });
        return plainToInstance(BrandResponseDto, saved, { excludeExtraneousValues: true });
      });
    } catch (error) {
      handleUniqueViolation(error, ['brands_name_not_deleted_unique', 'brands_slug_not_deleted_unique'], 'Tên hoặc slug thương hiệu đã được sử dụng');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    validateBigintId(id, 'ID thương hiệu');
    await requireActiveUser(this.users, userId);
    const result = await this.brands.update(
      { id, deletedAt: IsNull() },
      { deletedAt: () => 'CURRENT_TIMESTAMP', deletedBy: userId },
    );
    if (!result.affected) throw new NotFoundException('Không tìm thấy thương hiệu');
  }
}
