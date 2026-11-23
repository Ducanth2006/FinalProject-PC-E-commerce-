import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, IsNull, Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';
import { validateBigintId } from '@/common/utils/validate-bigint-id';
import { createSlug } from '../utils/create-slug';
import { handleUniqueViolation } from '../utils/handle-unique-violation';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/response-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { PaginatedResponse } from '@/common/types/paginationResponse.type';
import { parsePagination } from '@/common/utils/parse-pagination';
import { lockCategoryTree } from './utils/lock-category-tree';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    await requireActiveUser(this.users, userId);
    const name = dto.name.trim();
    const slug = createSlug(name);
    const parentId = dto.parentId ?? null;
    if (parentId !== null) {
      validateBigintId(parentId, 'ID danh mục cha');
      const parent = await this.categories.findOne({ where: { id: parentId, isActive: true } });
      if (!parent) throw new NotFoundException('Không tìm thấy danh mục cha đang hoạt động');
    }
    try {
      const category = this.categories.create({ name, slug, parentId, createdBy: userId });
      const saved = await this.categories.save(category);
      return plainToInstance(CategoryResponseDto, saved, { excludeExtraneousValues: true });
    } catch (error) {
      handleUniqueViolation(error, ['categories_slug_active_unique'], 'Slug danh mục đã được sử dụng');
    }
  }

  async createBulk(userId: string, dto: CreateCategoriesDto): Promise<CategoryResponseDto[]> {
    await requireActiveUser(this.users, userId);
    const entries = dto.categories.map(({ name: inputName, parentId }) => {
      const name = inputName.trim();
      if (parentId != null) validateBigintId(parentId, 'ID danh mục cha');
      return { name, slug: createSlug(name), parentId: parentId ?? null, createdBy: userId };
    });
    const names = entries.map(({ name }) => name.normalize('NFC').toLowerCase());
    if (new Set(names).size !== names.length) {
      throw new ConflictException('Tên danh mục bị trùng trong danh sách');
    }
    if (new Set(entries.map(({ slug }) => slug)).size !== entries.length) {
      throw new ConflictException('Slug danh mục bị trùng trong danh sách');
    }
    const parentIds = [...new Set(entries.flatMap(({ parentId }) => parentId === null ? [] : [parentId]))];
    try {
      const saved = await this.categories.manager.transaction(async (manager) => {
        const categories = manager.getRepository(Category);
        if (parentIds.length) {
          const parents = await categories.find({ where: { id: In(parentIds), isActive: true } });
          if (parents.length !== parentIds.length) throw new NotFoundException('Không tìm thấy danh mục cha đang hoạt động');
        }
        return categories.save(categories.create(entries));
      });
      return plainToInstance(CategoryResponseDto, saved, { excludeExtraneousValues: true });
    } catch (error) {
      handleUniqueViolation(error, ['categories_slug_active_unique'], 'Slug danh mục đã được sử dụng');
    }
  }

  async findAll(filters: QueryCategoryDto = {}): Promise<PaginatedResponse<CategoryResponseDto>> {
    const { page, pageSize, skip } = parsePagination(filters.page, filters.pageSize);
    const query = this.categories.createQueryBuilder('category')
      .where('category.isActive = :active', { active: true });
    const name = filters.name?.trim();
    if (name) {
      const escaped = name.replace(/[\\%_]/g, '\\$&');
      query.andWhere("category.name ILIKE :name ESCAPE '\\'", { name: `%${escaped}%` });
    }
    if (filters.slug !== undefined) query.andWhere('category.slug = :slug', { slug: filters.slug });
    if (filters.parentSlug !== undefined) {
      query.innerJoin('category.parent', 'parent', 'parent.isActive = :parentActive', { parentActive: true })
        .andWhere('parent.slug = :parentSlug', { parentSlug: filters.parentSlug });
    }
    const [categories, total] = await query.orderBy('category.name', 'ASC').addOrderBy('category.id', 'ASC')
      .skip(skip).take(pageSize).getManyAndCount();
    return {
      data: plainToInstance(CategoryResponseDto, categories, { excludeExtraneousValues: true }),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    validateBigintId(id, 'ID danh mục');
    const category = await this.categories.findOne({ where: { id, isActive: true } });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    validateBigintId(id, 'ID danh mục');
    await requireActiveUser(this.users, userId);
    if (dto.name === undefined && dto.parentId === undefined) throw new BadRequestException('Cần cung cấp tên hoặc danh mục cha');
    if (dto.parentId != null) validateBigintId(dto.parentId, 'ID danh mục cha');
    const name = dto.name?.trim();
    const slug = name === undefined ? undefined : createSlug(name);
    try {
      return await this.categories.manager.transaction(async (manager) => {
        const categories = manager.getRepository(Category);
        if (dto.parentId !== undefined) {
          await lockCategoryTree(manager);
        }
        if (dto.parentId != null) {
          if (dto.parentId === id) throw new BadRequestException('Danh mục không thể là cha của chính nó');
          const parent = await categories.findOne({ where: { id: dto.parentId, isActive: true }, lock: { mode: 'pessimistic_read' } });
          if (!parent) throw new NotFoundException('Không tìm thấy danh mục cha đang hoạt động');
          const cycle: unknown[] = await manager.query(
            'WITH RECURSIVE ancestors AS (SELECT id, parent_id FROM categories WHERE id = $1 UNION SELECT c.id, c.parent_id FROM categories c JOIN ancestors a ON c.id = a.parent_id) SELECT id FROM ancestors WHERE id = $2',
            [dto.parentId, id],
          );
          if (cycle.length) throw new BadRequestException('Không thể chọn danh mục con làm danh mục cha');
        }
        if (name !== undefined) {
          const duplicate = await categories.createQueryBuilder('category')
            .where('category.isActive = :active AND category.id != :id', { active: true, id })
            .andWhere('LOWER(category.name) = LOWER(:name)', { name }).getOne();
          if (duplicate) throw new ConflictException('Tên danh mục đã được sử dụng');
        }
        const changes: { name?: string; slug?: string; parentId?: string | null; updatedBy: string; version: () => string } = {
          updatedBy: userId, version: () => '"version" + 1',
        };
        if (name !== undefined) { changes.name = name; changes.slug = slug; }
        if (dto.parentId !== undefined) changes.parentId = dto.parentId;
        const result = await categories.createQueryBuilder().update(Category).set(changes)
          .where('id = :id AND version = :version AND is_active = true AND deleted_at IS NULL', { id, version: dto.version }).execute();
        if (!result.affected) {
          const existing = await categories.findOne({ where: { id } });
          if (!existing) throw new NotFoundException('Không tìm thấy danh mục');
          if (!existing.isActive) throw new ConflictException('Danh mục không hoạt động');
          throw new ConflictException('Phiên bản đã thay đổi, vui lòng tải lại');
        }
        const saved = await categories.findOneByOrFail({ id });
        return plainToInstance(CategoryResponseDto, saved, { excludeExtraneousValues: true });
      });
    } catch (error) {
      handleUniqueViolation(error, ['categories_slug_active_unique'], 'Tên hoặc slug danh mục đã được sử dụng');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    validateBigintId(id, 'ID danh mục');
    await requireActiveUser(this.users, userId);
    const result = await this.categories.update(
      { id, deletedAt: IsNull() },
      { deletedAt: () => 'CURRENT_TIMESTAMP', deletedBy: userId },
    );
    if (!result.affected) throw new NotFoundException('Không tìm thấy danh mục');
  }
}
