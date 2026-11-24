import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Brackets, IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/response-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { isUUID } from 'class-validator';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { PaginatedResponse } from '@/common/types/paginationResponse.type';
import { UserStatus } from './enums/user-status.enum';
import { roleEnum } from '../roles/enums/roles.enum';
import { Role } from '../roles/entities/role.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private readonly repoUser: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password } = createUserDto;
    if (createUserDto.email) {
      const isExistingEmail = await this.repoUser
        .createQueryBuilder()
        .where('email =:email and is_Active =:active', { email, active: true })
        .getOne();
      if (isExistingEmail) {
        throw new ConflictException(
          'Email is existing please using another mail',
        );
      }
    }
    if (!password) {
      throw new BadRequestException('Password must be required');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = email.split('@')[0];
    const user = { ...createUserDto, passwordHash, fullName };
    const result = await this.repoUser
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(user)
      .returning('*')
      .execute();
    const mappedUsers = result.raw.map((row: any) => ({
      id: row.id,
      roleId: row.role_id,
      email: row.email,
      phoneNumber: row.phone_number,
      googleId: row.google_id,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      gender: row.gender,
      dateOfBirth: row.date_of_birth,
      status: row.status,
      lastLoginAt: row.last_login_at,
      version: row.version,

      // Metadata fields
      isActive: row.is_active,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    }));
    return plainToInstance(UserResponseDto, mappedUsers, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmailAndPassword(email: string) {
    return await this.repoUser
      .createQueryBuilder('user') // must be required when using select
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.passwordHash',
        'user.roleId',
        'user.status',
      ])
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :active', { active: true })
      .getOne();
  }
  async updateRefeshTokenKey(id: string, refreshToken: string | null) {
    let refreshTokenHash = null;
    if (refreshToken) {
      refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    }
    return await this.repoUser
      .createQueryBuilder()
      .update(User)
      .set({ refreshTokenHash })
      .andWhere('id =:id and is_active = :isActive and status=:status', { id, isActive: true,status:UserStatus.ACTIVE })
      .execute();
  }
  async findOneWithRefreshTokenKey(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Your ID does not match the UUID format.');
    }
    return await this.repoUser
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.roleId', 'user.refreshTokenHash'])
      .where('user.id= :id', { id })
      .andWhere('user.isActive =:active and user.status =:status', { active: true,status:UserStatus.ACTIVE })
      .getOne();
  }

  async findAll({ page = 1, search, role, gender, status }: FindUsersDto): Promise<PaginatedResponse<UserResponseDto>> {
    if (!Number.isSafeInteger(page) || page < 1 || page > 214748365) {
      throw new BadRequestException('page must be a positive integer');
    }
    const query = this.repoUser.createQueryBuilder('user')
      .where('user.isActive = :active', { active: true });
    const term = search?.trim();
    if (term) {
      const escaped = term.replace(/[\\%_]/g, '\\$&');
      query.andWhere(new Brackets((qb) => {
        qb.where('user.email ILIKE :search', { search: `%${escaped}%` })
          .orWhere('user.phoneNumber ILIKE :search')
          .orWhere('user.fullName ILIKE :search');
      }));
    }
    if (role) query.andWhere('user.roleId = :role', { role });
    if (gender) query.andWhere('user.gender = :gender', { gender });
    if(status) query.andWhere("user.status =:status",{status})
    const [users, total] = await query.orderBy('user.createdAt', 'DESC')
      .addOrderBy('user.id', 'DESC').skip((page - 1) * 10).take(10).getManyAndCount();
    return {
      data: plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true }),
      total, page, totalPages: Math.ceil(total / 10),
    };
  }

  async findOne(id: string) {
    return await this.repoUser
      .createQueryBuilder()
      .where({ id })
      .andWhere('is_active=:is_active and status=:status', { is_active: true, status:UserStatus.ACTIVE })
      .getOne();
  }

  async findOneForClient(id: string, userId: string): Promise<UserResponseDto> {
    if (id !== userId) throw new NotFoundException('User not found');
    const user = await this.repoUser.findOne({ where: { id, isActive: true ,status:UserStatus.ACTIVE } });
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateClientProfile(
    userId: string,
    dto: UpdateClientProfileDto,
  ): Promise<UserResponseDto> {
    if (dto.email === null)
      throw new BadRequestException('Email cannot be null');
    const user = await this.repoUser.findOne({
      where: { id: userId, isActive: true,status:UserStatus.ACTIVE },
    });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.repoUser.findOne({
        where: { email: dto.email, id: Not(userId) },
        withDeleted: true,
      });
      if (existing) throw new ConflictException('Email is already in use');
    }
    if (dto.phoneNumber != null && dto.phoneNumber !== user.phoneNumber) {
      const existing = await this.repoUser.findOne({
        where: { phoneNumber: dto.phoneNumber, id: Not(userId) },
        withDeleted: true,
      });
      if (existing)
        throw new ConflictException('Phone number is already in use');
    }
    // a good solution
    const { email, phoneNumber, fullName, avatarUrl, gender, dateOfBirth } =
      dto;
    const updated = this.repoUser.create({
      ...user,
      ...(email !== undefined && { email }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(fullName !== undefined && { fullName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && {
        dateOfBirth:
          dateOfBirth === null
            ? null
            : new Date(`${dateOfBirth}T00:00:00.000Z`),
      }),
      updatedBy: userId,
    });
    try {
      const saved = await this.repoUser.save(updated);
      return plainToInstance(UserResponseDto, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email or phone number is already in use');
      }
      throw error;
    }
  }

  async updateAccess(id: string, actorId: string, dto: UpdateUserAccessDto): Promise<UserResponseDto> {
    if (!isUUID(id)) throw new BadRequestException('User ID must be a UUID');
    if (dto.roleId === undefined && dto.status === undefined) throw new BadRequestException('Provide roleId or status');
    const actor = await requireActiveUser(this.repoUser, actorId);
    if (actor.roleId !== roleEnum.ADMIN) throw new ForbiddenException('Only administrators can update roles or status');
    return this.repoUser.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      if (dto.roleId !== undefined) {
        const role = await manager.getRepository(Role).findOne({ where: { id: dto.roleId, isActive: true } });
        if (!role) throw new NotFoundException('Active role not found');
      }
      const changes: Partial<User> = { updatedBy: actorId };
      if (dto.roleId !== undefined) changes.roleId = dto.roleId;
      if (dto.status !== undefined) changes.status = dto.status;
      if (dto.status === UserStatus.BLOCKED) changes.refreshTokenHash = null;
      const result = await users.update({ id, isActive: true, deletedAt: IsNull() }, changes);
      if (!result.affected) throw new NotFoundException('User not found');
      const user = await users.findOneByOrFail({ id });
      return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    });
  }

  async remove(userId: string): Promise<void> {
    const result = await this.repoUser.update(
      { id: userId, roleId: roleEnum.CLIENT, isActive: true, deletedAt: IsNull() },
      { isActive: false, deletedAt: () => 'CURRENT_TIMESTAMP', deletedBy: userId, updatedBy: userId, refreshTokenHash: null },
    );
    if (!result.affected) throw new NotFoundException('Account not found or already deleted');
  }
}
