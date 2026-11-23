import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UserGender } from './enums/gender.enum';
import { vi } from 'vitest';
import { FindUsersDto } from './dto/find-users.dto';
import { plainToInstance } from 'class-transformer';
import { roleEnum } from '../roles/enums/roles.enum';
import { UserStatus } from './enums/user-status.enum';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { Role } from '../roles/entities/role.entity';

describe('findAll users', () => {
  it('applies search and filters, paginates by 10 and hides sensitive fields', async () => {
    const qb: any = {};
    for (const method of ['where', 'andWhere', 'orderBy', 'addOrderBy', 'skip', 'take']) qb[method] = vi.fn().mockReturnValue(qb);
    qb.getManyAndCount = vi.fn().mockResolvedValue([[{ id: 'u', passwordHash: 'secret' }], 21]);
    const service = new UserService({ createQueryBuilder: vi.fn().mockReturnValue(qb) } as any);
    const result = await service.findAll({ page: 2, search: ' An ', role: roleEnum.CLIENT, gender: UserGender.FEMALE });
    expect(qb.andWhere).toHaveBeenCalledWith('user.roleId = :role', { role: 'CLIENT' });
    expect(qb.andWhere).toHaveBeenCalledWith('user.gender = :gender', { gender: 'FEMALE' });
    expect(qb.skip).toHaveBeenCalledWith(10);
    expect(qb.take).toHaveBeenCalledWith(10);
    expect(result).toMatchObject({ total: 21, page: 2, totalPages: 3 });
    expect(result.data[0]).not.toHaveProperty('passwordHash');
  });

  it('validates page and filters', async () => {
    for (const input of [{ page: '0' }, { page: '1.5' }, { role: 'INVALID' }, { gender: 'INVALID' }, { search: ['a'] }]) {
      expect((await validate(plainToInstance(FindUsersDto, input))).length).toBeGreaterThan(0);
    }
    expect(await validate(plainToInstance(FindUsersDto, { page: '2' }))).toHaveLength(0);
  });
});

describe('remove client account', () => {
  it('atomically soft-deletes only the authenticated client and clears the refresh token', async () => {
    const repo = { update: vi.fn().mockResolvedValue({ affected: 1 }) };
    const service = new UserService(repo as any);
    await expect(service.remove('client-id')).resolves.toBeUndefined();
    const [where, changes] = repo.update.mock.calls[0];
    expect(where).toMatchObject({ id: 'client-id', roleId: roleEnum.CLIENT, isActive: true });
    expect(where.deletedAt.type).toBe('isNull');
    expect(changes).toMatchObject({ isActive: false, deletedBy: 'client-id', updatedBy: 'client-id', refreshTokenHash: null });
    expect(changes.deletedAt()).toBe('CURRENT_TIMESTAMP');
  });

  it('returns not found when the client is missing or already deleted', async () => {
    const service = new UserService({ update: vi.fn().mockResolvedValue({ affected: 0 }) } as any);
    await expect(service.remove('client-id')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: getRepositoryToken(User), useValue: {} }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('updateClientProfile', () => {
  const setup = () => {
    const user = { id: 'user', email: 'old@example.com', phoneNumber: '123', roleId: 'CLIENT', isActive: true };
    const repo = { findOne: vi.fn().mockResolvedValueOnce(user).mockResolvedValue(null), create: vi.fn((value) => value), save: vi.fn(async (value) => value) };
    return { service: new UserService(repo as any), repo };
  };
  it('updates only allowed fields, supports clearing phone and returns a DTO', async () => {
    const { service, repo } = setup();
    const result = await service.updateClientProfile('user', { phoneNumber: null, gender: UserGender.FEMALE, fullName: 'An', roleId: 'ADMIN' } as any);
    expect(result).toMatchObject({ id: 'user', phoneNumber: null, gender: UserGender.FEMALE, roleId: 'CLIENT' });
    expect(repo.save.mock.calls[0][0].updatedBy).toBe('user');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'user', isActive: true, status: 'ACTIVE' } });
  });
  it('rejects an existing email or phone number including deleted users', async () => {
    const email = setup();
    email.repo.findOne.mockResolvedValueOnce({ id: 'other' });
    await expect(email.service.updateClientProfile('user', { email: 'used@example.com' })).rejects.toBeInstanceOf(ConflictException);
    expect(email.repo.findOne.mock.calls[1][0].withDeleted).toBe(true);
    const phone = setup();
    phone.repo.findOne.mockResolvedValueOnce({ id: 'other' });
    await expect(phone.service.updateClientProfile('user', { phoneNumber: '456' })).rejects.toBeInstanceOf(ConflictException);
  });
  it('rejects a missing user, null email and a concurrent uniqueness conflict', async () => {
    const missing = setup();
    missing.repo.findOne.mockReset().mockResolvedValue(null);
    await expect(missing.service.updateClientProfile('user', {})).rejects.toBeInstanceOf(NotFoundException);
    await expect(missing.service.updateClientProfile('user', { email: null } as any)).rejects.toBeInstanceOf(BadRequestException);
    const concurrent = setup();
    concurrent.repo.save.mockRejectedValueOnce({ code: '23505' });
    await expect(concurrent.service.updateClientProfile('user', { fullName: 'An' })).rejects.toBeInstanceOf(ConflictException);
  });
  it('validates email null and gender against DTO rules', async () => {
    const dto = Object.assign(new UpdateClientProfileDto(), { email: null, gender: 'INVALID' });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['email', 'gender']));
  });
});

describe('visible user lookup', () => {
  const setup = () => {
    const repo = { findOne: vi.fn().mockResolvedValue({ id: 'client-id', email: 'client@example.com', passwordHash: 'secret', refreshTokenHash: 'secret' }) };
    return { service: new UserService(repo as any), repo };
  };

  it('enforces ownership for client lookups', async () => {
    const { service, repo } = setup();
    await service.findOneForClient('client-id', 'client-id');
    await expect(service.findOneForClient('other-id', 'client-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.findOne).toHaveBeenLastCalledWith({ where: { id: 'client-id', isActive: true, status: 'ACTIVE' } });
  });

  it('returns an active user without exposing secrets', async () => {
    const { service, repo } = setup();
    const result = await service.findOneForClient('client-id', 'client-id');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('refreshTokenHash');
    expect(repo.findOne).toHaveBeenLastCalledWith({ where: { id: 'client-id', isActive: true, status: 'ACTIVE' } });
  });
});

describe('updateAccess', () => {
  const id = '550e8400-e29b-41d4-a716-446655440000';
  const users = { update: vi.fn(), findOneByOrFail: vi.fn() };
  const roles = { findOne: vi.fn() };
  const repo = { findOne: vi.fn(), manager: { transaction: vi.fn() } };
  let service: UserService;
  beforeEach(() => {
    vi.resetAllMocks();
    repo.findOne.mockResolvedValue({ id: 'admin', roleId: roleEnum.ADMIN, status: UserStatus.ACTIVE });
    roles.findOne.mockResolvedValue({ id: roleEnum.STAFF_OPERATION });
    users.update.mockResolvedValue({ affected: 1 });
    users.findOneByOrFail.mockResolvedValue({ id, roleId: roleEnum.STAFF_OPERATION, status: UserStatus.BLOCKED, passwordHash: 'secret' });
    repo.manager.transaction.mockImplementation(async (fn) => fn({ getRepository: (entity) => entity === Role ? roles : users }));
    service = new UserService(repo as never);
  });
  it('updates role and status, records admin and clears refresh token on block', async () => {
    const result = await service.updateAccess(id, 'admin', { roleId: roleEnum.STAFF_OPERATION, status: UserStatus.BLOCKED });
    expect(users.update).toHaveBeenCalledWith(expect.objectContaining({ id, isActive: true }), { roleId: roleEnum.STAFF_OPERATION, status: UserStatus.BLOCKED, updatedBy: 'admin', refreshTokenHash: null });
    expect(result).toMatchObject({ id, status: UserStatus.BLOCKED });
    expect(result).not.toHaveProperty('passwordHash');
  });
  it('rejects unauthorized actors, missing roles and missing users', async () => {
    repo.findOne.mockResolvedValueOnce({ roleId: roleEnum.STAFF_OPERATION, status: UserStatus.ACTIVE });
    await expect(service.updateAccess(id, 'staff', { status: UserStatus.BLOCKED })).rejects.toBeInstanceOf(ForbiddenException);
    roles.findOne.mockResolvedValueOnce(null);
    await expect(service.updateAccess(id, 'admin', { roleId: roleEnum.ADMIN })).rejects.toBeInstanceOf(NotFoundException);
    users.update.mockResolvedValueOnce({ affected: 0 });
    await expect(service.updateAccess(id, 'admin', { status: UserStatus.ACTIVE })).rejects.toBeInstanceOf(NotFoundException);
  });
  it('validates enum values and requires at least one update', async () => {
    expect((await validate(plainToInstance(UpdateUserAccessDto, { roleId: null, status: 'UNKNOWN' }))).length).toBe(2);
    await expect(service.updateAccess(id, 'admin', {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
