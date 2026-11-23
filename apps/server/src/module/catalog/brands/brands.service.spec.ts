import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandsService } from './brands.service';
import { UserStatus } from '@/module/user/enums/user-status.enum';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBrandsBulkDto } from './dto/create-brands-bulk.dto';

describe('BrandsService.create', () => {
  const brands = { create: vi.fn((value) => value), save: vi.fn() };
  const users = { findOne: vi.fn() };
  let service: BrandsService;

  beforeEach(() => {
    vi.resetAllMocks();
    brands.create.mockImplementation((value) => value);
    users.findOne.mockResolvedValue({ id: 'user-id', status: UserStatus.ACTIVE });
    brands.save.mockImplementation(async (value) => ({ ...value, id: '1', version: 1 }));
    service = new BrandsService(brands as never, users as never);
  });

  it('creates a brand with a normalized slug and creator', async () => {
    const result = await service.create('user-id', { name: ' Điện Máy ' });
    expect(brands.save).toHaveBeenCalledWith({ name: 'Điện Máy', slug: 'dien-may', createdBy: 'user-id' });
    expect(result).toMatchObject({ id: '1', slug: 'dien-may', version: 1 });
    expect(users.findOne).toHaveBeenCalledWith({ where: { id: 'user-id', isActive: true, deletedAt: expect.objectContaining({ _type: 'isNull' }) } });
  });

  it('rejects a missing or blocked user', async () => {
    users.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.create('user-id', { name: 'Brand' })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.create('user-id', { name: 'Brand' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(brands.save).not.toHaveBeenCalled();
  });

  it('rejects names without a usable slug', async () => {
    await expect(service.create('user-id', { name: '!!!' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps unique-index violations to a conflict', async () => {
    brands.save.mockRejectedValue({ code: '23505', constraint: 'brands_slug_not_deleted_unique' });
    await expect(service.create('user-id', { name: 'Brand' })).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('BrandsService.update', () => {
  const query = { update: vi.fn(), set: vi.fn(), where: vi.fn(), execute: vi.fn() };
  const brands = { createQueryBuilder: vi.fn(), findOne: vi.fn(), findOneByOrFail: vi.fn(), manager: { transaction: vi.fn() } };
  const users = { findOne: vi.fn() };
  let service: BrandsService;

  beforeEach(() => {
    vi.resetAllMocks();
    query.update.mockReturnValue(query);
    query.set.mockReturnValue(query);
    query.where.mockReturnValue(query);
    query.execute.mockResolvedValue({ affected: 1 });
    brands.createQueryBuilder.mockReturnValue(query);
    brands.findOneByOrFail.mockResolvedValue({ id: '1', name: 'Samsung', slug: 'samsung', version: 2 });
    brands.manager.transaction.mockImplementation(async (fn) => fn({ getRepository: () => brands }));
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    service = new BrandsService(brands as never, users as never);
  });

  it('checks version and active state in the update itself', async () => {
    const result = await service.update('1', 'user-id', { name: 'Samsung', version: 1 });
    expect(query.where).toHaveBeenCalledWith(
      'id = :id AND version = :version AND is_active = true AND deleted_at IS NULL',
      { id: '1', version: 1 },
    );
    expect(query.set).toHaveBeenCalledWith(expect.objectContaining({ updatedBy: 'user-id', name: 'Samsung' }));
    expect(result.version).toBe(2);
  });

  it('rejects a stale version or inactive brand', async () => {
    query.execute.mockResolvedValue({ affected: 0 });
    brands.findOne.mockResolvedValueOnce({ isActive: true }).mockResolvedValueOnce({ isActive: false });
    await expect(service.update('1', 'user-id', { name: 'Samsung', version: 1 })).rejects.toBeInstanceOf(ConflictException);
    await expect(service.update('1', 'user-id', { name: 'Samsung', version: 1 })).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a blocked user before updating', async () => {
    users.findOne.mockResolvedValue({ status: UserStatus.BLOCKED });
    await expect(service.update('1', 'user-id', { name: 'Samsung', version: 1 })).rejects.toBeInstanceOf(ForbiddenException);
    expect(brands.manager.transaction).not.toHaveBeenCalled();
  });
});

describe('BrandsService.findOneById', () => {
  const brands = { findOne: vi.fn() };
  const service = new BrandsService(brands as never, {} as never);

  beforeEach(() => vi.resetAllMocks());

  it('returns an active brand including its version', async () => {
    brands.findOne.mockResolvedValue({ id: '1', name: 'Samsung', version: 2 });
    const result = await service.findOneById('1');
    expect(brands.findOne).toHaveBeenCalledWith({ where: { id: '1', isActive: true } });
    expect(result).toMatchObject({ id: '1', version: 2 });
  });

  it('rejects invalid IDs and missing or inactive brands', async () => {
    await expect(service.findOneById('abc')).rejects.toBeInstanceOf(BadRequestException);
    brands.findOne.mockResolvedValue(null);
    await expect(service.findOneById('1')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('BrandsService.findAll', () => {
  it('filters active brands and returns the requested page', async () => {
    const query = { where: vi.fn(), andWhere: vi.fn(), orderBy: vi.fn(), addOrderBy: vi.fn(), skip: vi.fn(), take: vi.fn(), getManyAndCount: vi.fn() };
    for (const method of [query.where, query.andWhere, query.orderBy, query.addOrderBy, query.skip, query.take]) method.mockReturnValue(query);
    query.getManyAndCount.mockResolvedValueOnce([[{ id: '1', name: 'Samsung', version: 1, secret: 'hidden' }], 21]).mockResolvedValueOnce([[], 0]);
    const service = new BrandsService({ createQueryBuilder: vi.fn().mockReturnValue(query) } as never, {} as never);
    const result = await service.findAll({ page: '2', pageSize: '5', name: 'sam' });
    expect(result).toMatchObject({ data: [{ id: '1', name: 'Samsung' }], total: 21, page: 2, totalPages: 5 });
    expect(result.data[0]).not.toHaveProperty('secret');
    expect(query.where).toHaveBeenCalledWith('brand.isActive = :active', { active: true });
    expect(query.andWhere).toHaveBeenCalledWith("brand.name ILIKE :name ESCAPE '\\'", { name: '%sam%' });
    expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.take).toHaveBeenCalledWith(5);
    expect(await service.findAll()).toEqual({ data: [], total: 0, page: 1, totalPages: 0 });
    await expect(service.findAll({ pageSize: '0' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('BrandsService.remove', () => {
  const brands = { update: vi.fn() };
  const users = { findOne: vi.fn() };
  const service = new BrandsService(brands as never, users as never);

  beforeEach(() => {
    vi.resetAllMocks();
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    brands.update.mockResolvedValue({ affected: 1 });
  });

  it('soft-deletes with the authenticated user and only targets non-deleted records', async () => {
    await expect(service.remove('1', 'user-id')).resolves.toBeUndefined();
    expect(brands.update).toHaveBeenCalledWith(
      { id: '1', deletedAt: expect.objectContaining({ _type: 'isNull' }) },
      { deletedAt: expect.any(Function), deletedBy: 'user-id' },
    );
  });

  it('rejects invalid IDs, blocked users, and missing or deleted brands', async () => {
    await expect(service.remove('invalid', 'user-id')).rejects.toBeInstanceOf(BadRequestException);
    users.findOne.mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.remove('1', 'user-id')).rejects.toBeInstanceOf(ForbiddenException);
    brands.update.mockResolvedValueOnce({ affected: 0 });
    await expect(service.remove('1', 'user-id')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('BrandsService.createBulk', () => {
  const repository = { create: vi.fn((value) => value), save: vi.fn() };
  const brands = { manager: { transaction: vi.fn() } };
  const users = { findOne: vi.fn() };
  let service: BrandsService;

  beforeEach(() => {
    vi.resetAllMocks();
    repository.create.mockImplementation((value) => value);
    repository.save.mockImplementation(async (values) => values.map((value, i) => ({ ...value, id: String(i + 1), version: 1, secret: 'hidden' })));
    brands.manager.transaction.mockImplementation(async (fn) => fn({ getRepository: () => repository }));
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    service = new BrandsService(brands as never, users as never);
  });

  it('creates all brands in one transaction and exposes only response fields', async () => {
    const result = await service.createBulk('user-id', { brands: [{ name: ' Điện Máy ' }, { name: 'ASUS' }] });
    expect(repository.save).toHaveBeenCalledWith([
      { name: 'Điện Máy', slug: 'dien-may', createdBy: 'user-id' },
      { name: 'ASUS', slug: 'asus', createdBy: 'user-id' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]).not.toHaveProperty('secret');
    expect(brands.manager.transaction).toHaveBeenCalledOnce();
  });

  it('rejects duplicate slugs before writing', async () => {
    await expect(service.createBulk('user-id', { brands: [{ name: 'Điện máy' }, { name: 'Dien may' }] })).rejects.toBeInstanceOf(ConflictException);
    expect(brands.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejects blocked users and maps database uniqueness errors', async () => {
    users.findOne.mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.createBulk('user-id', { brands: [{ name: 'ASUS' }] })).rejects.toBeInstanceOf(ForbiddenException);
    repository.save.mockRejectedValueOnce({ code: '23505', constraint: 'brands_slug_not_deleted_unique' });
    await expect(service.createBulk('user-id', { brands: [{ name: 'ASUS' }] })).rejects.toBeInstanceOf(ConflictException);
  });

  it('validates the batch and each brand', async () => {
    for (const brands of [[], [{ name: ' ' }], [null], Array.from({ length: 101 }, () => ({ name: 'A' }))]) {
      expect((await validate(plainToInstance(CreateBrandsBulkDto, { brands }))).length).toBeGreaterThan(0);
    }
    expect(await validate(plainToInstance(CreateBrandsBulkDto, { brands: [{ name: 'ASUS' }] }))).toHaveLength(0);
  });
});
