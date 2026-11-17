import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserAddress } from './entities/user-address.entity';
import { Province } from '../province/entities/province.entity';
import { Ward } from '../ward/entities/ward.entity';
import { UserAddressResponseDto } from './dto/response-user-address.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { PaginatedResponse } from '@/common/types/paginationResponse.type';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly addresses: Repository<UserAddress>,
    @InjectRepository(Province)
    private readonly provinces: Repository<Province>,
    @InjectRepository(Ward) private readonly wards: Repository<Ward>,
  ) {}

  async create(
    userId: string,
    dto: CreateUserAddressDto,
  ): Promise<UserAddressResponseDto> {
    if (userId !== dto.userId)
      throw new ForbiddenException('Cannot create an address for another user');
    if (!dto.provinceId)
      throw new BadRequestException('provinceId is required');

    const province = await this.provinces.findOneBy({ id: dto.provinceId });
    if (!province) throw new NotFoundException('Province not found');

    let ward: Ward | null = null;
    if (dto.wardId != null) {
      ward = await this.wards.findOneBy({ id: dto.wardId });
      if (!ward) throw new NotFoundException('Ward not found');
      if (ward.provinceId !== province.id)
        throw new BadRequestException('Ward does not belong to province');
    }

    const address = this.addresses.create({
      ...dto,
      userId, // Lấy từ JWT
      province,
      ward,
      addressDetail: dto.addressDetail ?? null,
      isDefault: dto.isDefault ?? false,
      createdBy: userId,
    });
    try {
      const saved = await this.addresses.save(address);
      return plainToInstance(UserAddressResponseDto, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'constraint' in error &&
        error.code === '23505' &&
        error.constraint === 'uq_user_addresses_one_default'
      ) {
        throw new ConflictException('User already has a default address');
      }
      throw error;
    }
  }

  async findAll(page: number, userId?: string): Promise<PaginatedResponse<UserAddressResponseDto>> {
    const pageSize = 5;
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger((page - 1) * pageSize)) {
      throw new BadRequestException('page must be a positive integer');
    }
    const [addresses, total] = await this.addresses.findAndCount({
      where: userId ? { userId, isActive: true } : { isActive: true },
      relations: { province: true, ward: true },
      order: { isDefault: 'DESC', createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      data: plainToInstance(UserAddressResponseDto, addresses, { excludeExtraneousValues: true }),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, userId: string): Promise<UserAddressResponseDto> {
    const address = await this.addresses.findOne({
      where: { id, userId, isActive: true },
      relations: { province: true, ward: true },
    });
    if (!address) throw new NotFoundException('Address not found');
    return plainToInstance(UserAddressResponseDto, address, { excludeExtraneousValues: true });
  }

  async findOneForAdmin(id: string): Promise<UserAddressResponseDto> {
    const address = await this.addresses.findOne({
      where: { id, isActive: true },
      relations: { province: true, ward: true },
    });
    if (!address) throw new NotFoundException('Address not found');
    return plainToInstance(UserAddressResponseDto, address, { excludeExtraneousValues: true });
  }

  async update(id: string, userId: string, dto: UpdateUserAddressDto): Promise<UserAddressResponseDto> {
    if (dto.userId !== undefined && dto.userId !== userId)
      throw new ForbiddenException('Cannot transfer an address to another user');
    if (dto.provinceId === null) throw new BadRequestException('provinceId is required');
    if (dto.isDefault === null) throw new BadRequestException('isDefault cannot be null');

    try {
      return await this.addresses.manager.transaction(async (manager) => {
        // Serialize default changes for this user, including when no default exists yet. 
        await manager.getRepository(User).findOne({ where: { id: userId }, lock: { mode: 'pessimistic_write' } });// main aim to lock avoid 2 request which change default 
        const addresses = manager.getRepository(UserAddress);
        const address = await addresses.findOne({ where: { id, userId, isActive: true }, relations: { province: true, ward: true } });
        if (!address) throw new NotFoundException('Address not found');

        let province = address.province;
        if (dto.provinceId !== undefined) {
          const requestedProvince = await manager.getRepository(Province).findOneBy({ id: dto.provinceId });
          if (!requestedProvince) throw new NotFoundException('Province not found');
          province = requestedProvince;
        }
        if (!province) throw new BadRequestException('provinceId is required');

        let ward = address.ward;
        if (dto.wardId !== undefined) {
          ward = dto.wardId === null ? null : await manager.getRepository(Ward).findOneBy({ id: dto.wardId });
          if (dto.wardId !== null && !ward) throw new NotFoundException('Ward not found');
        }
        if (ward && ward.provinceId !== province.id)
          throw new BadRequestException('Ward does not belong to province');

        if (dto.isDefault === true) {
          await addresses.update({ userId, id: Not(id), isDefault: true }, { isDefault: false, updatedBy: userId });
        }
        address.province = province;
        address.provinceId = province.id;
        address.ward = ward;
        address.wardId = ward?.id ?? null;
        if (dto.addressDetail !== undefined) address.addressDetail = dto.addressDetail;
        if (dto.isDefault !== undefined) address.isDefault = dto.isDefault;
        address.updatedBy = userId;
        const saved = await addresses.save(address);
        return plainToInstance(UserAddressResponseDto, saved, { excludeExtraneousValues: true });
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && 'constraint' in error &&
          error.code === '23505' && error.constraint === 'uq_user_addresses_one_default') {
        throw new ConflictException('User already has a default address');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.addresses.manager.transaction(async (manager) => {
      await manager.getRepository(User).findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      const result = await manager.getRepository(UserAddress).update(
        { id, userId, isActive: true, deletedAt: IsNull() },
        { deletedAt: () => 'CURRENT_TIMESTAMP', deletedBy: userId, isActive: false, isDefault: false },
      );
      if (!result.affected) throw new NotFoundException('Address not found');
    });
  }
}
