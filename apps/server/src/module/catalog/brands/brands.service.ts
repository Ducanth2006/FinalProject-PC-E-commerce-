import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IsNull, Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';
import { validateBigintId } from '@/common/utils/validate-bigint-id';
import { createSlug } from '../utils/create-slug';
import { Brand } from './entities/brand.entity';
import { BrandResponseDto } from './dto/response-brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

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
      if (error && typeof error === 'object' && 'code' in error && 'constraint' in error &&
          error.code === '23505' && (error.constraint === 'brands_name_not_deleted_unique' ||
          error.constraint === 'brands_slug_not_deleted_unique')) {
        throw new ConflictException('Tên hoặc slug thương hiệu đã được sử dụng');
      }
      throw error;
    }
  }

  async findAll(): Promise<BrandResponseDto[]> {
    const brands = await this.brands.find({ where: { isActive: true }, order: { name: 'ASC', id: 'ASC' } });
    return plainToInstance(BrandResponseDto, brands, { excludeExtraneousValues: true });
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
      if (error && typeof error === 'object' && 'code' in error && 'constraint' in error &&
          error.code === '23505' && (error.constraint === 'brands_name_not_deleted_unique' ||
          error.constraint === 'brands_slug_not_deleted_unique')) {
        throw new ConflictException('Tên hoặc slug thương hiệu đã được sử dụng');
      }
      throw error;
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
